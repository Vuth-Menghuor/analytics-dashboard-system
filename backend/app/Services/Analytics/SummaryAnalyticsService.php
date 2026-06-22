<?php

namespace App\Services\Analytics;

use App\Models\Analytics\MoodleCourse;
use App\Models\Analytics\MoodleCourseCompletion;
use App\Models\Analytics\MoodleEnrollment;
use App\Models\Analytics\MoodleStudent;
use App\Models\Analytics\MoodleTeacher;
use App\Models\Analytics\MoodleUserActivity;
use DateTimeInterface;
use Illuminate\Support\Facades\DB;

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

        $totalStudents = MoodleStudent::query()->where('deleted', 0)->count();
        $totalEnrollments = $this->studentEnrollmentQuery()->count();
        $totalCourseCompletions = $this->studentCompletionQuery()
            ->whereNotNull('timecompleted')
            ->count();

        return [
            'totalStudents' => $totalStudents,
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
                        ->orWhere('confirmed', 0);
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
                        ->orWhere('confirmed', 0);
                })
                ->count(),
            'totalEnrollments' => $totalEnrollments,
            'totalCourseCompletions' => $totalCourseCompletions,
            'totalQuizAttempts' => DB::connection('analytics')
                ->table('mdl_quiz_attempts as qa')
                ->join('analytics_clean.students as s', 's.id', '=', 'qa.userid')
                ->where('s.deleted', 0)
                ->count(),
            'totalAssignmentsSubmitted' => DB::connection('analytics')
                ->table('mdl_assign_submission as sub')
                ->join('analytics_clean.students as s', 's.id', '=', 'sub.userid')
                ->where('s.deleted', 0)
                ->count(),
            'comparisons' => $this->comparisons($totalEnrollments),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function partnerSummary(string $institution): array
    {
        $studentIds = MoodleStudent::query()
            ->select('id')
            ->where('deleted', 0)
            ->where('institution', $institution);

        $courseIds = MoodleEnrollment::query()
            ->from('analytics_clean.enrollments as e')
            ->join('analytics_clean.students as s', 's.id', '=', 'e.userid')
            ->where('s.deleted', 0)
            ->where('s.institution', $institution)
            ->distinct()
            ->pluck('e.courseid');
        $totalEnrollments = MoodleEnrollment::query()
            ->from('analytics_clean.enrollments as e')
            ->join('analytics_clean.students as s', 's.id', '=', 'e.userid')
            ->where('s.deleted', 0)
            ->where('s.institution', $institution)
            ->count();
        $totalCourseCompletions = MoodleCourseCompletion::query()
            ->whereIn('userid', $studentIds)
            ->whereNotNull('timecompleted')
            ->count();

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
                        ->orWhere('confirmed', 0);
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
                        ->orWhere('confirmed', 0);
                })
                ->count(),
            'totalEnrollments' => $totalEnrollments,
            'totalCourseCompletions' => $totalCourseCompletions,
            'totalQuizAttempts' => DB::connection('analytics')
                ->table('mdl_quiz_attempts as qa')
                ->join('analytics_clean.students as s', 's.id', '=', 'qa.userid')
                ->where('s.deleted', 0)
                ->where('s.institution', $institution)
                ->count(),
            'totalAssignmentsSubmitted' => DB::connection('analytics')
                ->table('mdl_assign_submission as sub')
                ->join('analytics_clean.students as s', 's.id', '=', 'sub.userid')
                ->where('s.deleted', 0)
                ->where('s.institution', $institution)
                ->count(),
            'comparisons' => $this->comparisons($totalEnrollments, $institution),
        ];
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

        $currentActiveStudents = $this->studentPeriodCount('lastlogin', $currentMonthStartTimestamp, null, $institution);
        $previousActiveStudents = $this->studentPeriodCount('lastlogin', $previousMonthStartTimestamp, $currentMonthStartTimestamp, $institution);
        $currentEnrollments = $this->enrollmentPeriodCount($currentMonthStart, null, $institution);
        $previousEnrollments = $this->enrollmentPeriodCount($previousMonthStart, $currentMonthStart, $institution);
        $currentCompletionRate = $currentEnrollments > 0
            ? ($this->completionPeriodCount($currentMonthStartTimestamp, null, $institution) * 100) / $currentEnrollments
            : 0;
        $previousCompletionRate = $previousEnrollments > 0
            ? ($this->completionPeriodCount($previousMonthStartTimestamp, $currentMonthStartTimestamp, $institution) * 100) / $previousEnrollments
            : 0;

        return [
            'activeStudents' => $this->countComparison($currentActiveStudents, $previousActiveStudents),
            'courseCompletionRate' => $this->rateComparison($currentCompletionRate, $previousCompletionRate),
            'totalEnrollments' => $this->countComparison($currentEnrollments, $previousEnrollments),
            'totalStudents' => $this->countComparison(
                $this->studentPeriodCount('lastaccess', $currentMonthStartTimestamp, null, $institution),
                $this->studentPeriodCount('lastaccess', $previousMonthStartTimestamp, $currentMonthStartTimestamp, $institution),
            ),
            'totalCourses' => $this->countComparison(
                $this->coursePeriodCount($currentMonthStart, null, $institution),
                $this->coursePeriodCount($previousMonthStart, $currentMonthStart, $institution),
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

    /**
     * @return array{currentValue: float, previousValue: float, percentageChange: float, direction: string}
     */
    private function rateComparison(float $currentValue, float $previousValue): array
    {
        $change = round($currentValue - $previousValue, 1);

        return [
            'currentValue' => round($currentValue, 1),
            'previousValue' => round($previousValue, 1),
            'percentageChange' => $change,
            'direction' => $change > 0 ? 'up' : ($change < 0 ? 'down' : 'neutral'),
        ];
    }

    private function studentPeriodCount(string $column, int $from, ?int $to = null, ?string $institution = null): int
    {
        return MoodleStudent::query()
            ->where('deleted', 0)
            ->when($institution, fn ($query, string $institution) => $query->where('institution', $institution))
            ->where($column, '>=', $from)
            ->when($to, fn ($query, int $to) => $query->where($column, '<', $to))
            ->count();
    }

    private function enrollmentPeriodCount(DateTimeInterface $from, ?DateTimeInterface $to = null, ?string $institution = null): int
    {
        return $this->studentEnrollmentQuery($institution)
            ->where('e.created_time', '>=', $from)
            ->when($to, fn ($query, DateTimeInterface $to) => $query->where('e.created_time', '<', $to))
            ->count();
    }

    private function completionPeriodCount(int $from, ?int $to = null, ?string $institution = null): int
    {
        return $this->studentCompletionQuery($institution)
            ->whereNotNull('cc.timecompleted')
            ->where('cc.timecompleted', '>=', $from)
            ->when($to, fn ($query, int $to) => $query->where('cc.timecompleted', '<', $to))
            ->count();
    }

    private function studentEnrollmentQuery(?string $institution = null)
    {
        return MoodleEnrollment::query()
            ->from('analytics_clean.enrollments as e')
            ->join('analytics_clean.students as s', 's.id', '=', 'e.userid')
            ->where('s.deleted', 0)
            ->when($institution, fn ($query, string $institution) => $query->where('s.institution', $institution));
    }

    private function studentCompletionQuery(?string $institution = null)
    {
        return MoodleCourseCompletion::query()
            ->from('mdl_course_completions as cc')
            ->join('analytics_clean.students as s', 's.id', '=', 'cc.userid')
            ->where('s.deleted', 0)
            ->when($institution, fn ($query, string $institution) => $query->where('s.institution', $institution));
    }

    private function coursePeriodCount(DateTimeInterface $from, ?DateTimeInterface $to = null, ?string $institution = null): int
    {
        return MoodleCourse::query()
            ->from('analytics_clean.courses as c')
            ->when($institution, function ($query, string $institution): void {
                $query->join('analytics_clean.enrollments as e', 'e.courseid', '=', 'c.id')
                    ->join('analytics_clean.students as s', 's.id', '=', 'e.userid')
                    ->where('s.deleted', 0)
                    ->where('s.institution', $institution);
            })
            ->where('c.id', '!=', 1)
            ->where('c.start_date', '>=', $from)
            ->when($to, fn ($query, DateTimeInterface $to) => $query->where('c.start_date', '<', $to))
            ->distinct('c.id')
            ->count('c.id');
    }
}
