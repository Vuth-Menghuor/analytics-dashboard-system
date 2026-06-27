<?php

namespace App\Services\Analytics;

use App\Models\Analytics\MoodleCourse;
use App\Models\Analytics\MoodleEnrollment;
use App\Models\Analytics\MoodleStudent;
use App\Models\Analytics\MoodleTeacher;
use App\Models\Analytics\MoodleUserActivity;
use DateTimeInterface;

class SummaryAnalyticsService
{
    /**
     * @return array<string, mixed>
     */
    public function summary(?string $institution = null): array
    {
        if ($institution) {
            return $this->partnerSummary($institution);
        }

        $studentCounts = $this->studentStatusCounts();
        $userCounts = $this->userStatusCounts();
        $totalEnrollments = $this->studentEnrollmentQuery()->count();

        return [
            'totalStudents' => $studentCounts['total'],
            'totalTeachers' => MoodleTeacher::query()->count(),
            'totalCourses' => MoodleCourse::query()->where('id', '!=', 1)->count(),
            'totalActiveUsers' => $userCounts['active'],
            'totalInactiveUsers' => $userCounts['inactive'],
            'totalActiveStudents' => $studentCounts['active'],
            'totalInactiveStudents' => $studentCounts['inactive'],
            'totalEnrollments' => $totalEnrollments,
            'comparisons' => $this->comparisons($totalEnrollments),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function partnerSummary(string $institution): array
    {
        $studentCounts = $this->studentStatusCounts($institution);
        $totalEnrollments = MoodleEnrollment::query()
            ->from('analytics_clean.enrollments as e')
            ->join('analytics_clean.students as s', 's.id', '=', 'e.userid')
            ->where('s.deleted', 0)
            ->where('s.institution', $institution)
            ->count();

        return [
            'totalStudents' => $studentCounts['total'],
            'totalTeachers' => 0,
            'totalCourses' => $this->enrolledCourseCount($institution),
            'totalActiveUsers' => $studentCounts['active'],
            'totalInactiveUsers' => $studentCounts['inactive'],
            'totalActiveStudents' => $studentCounts['active'],
            'totalInactiveStudents' => $studentCounts['inactive'],
            'totalEnrollments' => $totalEnrollments,
            'comparisons' => $this->comparisons($totalEnrollments, $institution),
        ];
    }

    /**
     * @return array{total: int, active: int, inactive: int}
     */
    private function studentStatusCounts(?string $institution = null): array
    {
        $counts = MoodleStudent::query()
            ->where('deleted', 0)
            ->when($institution, fn ($query, string $institution) => $query->where('institution', $institution))
            ->selectRaw('count(*) as total')
            ->selectRaw('sum(case when suspended = 0 and confirmed = 1 then 1 else 0 end) as active')
            ->selectRaw('sum(case when suspended = 1 or confirmed = 0 then 1 else 0 end) as inactive')
            ->first();

        return [
            'total' => (int) ($counts->total ?? 0),
            'active' => (int) ($counts->active ?? 0),
            'inactive' => (int) ($counts->inactive ?? 0),
        ];
    }

    /**
     * @return array{active: int, inactive: int}
     */
    private function userStatusCounts(): array
    {
        $counts = MoodleUserActivity::query()
            ->where('deleted', 0)
            ->selectRaw('sum(case when suspended = 0 and confirmed = 1 then 1 else 0 end) as active')
            ->selectRaw('sum(case when suspended = 1 or confirmed = 0 then 1 else 0 end) as inactive')
            ->first();

        return [
            'active' => (int) ($counts->active ?? 0),
            'inactive' => (int) ($counts->inactive ?? 0),
        ];
    }

    private function enrolledCourseCount(string $institution): int
    {
        return MoodleEnrollment::query()
            ->from('analytics_clean.enrollments as e')
            ->join('analytics_clean.students as s', 's.id', '=', 'e.userid')
            ->where('s.deleted', 0)
            ->where('s.institution', $institution)
            ->where('e.courseid', '!=', 1)
            ->distinct()
            ->count('e.courseid');
    }

    /**
     * @return array<string, array<string, float|int|string|null>>
     */
    private function comparisons(int $totalEnrollments, ?string $institution = null): array
    {
        $currentMonthStart = now()->startOfMonth();
        $previousMonthStart = now()->subMonthNoOverflow()->startOfMonth();
        $currentMonthStartTimestamp = $currentMonthStart->timestamp;
        $previousMonthStartTimestamp = $previousMonthStart->timestamp;

        $students = $this->studentComparisonCounts(
            $previousMonthStartTimestamp,
            $currentMonthStartTimestamp,
            $institution,
        );
        $enrollments = $this->enrollmentComparisonCounts($previousMonthStart, $currentMonthStart, $institution);
        $courses = $this->courseComparisonCounts($previousMonthStart, $currentMonthStart, $institution);

        return [
            'activeStudents' => $this->countComparison($students['currentActive'], $students['previousActive']),
            'totalEnrollments' => $this->countComparison($enrollments['current'], $enrollments['previous']),
            'totalStudents' => $this->countComparison(
                $students['currentAccess'],
                $students['previousAccess'],
            ),
            'totalCourses' => $this->countComparison(
                $courses['current'],
                $courses['previous'],
            ),
        ];
    }

    /**
     * @return array{currentValue: int, previousValue: int, percentageChange: float|null, direction: string}
     */
    private function countComparison(int $currentValue, int $previousValue): array
    {
        return [
            'currentValue' => $currentValue,
            'previousValue' => $previousValue,
            'percentageChange' => $previousValue > 0
                ? round((($currentValue - $previousValue) * 100) / $previousValue, 1)
                : ($currentValue > 0 ? 100.0 : 0.0),
            'direction' => $currentValue > $previousValue
                ? 'up'
                : ($currentValue < $previousValue ? 'down' : 'neutral'),
        ];
    }

    private function studentEnrollmentQuery(?string $institution = null)
    {
        return MoodleEnrollment::query()
            ->from('analytics_clean.enrollments as e')
            ->join('analytics_clean.students as s', 's.id', '=', 'e.userid')
            ->where('s.deleted', 0)
            ->when($institution, fn ($query, string $institution) => $query->where('s.institution', $institution));
    }

    /**
     * @return array{currentActive: int, previousActive: int, currentAccess: int, previousAccess: int}
     */
    private function studentComparisonCounts(int $previousMonthStart, int $currentMonthStart, ?string $institution = null): array
    {
        $counts = MoodleStudent::query()
            ->where('deleted', 0)
            ->when($institution, fn ($query, string $institution) => $query->where('institution', $institution))
            ->selectRaw('sum(case when lastlogin >= ? then 1 else 0 end) as current_active', [$currentMonthStart])
            ->selectRaw('sum(case when lastlogin >= ? and lastlogin < ? then 1 else 0 end) as previous_active', [$previousMonthStart, $currentMonthStart])
            ->selectRaw('sum(case when lastaccess >= ? then 1 else 0 end) as current_access', [$currentMonthStart])
            ->selectRaw('sum(case when lastaccess >= ? and lastaccess < ? then 1 else 0 end) as previous_access', [$previousMonthStart, $currentMonthStart])
            ->first();

        return [
            'currentActive' => (int) ($counts->current_active ?? 0),
            'previousActive' => (int) ($counts->previous_active ?? 0),
            'currentAccess' => (int) ($counts->current_access ?? 0),
            'previousAccess' => (int) ($counts->previous_access ?? 0),
        ];
    }

    /**
     * @return array{current: int, previous: int}
     */
    private function enrollmentComparisonCounts(
        DateTimeInterface $previousMonthStart,
        DateTimeInterface $currentMonthStart,
        ?string $institution = null,
    ): array {
        $counts = $this->studentEnrollmentQuery($institution)
            ->selectRaw('sum(case when e.created_time >= ? then 1 else 0 end) as current', [$currentMonthStart])
            ->selectRaw('sum(case when e.created_time >= ? and e.created_time < ? then 1 else 0 end) as previous', [$previousMonthStart, $currentMonthStart])
            ->first();

        return [
            'current' => (int) ($counts->current ?? 0),
            'previous' => (int) ($counts->previous ?? 0),
        ];
    }

    /**
     * @return array{current: int, previous: int}
     */
    private function courseComparisonCounts(
        DateTimeInterface $previousMonthStart,
        DateTimeInterface $currentMonthStart,
        ?string $institution = null,
    ): array {
        $counts = MoodleCourse::query()
            ->from('analytics_clean.courses as c')
            ->when($institution, function ($query, string $institution): void {
                $query->join('analytics_clean.enrollments as e', 'e.courseid', '=', 'c.id')
                    ->join('analytics_clean.students as s', 's.id', '=', 'e.userid')
                    ->where('s.deleted', 0)
                    ->where('s.institution', $institution);
            })
            ->where('c.id', '!=', 1)
            ->selectRaw('count(distinct case when c.start_date >= ? then c.id end) as current', [$currentMonthStart])
            ->selectRaw('count(distinct case when c.start_date >= ? and c.start_date < ? then c.id end) as previous', [$previousMonthStart, $currentMonthStart])
            ->first();

        return [
            'current' => (int) ($counts->current ?? 0),
            'previous' => (int) ($counts->previous ?? 0),
        ];
    }
}
