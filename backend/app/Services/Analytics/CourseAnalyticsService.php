<?php

namespace App\Services\Analytics;

use App\Models\Analytics\MoodleCourse;
use App\Models\Analytics\MoodleEnrollment;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CourseAnalyticsService
{
    public function popularCourses(?string $institution = null, ?string $department = null): Collection
    {
        return MoodleCourse::query()
            ->from('analytics_clean.courses as c')
            ->join('analytics_clean.enrollments as e', 'e.courseid', '=', 'c.id')
            ->when($institution || $department, function ($query) use ($institution, $department): void {
                $query->join('analytics_clean.students as s', 's.id', '=', 'e.userid')
                    ->where('s.deleted', 0);

                if ($institution) {
                    $query->where('s.institution', $institution);
                }

                if ($department) {
                    $query->where('s.department', $department);
                }
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
        $courseGroupExpression = $this->courseGroupExpression();
        $enrollments = MoodleEnrollment::query()
            ->from('analytics_clean.enrollments as e')
            ->select('courseid')
            ->selectRaw('count(distinct userid) as total_enrollments')
            ->when($institution, fn ($query, string $institution) => $this->scopeEnrollmentQuery($query, $institution))
            ->groupBy('courseid');

        $institutions = MoodleEnrollment::query()
            ->from('analytics_clean.enrollments as e')
            ->join('analytics_clean.students as s', 's.id', '=', 'e.userid')
            ->where('s.deleted', 0)
            ->select('e.courseid')
            ->selectRaw("string_agg(distinct nullif(s.institution, ''), ', ' order by nullif(s.institution, '')) as institutes")
            ->when($institution, fn ($query, string $institution) => $query->where('s.institution', $institution))
            ->groupBy('e.courseid');

        $courseRows = MoodleCourse::query()
            ->from('analytics_clean.courses as c')
            ->leftJoinSub($enrollments, 'enrollments', 'enrollments.courseid', '=', 'c.id')
            ->leftJoinSub($institutions, 'institutions', 'institutions.courseid', '=', 'c.id')
            ->select([
                'c.id',
                'c.course_name',
                'c.raw_course_name',
                'c.shortname',
                'c.category_name',
            ])
            ->selectRaw($courseGroupExpression.' as course_group')
            ->selectRaw('coalesce(enrollments.total_enrollments, 0) as total_enrollments')
            ->selectRaw('institutions.institutes')
            ->when($institution, fn ($query) => $query->whereRaw('coalesce(enrollments.total_enrollments, 0) > 0'))
            ->orderBy('c.course_name')
            ->get();

        return $courseRows
            ->groupBy(fn ($row) => $this->courseGroupName($row))
            ->map(function (Collection $rows, string $groupName) {
                $categories = $rows
                    ->pluck('category_name')
                    ->filter()
                    ->unique()
                    ->values();
                $courseCount = $rows->count();
                $totalEnrollments = $rows->sum(fn ($row) => (int) $row->total_enrollments);
                $institutes = $rows
                    ->flatMap(fn ($row) => collect(explode(',', (string) $row->institutes))->map(fn ($value) => trim($value)))
                    ->filter()
                    ->unique()
                    ->sort(SORT_NATURAL | SORT_FLAG_CASE)
                    ->values();

                return [
                    'id' => (int) $rows->min('id'),
                    'name' => $groupName,
                    'shortName' => $rows->pluck('shortname')->filter()->first() ?: $groupName,
                    'category' => $this->compactListLabel($categories, 'No category'),
                    'categories' => $categories->all(),
                    'categoryCount' => $categories->count(),
                    'courseCount' => $courseCount,
                    'institute' => $this->compactListLabel($institutes, 'No institute'),
                    'institutes' => $institutes->all(),
                    'instituteCount' => $institutes->count(),
                    'status' => $totalEnrollments > 0 ? 'Active' : 'No enrollments',
                    'enrolled' => $totalEnrollments,
                    'views' => 0,
                    'moodleCourses' => $rows
                        ->sortBy('id')
                        ->map(fn ($row) => [
                            'id' => (int) $row->id,
                            'originalName' => $row->raw_course_name ?: $row->course_name,
                            'cleanName' => $row->course_name,
                            'shortName' => $row->shortname ?: $row->course_name,
                            'category' => $row->category_name ?: 'No category',
                            'enrollments' => (int) $row->total_enrollments,
                        ])
                        ->values()
                        ->all(),
                ];
            })
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values();
    }

    public function courseViews(?string $institution = null): Collection
    {
        return MoodleCourse::query()
            ->from('analytics_clean.courses as c')
            ->join('mdl_logstore_standard_log as l', 'l.courseid', '=', 'c.id')
            ->when($institution, function ($query, string $institution): void {
                $query->join('analytics_clean.students as s', 's.id', '=', 'l.userid')
                    ->where('s.deleted', 0)
                    ->where('s.institution', $institution);
            })
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
        $query->join('analytics_clean.students as s', 's.id', '=', 'e.userid')
            ->where('s.deleted', 0)
            ->where('s.institution', $institution);
    }

    private function courseGroupName($row): string
    {
        $groupName = trim((string) ($row->course_group ?: ''));

        if ($groupName !== '') {
            return $groupName;
        }

        return trim((string) ($row->course_name ?: $row->shortname ?: 'Untitled course'));
    }

    private function courseGroupExpression(): string
    {
        return $this->courseColumnExists('course_group')
            ? 'c.course_group'
            : 'c.proposed_course_family';
    }

    private function courseColumnExists(string $column): bool
    {
        return DB::connection('analytics')
            ->table('information_schema.columns')
            ->where('table_schema', 'analytics_clean')
            ->where('table_name', 'courses')
            ->where('column_name', $column)
            ->exists();
    }

    private function compactListLabel(Collection $values, string $emptyLabel): string
    {
        $count = $values->count();

        if ($count === 0) {
            return $emptyLabel;
        }

        $first = (string) $values->first();

        if ($count === 1) {
            return $first;
        }

        return sprintf('%s +%d more', $first, $count - 1);
    }
}
