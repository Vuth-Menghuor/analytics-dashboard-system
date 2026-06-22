<?php

namespace App\Services\Analytics;

use Carbon\CarbonImmutable;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class InstituteAnalyticsService
{
    private const NOT_FILLED_LABEL = 'Not filled';

    /**
     * @param  array{institution: ?string, department: ?string, dateFrom: ?string, dateTo: ?string}  $filters
     */
    public function overview(array $filters): array
    {
        $connection = DB::connection('analytics');
        $snapshotTimestamp = (int) ($connection
            ->table('analytics_clean.students')
            ->where('deleted', 0)
            ->max('lastlogin') ?? 0);
        $snapshotDate = $snapshotTimestamp > 0
            ? CarbonImmutable::createFromTimestamp($snapshotTimestamp)->toDateString()
            : null;
        $activeCutoff = $snapshotTimestamp > 0
            ? $snapshotTimestamp - (90 * 86400)
            : PHP_INT_MAX;

        $studentRows = $this->studentAggregate($filters, $activeCutoff);
        $enrollmentRows = $this->enrollmentAggregate($filters);
        $enrollmentsByInstitute = $enrollmentRows->keyBy('institution');

        $institutes = $studentRows
            ->map(function ($row) use ($enrollmentsByInstitute, $filters) {
                $enrollment = $enrollmentsByInstitute->get($row->institution);
                $students = (int) $row->students;
                $activeStudents = (int) $row->active_students;

                return [
                    'institution' => $row->institution,
                    'students' => $students,
                    'courses' => (int) ($enrollment?->courses ?? 0),
                    'enrollmentRecords' => (int) ($enrollment?->enrollment_records ?? 0),
                    'departments' => (int) $row->departments,
                    'activeStudents' => $activeStudents,
                    'activityRate' => $students > 0
                        ? round(($activeStudents * 100) / $students, 1)
                        : 0.0,
                    'lastActivity' => $row->last_activity
                        ? CarbonImmutable::createFromTimestamp((int) $row->last_activity)->toDateTimeString()
                        : null,
                    'rankEligible' => $row->institution !== self::NOT_FILLED_LABEL,
                ];
            })
            ->sortByDesc('students')
            ->values();
        $rank = 0;
        $institutes = $institutes
            ->map(function (array $row) use (&$rank) {
                $row['rank'] = $row['rankEligible'] ? ++$rank : null;

                return $row;
            });

        $totalStudents = $institutes->sum('students');
        $totalActiveStudents = $institutes->sum('activeStudents');
        $enrollmentSummary = $this->enrollmentSummary($filters);
        $selectedInstitute = $filters['institution']
            ?? ($institutes->first()['institution'] ?? null);

        return [
            'snapshotDate' => $snapshotDate,
            'filters' => [
                ...$filters,
                'selectedInstitute' => $selectedInstitute,
            ],
            'options' => [
                'institutes' => $this->institutionOptions(),
                'departments' => $this->departmentOptions($filters['institution']),
            ],
            'summary' => [
                'institutes' => $institutes
                    ->where('institution', '!=', self::NOT_FILLED_LABEL)
                    ->count(),
                'students' => $totalStudents,
                'courses' => (int) ($enrollmentSummary->courses ?? 0),
                'enrollmentRecords' => (int) ($enrollmentSummary->enrollment_records ?? 0),
                'activeStudents' => $totalActiveStudents,
                'activityRate' => $totalStudents > 0
                    ? round(($totalActiveStudents * 100) / $totalStudents, 1)
                    : 0.0,
            ],
            'institutes' => $institutes,
            'enrollmentTrend' => $this->enrollmentTrend($filters),
            'departments' => $this->departmentBreakdown($filters, $selectedInstitute),
            'topCourses' => $this->topCourses($filters, $selectedInstitute),
        ];
    }

    private function studentAggregate(array $filters, int $activeCutoff): Collection
    {
        return $this->applyStudentDimensions(
            DB::connection('analytics')
                ->table('analytics_clean.students as s')
                ->where('s.deleted', 0),
            $filters,
        )
            ->selectRaw($this->institutionExpression('s.institution').' as institution')
            ->selectRaw('count(distinct s.id) as students')
            ->selectRaw("count(distinct s.department) filter (where s.department is not null and btrim(s.department) <> '') as departments")
            ->selectRaw('count(distinct s.id) filter (where s.lastlogin >= ?) as active_students', [$activeCutoff])
            ->selectRaw('max(nullif(s.lastlogin, 0)) as last_activity')
            ->groupByRaw($this->institutionExpression('s.institution'))
            ->get();
    }

    private function enrollmentAggregate(array $filters): Collection
    {
        return $this->applyEnrollmentFilters(
            DB::connection('analytics')
                ->table('analytics_clean.enrollments as e')
                ->join('analytics_clean.students as s', 's.id', '=', 'e.userid')
                ->where('s.deleted', 0),
            $filters,
        )
            ->selectRaw($this->institutionExpression('s.institution').' as institution')
            ->selectRaw('count(*) as enrollment_records')
            ->selectRaw('count(distinct e.courseid) as courses')
            ->groupByRaw($this->institutionExpression('s.institution'))
            ->get();
    }

    private function enrollmentSummary(array $filters): ?object
    {
        return $this->applyEnrollmentFilters(
            DB::connection('analytics')
                ->table('analytics_clean.enrollments as e')
                ->join('analytics_clean.students as s', 's.id', '=', 'e.userid')
                ->where('s.deleted', 0),
            $filters,
        )
            ->selectRaw('count(*) as enrollment_records')
            ->selectRaw('count(distinct e.courseid) as courses')
            ->first();
    }

    private function enrollmentTrend(array $filters): Collection
    {
        return $this->applyEnrollmentFilters(
            DB::connection('analytics')
                ->table('analytics_clean.enrollments as e')
                ->join('analytics_clean.students as s', 's.id', '=', 'e.userid')
                ->where('s.deleted', 0)
                ->whereNotNull('e.created_time'),
            $filters,
        )
            ->selectRaw("to_char(date_trunc('month', e.created_time), 'YYYY-MM') as period")
            ->selectRaw('count(*) as enrollments')
            ->selectRaw('count(distinct e.userid) as students')
            ->groupByRaw("date_trunc('month', e.created_time)")
            ->orderByRaw("date_trunc('month', e.created_time)")
            ->get()
            ->map(fn ($row) => [
                'period' => $row->period,
                'enrollments' => (int) $row->enrollments,
                'students' => (int) $row->students,
            ]);
    }

    private function departmentBreakdown(array $filters, ?string $institution): Collection
    {
        $departmentFilters = [
            ...$filters,
            'institution' => $institution,
        ];

        $rows = $this->applyStudentDimensions(
            DB::connection('analytics')
                ->table('analytics_clean.students as s')
                ->where('s.deleted', 0),
            $departmentFilters,
        )
            ->selectRaw($this->departmentExpression('s.department').' as department')
            ->selectRaw('count(distinct s.id) as students')
            ->groupByRaw($this->departmentExpression('s.department'))
            ->orderByDesc('students')
            ->get();
        $total = $rows->sum(fn ($row) => (int) $row->students);

        return $rows->take(12)->map(fn ($row) => [
            'department' => $row->department,
            'students' => (int) $row->students,
            'share' => $total > 0
                ? round(((int) $row->students * 100) / $total, 1)
                : 0.0,
        ])->values();
    }

    private function topCourses(array $filters, ?string $institution): Collection
    {
        return $this->applyEnrollmentFilters(
            DB::connection('analytics')
                ->table('analytics_clean.enrollments as e')
                ->join('analytics_clean.students as s', 's.id', '=', 'e.userid')
                ->join('analytics_clean.courses as c', 'c.id', '=', 'e.courseid')
                ->where('s.deleted', 0),
            [
                ...$filters,
                'institution' => $institution,
            ],
        )
            ->selectRaw("coalesce(nullif(btrim(c.proposed_course_family), ''), c.course_name) as course")
            ->selectRaw('count(*) as enrollment_records')
            ->selectRaw('count(distinct e.userid) as students')
            ->groupByRaw("coalesce(nullif(btrim(c.proposed_course_family), ''), c.course_name)")
            ->orderByDesc('students')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'course' => $row->course,
                'students' => (int) $row->students,
                'enrollmentRecords' => (int) $row->enrollment_records,
            ]);
    }

    private function departmentOptions(?string $institution): Collection
    {
        return DB::connection('analytics')
            ->table('analytics_clean.students as s')
            ->where('s.deleted', 0)
            ->when($institution, fn (Builder $query, string $value) => $this->applyDimension($query, 's.institution', $value))
            ->selectRaw($this->departmentExpression('s.department').' as department')
            ->distinct()
            ->orderBy('department')
            ->pluck('department');
    }

    private function institutionOptions(): Collection
    {
        return DB::connection('analytics')
            ->table('analytics_clean.students as s')
            ->where('s.deleted', 0)
            ->selectRaw($this->institutionExpression('s.institution').' as institution')
            ->distinct()
            ->orderBy('institution')
            ->pluck('institution');
    }

    private function applyEnrollmentFilters(Builder $query, array $filters): Builder
    {
        $this->applyStudentDimensions($query, $filters);

        return $query
            ->when($filters['dateFrom'], fn (Builder $query, string $date) => $query->whereDate('e.created_time', '>=', $date))
            ->when($filters['dateTo'], fn (Builder $query, string $date) => $query->whereDate('e.created_time', '<=', $date));
    }

    private function applyStudentDimensions(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['institution'], fn (Builder $query, string $value) => $this->applyDimension($query, 's.institution', $value))
            ->when($filters['department'], fn (Builder $query, string $value) => $this->applyDimension($query, 's.department', $value));
    }

    private function applyDimension(Builder $query, string $column, string $value): Builder
    {
        if ($value === self::NOT_FILLED_LABEL) {
            return $query->where(fn (Builder $query) => $query
                ->whereNull($column)
                ->orWhereRaw("btrim({$column}) = ''"));
        }

        return $query->where($column, $value);
    }

    private function institutionExpression(string $column): string
    {
        return "coalesce(nullif(btrim({$column}), ''), '".self::NOT_FILLED_LABEL."')";
    }

    private function departmentExpression(string $column): string
    {
        return "coalesce(nullif(btrim({$column}), ''), '".self::NOT_FILLED_LABEL."')";
    }
}
