<?php

namespace App\Services\Analytics;

use App\Models\Analytics\MoodleEnrollment;
use App\Models\Analytics\MoodleStudent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class StudentAnalyticsService
{
    private const NOT_FILLED_LABEL = 'Not filled';

    public function studentsByInstitution(array $filters = []): Collection
    {
        return $this->applyStudentFilters(MoodleStudent::query(), $filters)
            ->selectRaw("coalesce(nullif(trim(institution), ''), '".self::NOT_FILLED_LABEL."') as institution")
            ->selectRaw('count(distinct id) as total_students')
            ->where('deleted', 0)
            ->groupByRaw("coalesce(nullif(trim(institution), ''), '".self::NOT_FILLED_LABEL."')")
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
                $query->where('analytics_clean.students.username', 'ilike', "%{$search}%")
                    ->orWhere('analytics_clean.students.firstname', 'ilike', "%{$search}%")
                    ->orWhere('analytics_clean.students.lastname', 'ilike', "%{$search}%")
                    ->orWhere('u.email', 'ilike', "%{$search}%");
            });
        }

        $this->applyTextDimensionFilter($query, 'analytics_clean.students.institution', $filters['institution'] ?? null);
        $this->applyTextDimensionFilter($query, 'analytics_clean.students.department', $filters['department'] ?? null);
        $this->applyTextDimensionFilter($query, 'analytics_clean.students.city', $filters['city'] ?? null);

        $gender = trim((string) ($filters['gender'] ?? ''));

        if ($gender !== '') {
            $this->applyTextDimensionFilter($query, 'analytics_clean.students.gender', $gender);
        }

        $status = strtolower(trim((string) ($filters['status'] ?? '')));

        if ($status === 'active') {
            $query->where('analytics_clean.students.suspended', 0)
                ->where('analytics_clean.students.confirmed', 1);
        }

        if ($status === 'inactive') {
            $query->where(function ($query): void {
                $query->where('analytics_clean.students.suspended', 1)
                    ->orWhere('analytics_clean.students.confirmed', 0);
            });
        }

        return $query
            ->orderBy('analytics_clean.students.firstname')
            ->orderBy('analytics_clean.students.lastname')
            ->paginate($perPage)
            ->through(fn ($student) => $this->formatStudent($student));
    }

    public function student(int $id, ?string $institutionScope = null): ?array
    {
        $student = $this->studentBaseQuery($institutionScope)
            ->where('analytics_clean.students.id', $id)
            ->first();

        return $student ? $this->formatStudent($student) : null;
    }

    public function studentsByDepartment(array $filters = []): Collection
    {
        return $this->applyStudentFilters(MoodleStudent::query(), $filters)
            ->selectRaw("coalesce(nullif(trim(institution), ''), '".self::NOT_FILLED_LABEL."') as institution")
            ->selectRaw("coalesce(nullif(trim(department), ''), '".self::NOT_FILLED_LABEL."') as department")
            ->selectRaw('count(distinct id) as total_students')
            ->selectRaw('round(count(distinct id) * 100.0 / nullif(sum(count(distinct id)) over (), 0), 2) as percentage')
            ->where('deleted', 0)
            ->groupByRaw("coalesce(nullif(trim(institution), ''), '".self::NOT_FILLED_LABEL."')")
            ->groupByRaw("coalesce(nullif(trim(department), ''), '".self::NOT_FILLED_LABEL."')")
            ->orderByDesc('total_students')
            ->get()
            ->map(fn ($row) => [
                'institution' => $row->institution,
                'department' => $row->department,
                'totalStudents' => (int) $row->total_students,
                'percentage' => (float) $row->percentage,
            ]);
    }

    public function studentsByCity(array $filters = []): Collection
    {
        $totalStudents = (clone $this->applyStudentFilters(MoodleStudent::query(), $filters))
            ->where('deleted', 0)
            ->count();

        return $this->applyStudentFilters(MoodleStudent::query(), $filters)
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
                'overallTotalStudents' => $totalStudents,
            ]);
    }

    public function studentGender(array $filters = []): Collection
    {
        return MoodleStudent::query()
            ->from('analytics_clean.students as s')
            ->selectRaw("coalesce(s.gender, '".self::NOT_FILLED_LABEL."') as gender")
            ->selectRaw('count(distinct s.id) as total_students')
            ->selectRaw('round(count(distinct s.id) * 100.0 / nullif(sum(count(distinct s.id)) over (), 0), 2) as percentage')
            ->where('s.deleted', 0)
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('s.username', 'ilike', "%{$search}%")
                        ->orWhere('s.firstname', 'ilike', "%{$search}%")
                        ->orWhere('s.lastname', 'ilike', "%{$search}%")
                        ->orWhere('s.email', 'ilike', "%{$search}%");
                });
            })
            ->when($filters['institution'] ?? null, fn ($query, string $institution) => $this->applyTextDimensionFilter($query, 's.institution', $institution))
            ->when($filters['department'] ?? null, fn ($query, string $department) => $this->applyTextDimensionFilter($query, 's.department', $department))
            ->when($filters['city'] ?? null, fn ($query, string $city) => $this->applyTextDimensionFilter($query, 's.city', $city))
            ->when($filters['gender'] ?? null, fn ($query, string $gender) => $this->applyTextDimensionFilter($query, 's.gender', $gender))
            ->when(strtolower((string) ($filters['status'] ?? '')) === 'active', fn ($query) => $query->where('s.suspended', 0)->where('s.confirmed', 1))
            ->when(strtolower((string) ($filters['status'] ?? '')) === 'inactive', fn ($query) => $query->where(fn ($query) => $query->where('s.suspended', 1)->orWhere('s.confirmed', 0)))
            ->groupByRaw("coalesce(s.gender, '".self::NOT_FILLED_LABEL."')")
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
        $query = MoodleStudent::query()
            ->join('public.mdl_user as u', 'u.id', '=', 'analytics_clean.students.id');

        $this->applyTextDimensionFilter($query, 'analytics_clean.students.institution', $institution);

        return $query
            ->select([
                'analytics_clean.students.id',
                'analytics_clean.students.username',
                'analytics_clean.students.firstname',
                'analytics_clean.students.lastname',
                'u.email as email',
                'u.picture',
                'u.imagealt',
                'avatar_file.contenthash as avatar_contenthash',
                'avatar_file.mimetype as avatar_mimetype',
                'analytics_clean.students.institution',
                'analytics_clean.students.department',
                'analytics_clean.students.city',
                'analytics_clean.students.gender',
                'analytics_clean.students.suspended',
                'analytics_clean.students.confirmed',
                'analytics_clean.students.deleted',
                'analytics_clean.students.lastlogin',
            ])
            ->leftJoinSub(
                MoodleStudent::query()
                    ->from('mdl_files as f')
                    ->join('mdl_context as c', 'c.id', '=', 'f.contextid')
                    ->selectRaw('distinct on (c.instanceid) c.instanceid as user_id, f.contenthash, f.mimetype')
                    ->where('c.contextlevel', 30)
                    ->where('f.component', 'user')
                    ->where('f.filearea', 'icon')
                    ->where('f.filename', 'f1.jpg')
                    ->orderBy('c.instanceid')
                    ->orderByDesc('f.id'),
                'avatar_file',
                'avatar_file.user_id',
                '=',
                'analytics_clean.students.id',
            )
            ->selectSub(
                MoodleEnrollment::query()
                    ->from('analytics_clean.enrollments as e')
                    ->selectRaw('count(*)')
                    ->whereColumn('e.userid', 'analytics_clean.students.id'),
                'enrollments'
            )
            ->where('analytics_clean.students.deleted', 0);
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
            'avatarUrl' => $this->studentAvatarUrl(
                (int) $student->id,
                (int) $student->picture,
                $student->avatar_contenthash,
            ),
            'avatarAlt' => $student->imagealt,
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
            'learningHours' => 0,
            'attendanceRate' => 0,
            'riskLevel' => $isActive ? 'Low' : 'High',
        ];
    }

    public function studentAvatar(int $studentId, ?string $institutionScope = null): ?array
    {
        $student = $this->studentBaseQuery($institutionScope)
            ->where('analytics_clean.students.id', $studentId)
            ->first();

        if (! $student || (int) $student->picture <= 0 || ! $student->avatar_contenthash) {
            return null;
        }

        $path = $this->moodleFilePath($student->avatar_contenthash);

        if (! $path || ! is_file($path)) {
            return null;
        }

        return [
            'path' => $path,
            'mimeType' => $student->avatar_mimetype ?: 'image/jpeg',
        ];
    }

    private function studentAvatarUrl(int $userId, int $picture, ?string $contentHash): ?string
    {
        if ($picture <= 0 || ! $contentHash) {
            return null;
        }

        $path = $this->moodleFilePath($contentHash);

        if (! $path || ! is_file($path)) {
            return null;
        }

        return sprintf('/dashboard/students/%d/avatar?rev=%d', $userId, $picture);
    }

    private function moodleFilePath(string $contentHash): ?string
    {
        $dataRoot = trim((string) config('services.moodle.data_root'));

        if ($dataRoot === '') {
            return null;
        }

        return sprintf(
            '%s/filedir/%s/%s/%s',
            rtrim($dataRoot, DIRECTORY_SEPARATOR),
            substr($contentHash, 0, 2),
            substr($contentHash, 2, 2),
            $contentHash,
        );
    }

    public function studentActivity(array $filters = []): Collection
    {
        return $this->applyStudentFilters(MoodleStudent::query(), $filters)
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
        return $query->when($institution, fn (Builder $query, string $institution) => $this->applyTextDimensionFilter($query, 'institution', $institution));
    }

    private function applyStudentFilters(Builder $query, array $filters): Builder
    {
        $status = strtolower((string) ($filters['status'] ?? ''));

        return $this->applyInstitutionScope($query, $filters['institution'] ?? null)
            ->when($filters['search'] ?? null, function (Builder $query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('username', 'ilike', "%{$search}%")
                        ->orWhere('firstname', 'ilike', "%{$search}%")
                        ->orWhere('lastname', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%");
                });
            })
            ->when($filters['department'] ?? null, fn (Builder $query, string $department) => $this->applyTextDimensionFilter($query, 'department', $department))
            ->when($filters['city'] ?? null, fn (Builder $query, string $city) => $this->applyTextDimensionFilter($query, 'city', $city))
            ->when($filters['gender'] ?? null, fn (Builder $query, string $gender) => $this->applyTextDimensionFilter($query, 'gender', $gender))
            ->when($status === 'active', fn (Builder $query) => $query->where('suspended', 0)->where('confirmed', 1))
            ->when($status === 'inactive', fn (Builder $query) => $query->where(fn ($query) => $query->where('suspended', 1)->orWhere('confirmed', 0)));
    }

    private function applyTextDimensionFilter(Builder $query, string $column, ?string $value): Builder
    {
        $normalizedValue = trim((string) $value);

        if ($normalizedValue === '') {
            return $query;
        }

        if ($normalizedValue === self::NOT_FILLED_LABEL) {
            return $query->where(function (Builder $query) use ($column): void {
                $query->whereNull($column)
                    ->orWhereRaw("trim({$column}) = ''");
            });
        }

        return $query->where($column, $normalizedValue);
    }
}
