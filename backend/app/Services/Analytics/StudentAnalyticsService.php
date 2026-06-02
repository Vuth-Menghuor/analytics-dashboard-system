<?php

namespace App\Services\Analytics;

use App\Models\Analytics\MoodleCourseCompletion;
use App\Models\Analytics\MoodleEnrollment;
use App\Models\Analytics\MoodleStudent;
use App\Models\Analytics\MoodleStudentEnrol;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class StudentAnalyticsService
{
    private const STUDENT_GENDER_CASE = "
        case
            when gender is null
                or trim(gender) = ''
                or lower(trim(gender)) not in ('m', 'male', 'f', 'female')
            then 'Not filled'
            when lower(trim(gender)) in ('m', 'male') then 'Male'
            when lower(trim(gender)) in ('f', 'female') then 'Female'
        end
    ";

    public function studentsByInstitution(?string $institution = null): Collection
    {
        return $this->applyInstitutionScope(MoodleStudent::query(), $institution)
            ->select('institution')
            ->selectRaw('count(*) as total_students')
            ->where('deleted', 0)
            ->whereNotNull('institution')
            ->whereRaw("trim(institution) <> ''")
            ->groupBy('institution')
            ->orderByDesc('total_students')
            ->get()
            ->map(fn ($row) => [
                'institution' => $row->institution,
                'totalStudents' => (int) $row->total_students,
            ]);
    }

    public function students(array $filters = [], ?string $institutionScope = null): LengthAwarePaginator
    {
        $perPage = min(max((int) ($filters['perPage'] ?? 25), 1), 100);
        $search = trim((string) ($filters['search'] ?? ''));

        $query = $this->studentBaseQuery($institutionScope);

        if ($search !== '') {
            $query->where(function ($query) use ($search): void {
                $query->where('username', 'ilike', "%{$search}%")
                    ->orWhere('firstname', 'ilike', "%{$search}%")
                    ->orWhere('lastname', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        foreach ([
            'institution' => 'institution',
            'department' => 'department',
            'city' => 'city',
        ] as $filterKey => $column) {
            $value = trim((string) ($filters[$filterKey] ?? ''));

            if ($value !== '') {
                $query->where($column, $value);
            }
        }

        $gender = trim((string) ($filters['gender'] ?? ''));

        if ($gender !== '') {
            $query->whereExists(function ($query) use ($gender): void {
                $query->selectRaw('1')
                    ->from('mdl_student_enrol as se')
                    ->whereColumn('se.username', 'vw_moodle_students.username')
                    ->whereRaw('('.self::STUDENT_GENDER_CASE.') = ?', [$gender]);
            });
        }

        $status = strtolower(trim((string) ($filters['status'] ?? '')));

        if ($status === 'active') {
            $query->where('suspended', 0)
                ->where('confirmed', 1);
        }

        if ($status === 'inactive') {
            $query->where(function ($query): void {
                $query->where('suspended', 1)
                    ->orWhere('confirmed', 0)
                    ->orWhere('lastlogin', 0);
            });
        }

        return $query
            ->orderBy('firstname')
            ->orderBy('lastname')
            ->paginate($perPage)
            ->through(fn ($student) => $this->formatStudent($student));
    }

    public function student(int $id, ?string $institutionScope = null): ?array
    {
        $student = $this->studentBaseQuery($institutionScope)
            ->where('id', $id)
            ->first();

        return $student ? $this->formatStudent($student) : null;
    }

    public function studentsByDepartment(?string $institution = null): Collection
    {
        return $this->applyInstitutionScope(MoodleStudent::query(), $institution)
            ->select('institution', 'department')
            ->selectRaw('count(*) as total_students')
            ->selectRaw('round(count(*) * 100.0 / nullif(sum(count(*)) over (), 0), 2) as percentage')
            ->where('deleted', 0)
            ->whereNotNull('institution')
            ->whereRaw("trim(institution) <> ''")
            ->whereNotNull('department')
            ->whereRaw("trim(department) <> ''")
            ->groupBy('institution', 'department')
            ->orderByDesc('total_students')
            ->get()
            ->map(fn ($row) => [
                'institution' => $row->institution,
                'department' => $row->department,
                'totalStudents' => (int) $row->total_students,
                'percentage' => (float) $row->percentage,
            ]);
    }

    public function studentsByCity(?string $institution = null): Collection
    {
        return $this->applyInstitutionScope(MoodleStudent::query(), $institution)
            ->select('city')
            ->selectRaw('count(*) as total_students')
            ->where('deleted', 0)
            ->whereNotNull('city')
            ->whereRaw("trim(city) <> ''")
            ->groupBy('city')
            ->orderByDesc('total_students')
            ->get()
            ->map(fn ($row) => [
                'city' => $row->city,
                'totalStudents' => (int) $row->total_students,
            ]);
    }

    public function studentGender(?string $institution = null): Collection
    {
        $genderSubQuery = MoodleStudentEnrol::query()
            ->selectRaw('username')
            ->selectRaw('max('.self::STUDENT_GENDER_CASE.') as normalized_gender')
            ->groupBy('username');

        return MoodleStudent::query()
            ->from('vw_moodle_students as s')
            ->leftJoinSub($genderSubQuery, 'g', 'g.username', '=', 's.username')
            ->selectRaw("coalesce(g.normalized_gender, 'Not filled') as gender")
            ->selectRaw('count(distinct s.id) as total_students')
            ->selectRaw('round(count(distinct s.id) * 100.0 / nullif(sum(count(distinct s.id)) over (), 0), 2) as percentage')
            ->where('s.deleted', 0)
            ->when($institution, fn ($query, string $institution) => $query->where('s.institution', $institution))
            ->groupByRaw("coalesce(g.normalized_gender, 'Not filled')")
            ->orderByDesc('total_students')
            ->get()
            ->map(fn ($row) => [
                'gender' => $row->gender,
                'totalStudents' => (int) $row->total_students,
                'percentage' => (float) $row->percentage,
            ]);
    }

    private function studentBaseQuery(?string $institution = null): Builder
    {
        return $this->applyInstitutionScope(MoodleStudent::query(), $institution)
            ->select([
                'id',
                'username',
                'firstname',
                'lastname',
                'email',
                'institution',
                'department',
                'city',
                'suspended',
                'confirmed',
                'deleted',
                'lastlogin',
            ])
            ->selectSub(
                MoodleStudentEnrol::query()
                    ->from('mdl_student_enrol as se')
                    ->selectRaw(self::STUDENT_GENDER_CASE)
                    ->whereColumn('se.username', 'vw_moodle_students.username')
                    ->limit(1),
                'gender'
            )
            ->selectSub(
                MoodleEnrollment::query()
                    ->from('vw_moodle_enrollments as e')
                    ->selectRaw('count(*)')
                    ->whereColumn('e.userid', 'vw_moodle_students.id'),
                'enrollments'
            )
            ->selectSub(
                MoodleCourseCompletion::query()
                    ->from('mdl_course_completions as cc')
                    ->selectRaw('count(*)')
                    ->whereColumn('cc.userid', 'vw_moodle_students.id')
                    ->whereNotNull('cc.timecompleted'),
                'completions'
            )
            ->where('deleted', 0);
    }

    private function formatStudent($student): array
    {
        $isActive = (int) $student->suspended === 0 && (int) $student->confirmed === 1;

        return [
            'id' => (int) $student->id,
            'studentCode' => $student->username,
            'name' => trim("{$student->firstname} {$student->lastname}") ?: $student->username,
            'username' => $student->username,
            'email' => $student->email,
            'institute' => $student->institution ?: 'Not filled',
            'department' => $student->department ?: 'Not filled',
            'city' => $student->city ?: 'Not filled',
            'gender' => $student->gender ?: 'Not filled',
            'status' => $isActive ? 'Active' : 'Inactive',
            'confirmed' => (bool) $student->confirmed,
            'lastLogin' => (int) $student->lastlogin > 0
                ? now()->setTimestamp((int) $student->lastlogin)->toDateTimeString()
                : 'Never logged in',
            'enrollments' => (int) $student->enrollments,
            'completions' => (int) $student->completions,
            'averageGrade' => 0,
            'learningHours' => 0,
            'attendanceRate' => 0,
            'quizAverage' => 0,
            'assignmentSubmissionRate' => 0,
            'riskLevel' => $isActive ? 'Low' : 'High',
        ];
    }

    public function studentActivity(?string $institution = null): Collection
    {
        return $this->applyInstitutionScope(MoodleStudent::query(), $institution)
            ->selectRaw("
                case
                    when lastlogin = 0 then 'Never logged in'
                    when to_timestamp(lastlogin) >= now() - interval '7 days'
                        then 'Logged in within 1 week'
                    when to_timestamp(lastlogin) >= now() - interval '1 month'
                        then 'Logged in within 1 month'
                    when to_timestamp(lastlogin) >= now() - interval '3 months'
                        then 'Logged in within 3 months'
                    when to_timestamp(lastlogin) >= now() - interval '1 year'
                        then 'Logged in within 1 year'
                    else 'No login over 1 year'
                end as login_status
            ")
            ->selectRaw('count(*) as total_students')
            ->where('deleted', 0)
            ->groupBy('login_status')
            ->orderByDesc('total_students')
            ->get()
            ->map(fn ($row) => [
                'loginStatus' => $row->login_status,
                'totalStudents' => (int) $row->total_students,
            ]);
    }

    private function applyInstitutionScope(Builder $query, ?string $institution): Builder
    {
        return $query->when($institution, fn (Builder $query, string $institution) => $query->where('institution', $institution));
    }
}
