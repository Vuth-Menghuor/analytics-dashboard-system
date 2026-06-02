<?php

namespace App\Services\Analytics;

use App\Models\Analytics\MoodleCourse;
use App\Models\Analytics\MoodleCourseCompletion;
use App\Models\Analytics\MoodleEnrollment;
use Illuminate\Support\Collection;

class CourseAnalyticsService
{
    public function popularCourses(?string $institution = null): Collection
    {
        return MoodleCourse::query()
            ->from('vw_moodle_courses as c')
            ->join('vw_moodle_enrollments as e', 'e.courseid', '=', 'c.id')
            ->when($institution, function ($query, string $institution): void {
                $query->join('vw_moodle_students as s', 's.id', '=', 'e.userid')
                    ->where('s.deleted', 0)
                    ->where('s.institution', $institution);
            })
            ->select(['c.id', 'c.course_name'])
            ->selectRaw('count(distinct e.userid) as total_enrollments')
            ->where('c.id', '!=', 1)
            ->groupBy('c.id', 'c.course_name')
            ->orderByDesc('total_enrollments')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'courseName' => $row->course_name,
                'totalEnrollments' => (int) $row->total_enrollments,
            ]);
    }

    public function courses(?string $institution = null): Collection
    {
        $enrollments = MoodleEnrollment::query()
            ->from('vw_moodle_enrollments as e')
            ->select('courseid')
            ->selectRaw('count(distinct userid) as total_enrollments')
            ->when($institution, fn ($query, string $institution) => $this->scopeEnrollmentQuery($query, $institution))
            ->groupBy('courseid');

        $completions = MoodleCourseCompletion::query()
            ->from('mdl_course_completions as cc')
            ->selectRaw('course as courseid')
            ->selectRaw('count(distinct cc.userid) as completed_students')
            ->when($institution, function ($query, string $institution): void {
                $query->join('vw_moodle_students as s', 's.id', '=', 'cc.userid')
                    ->where('s.deleted', 0)
                    ->where('s.institution', $institution);
            })
            ->whereNotNull('timecompleted')
            ->groupBy('course');

        return MoodleCourse::query()
            ->from('vw_moodle_courses as c')
            ->leftJoinSub($enrollments, 'enrollments', 'enrollments.courseid', '=', 'c.id')
            ->leftJoinSub($completions, 'completions', 'completions.courseid', '=', 'c.id')
            ->select(['c.id', 'c.course_name', 'c.shortname', 'c.category', 'c.visible'])
            ->selectRaw('coalesce(enrollments.total_enrollments, 0) as total_enrollments')
            ->selectRaw('coalesce(completions.completed_students, 0) as completed_students')
            ->where('c.id', '!=', 1)
            ->when($institution, fn ($query) => $query->whereRaw('coalesce(enrollments.total_enrollments, 0) > 0'))
            ->orderBy('c.course_name')
            ->get()
            ->map(function ($row) {
                $enrollments = (int) $row->total_enrollments;
                $completed = (int) $row->completed_students;

                return [
                    'id' => (int) $row->id,
                    'name' => $row->course_name ?: $row->shortname,
                    'shortName' => $row->shortname ?: $row->course_name,
                    'category' => $row->category ? "Category {$row->category}" : 'Uncategorized',
                    'institute' => 'Moodle',
                    'status' => (int) $row->visible === 1 ? 'Visible' : 'Hidden',
                    'enrolled' => $enrollments,
                    'completed' => $completed,
                    'completionRate' => $enrollments > 0
                        ? round(($completed * 100) / $enrollments, 2)
                        : 0,
                    'views' => 0,
                ];
            });
    }

    public function courseCompletion(?string $institution = null): Collection
    {
        return MoodleCourse::query()
            ->from('vw_moodle_courses as c')
            ->join('vw_moodle_enrollments as e', 'e.courseid', '=', 'c.id')
            ->when($institution, function ($query, string $institution): void {
                $query->join('vw_moodle_students as s', 's.id', '=', 'e.userid')
                    ->where('s.deleted', 0)
                    ->where('s.institution', $institution);
            })
            ->leftJoin('mdl_course_completions as cc', function ($join): void {
                $join->on('cc.course', '=', 'c.id')
                    ->on('cc.userid', '=', 'e.userid')
                    ->whereNotNull('cc.timecompleted');
            })
            ->select(['c.id', 'c.course_name'])
            ->selectRaw('count(distinct e.userid) as total_enrolled_students')
            ->selectRaw('count(distinct cc.userid) as completed_students')
            ->selectRaw('round(count(distinct cc.userid)::numeric * 100 / nullif(count(distinct e.userid), 0), 2) as completion_rate_percentage')
            ->where('c.id', '!=', 1)
            ->groupBy('c.id', 'c.course_name')
            ->orderByDesc('completion_rate_percentage')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'courseName' => $row->course_name,
                'totalEnrolledStudents' => (int) $row->total_enrolled_students,
                'completedStudents' => (int) $row->completed_students,
                'completionRatePercentage' => (float) $row->completion_rate_percentage,
            ]);
    }

    public function courseViews(?string $institution = null): Collection
    {
        $courseIds = $institution ? $this->scopedTopCourseIdsByEnrollment($institution) : null;

        return MoodleCourse::query()
            ->from('vw_moodle_courses as c')
            ->join('mdl_logstore_standard_log as l', 'l.courseid', '=', 'c.id')
            ->when($courseIds, fn ($query, Collection $courseIds) => $query->whereIn('c.id', $courseIds))
            ->select(['c.id', 'c.course_name'])
            ->selectRaw('count(distinct l.id) as total_views')
            ->where('c.id', '!=', 1)
            ->groupBy('c.id', 'c.course_name')
            ->orderByDesc('total_views')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'courseName' => $row->course_name,
                'totalViews' => (int) $row->total_views,
            ]);
    }

    private function scopeEnrollmentQuery($query, string $institution): void
    {
        $query->join('vw_moodle_students as s', 's.id', '=', 'e.userid')
            ->where('s.deleted', 0)
            ->where('s.institution', $institution);
    }

    private function scopedCourseIds(string $institution): Collection
    {
        return MoodleEnrollment::query()
            ->from('vw_moodle_enrollments as e')
            ->join('vw_moodle_students as s', 's.id', '=', 'e.userid')
            ->where('s.deleted', 0)
            ->where('s.institution', $institution)
            ->where('e.courseid', '!=', 1)
            ->distinct()
            ->pluck('e.courseid');
    }

    private function scopedTopCourseIdsByEnrollment(string $institution): Collection
    {
        return MoodleEnrollment::query()
            ->from('vw_moodle_enrollments as e')
            ->join('vw_moodle_students as s', 's.id', '=', 'e.userid')
            ->where('s.deleted', 0)
            ->where('s.institution', $institution)
            ->where('e.courseid', '!=', 1)
            ->select('e.courseid')
            ->selectRaw('count(distinct e.userid) as total_enrollments')
            ->groupBy('e.courseid')
            ->orderByDesc('total_enrollments')
            ->limit(50)
            ->pluck('e.courseid');
    }
}
