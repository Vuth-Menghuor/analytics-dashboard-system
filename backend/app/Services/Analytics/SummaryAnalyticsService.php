<?php

namespace App\Services\Analytics;

use App\Models\Analytics\MoodleCourse;
use App\Models\Analytics\MoodleCourseCompletion;
use App\Models\Analytics\MoodleEnrollment;
use App\Models\Analytics\MoodleStudent;
use App\Models\Analytics\MoodleTeacher;
use App\Models\Analytics\MoodleUserActivity;
use Illuminate\Support\Facades\DB;

class SummaryAnalyticsService
{
    /**
     * @return array<string, int>
     */
    public function summary(?string $institution = null): array
    {
        if ($institution) {
            return $this->partnerSummary($institution);
        }

        return [
            'totalStudents' => MoodleStudent::query()->where('deleted', 0)->count(),
            'totalTeachers' => MoodleTeacher::query()->count(),
            'totalCourses' => MoodleCourse::query()->where('id', '!=', 1)->count(),
            'totalActiveUsers' => MoodleUserActivity::query()
                ->where('deleted', 0)
                ->where('suspended', 0)
                ->where('confirmed', 1)
                ->count(),
            'totalInactiveUsers' => MoodleUserActivity::query()
                ->where('deleted', 0)
                ->where(function ($query): void {
                    $query->where('suspended', 1)
                        ->orWhere('confirmed', 0)
                        ->orWhere('last_login_time', 'Never logged in');
                })
                ->count(),
            'totalActiveStudents' => MoodleStudent::query()
                ->where('deleted', 0)
                ->where('suspended', 0)
                ->where('confirmed', 1)
                ->count(),
            'totalInactiveStudents' => MoodleStudent::query()
                ->where('deleted', 0)
                ->where(function ($query): void {
                    $query->where('suspended', 1)
                        ->orWhere('confirmed', 0)
                        ->orWhere('lastlogin', 0);
                })
                ->count(),
            'totalEnrollments' => MoodleEnrollment::query()->count(),
            'totalCourseCompletions' => MoodleCourseCompletion::query()
                ->whereNotNull('timecompleted')
                ->count(),
            'totalQuizAttempts' => DB::connection('analytics')->table('mdl_quiz_attempts')->count(),
            'totalAssignmentsSubmitted' => DB::connection('analytics')->table('mdl_assign_submission')->count(),
        ];
    }

    /**
     * @return array<string, int>
     */
    private function partnerSummary(string $institution): array
    {
        $studentIds = MoodleStudent::query()
            ->select('id')
            ->where('deleted', 0)
            ->where('institution', $institution);

        $courseIds = MoodleEnrollment::query()
            ->from('vw_moodle_enrollments as e')
            ->join('vw_moodle_students as s', 's.id', '=', 'e.userid')
            ->where('s.deleted', 0)
            ->where('s.institution', $institution)
            ->distinct()
            ->pluck('e.courseid');

        return [
            'totalStudents' => MoodleStudent::query()
                ->where('deleted', 0)
                ->where('institution', $institution)
                ->count(),
            'totalTeachers' => 0,
            'totalCourses' => $courseIds->filter(fn ($courseId) => (int) $courseId !== 1)->count(),
            'totalActiveUsers' => MoodleStudent::query()
                ->where('deleted', 0)
                ->where('institution', $institution)
                ->where('suspended', 0)
                ->where('confirmed', 1)
                ->count(),
            'totalInactiveUsers' => MoodleStudent::query()
                ->where('deleted', 0)
                ->where('institution', $institution)
                ->where(function ($query): void {
                    $query->where('suspended', 1)
                        ->orWhere('confirmed', 0)
                        ->orWhere('lastlogin', 0);
                })
                ->count(),
            'totalActiveStudents' => MoodleStudent::query()
                ->where('deleted', 0)
                ->where('institution', $institution)
                ->where('suspended', 0)
                ->where('confirmed', 1)
                ->count(),
            'totalInactiveStudents' => MoodleStudent::query()
                ->where('deleted', 0)
                ->where('institution', $institution)
                ->where(function ($query): void {
                    $query->where('suspended', 1)
                        ->orWhere('confirmed', 0)
                        ->orWhere('lastlogin', 0);
                })
                ->count(),
            'totalEnrollments' => MoodleEnrollment::query()
                ->from('vw_moodle_enrollments as e')
                ->join('vw_moodle_students as s', 's.id', '=', 'e.userid')
                ->where('s.deleted', 0)
                ->where('s.institution', $institution)
                ->count(),
            'totalCourseCompletions' => MoodleCourseCompletion::query()
                ->whereIn('userid', $studentIds)
                ->whereNotNull('timecompleted')
                ->count(),
            'totalQuizAttempts' => DB::connection('analytics')
                ->table('mdl_quiz_attempts as qa')
                ->join('vw_moodle_students as s', 's.id', '=', 'qa.userid')
                ->where('s.deleted', 0)
                ->where('s.institution', $institution)
                ->count(),
            'totalAssignmentsSubmitted' => DB::connection('analytics')
                ->table('mdl_assign_submission as sub')
                ->join('vw_moodle_students as s', 's.id', '=', 'sub.userid')
                ->where('s.deleted', 0)
                ->where('s.institution', $institution)
                ->count(),
        ];
    }
}
