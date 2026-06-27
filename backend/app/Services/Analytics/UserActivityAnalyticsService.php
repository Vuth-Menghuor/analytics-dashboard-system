<?php

namespace App\Services\Analytics;

use App\Models\Analytics\MoodleUserActivity;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class UserActivityAnalyticsService
{
    private const ACTIVITY_TYPES = [
        'All activity types' => '',
        'Logins' => "l.component = 'core' and l.action = 'loggedin'",
        'Course Views' => "l.component = 'core' and l.target = 'course' and l.action = 'viewed'",
        'Resource Views' => "l.component = 'mod_resource' and l.action = 'viewed'",
        'Forum Activity' => "l.component = 'mod_forum'",
        'SCORM Activity' => "l.component = 'mod_scorm'",
        'H5P Activity' => "l.component in ('mod_hvp', 'mod_h5pactivity')",
    ];

    public function userActivity(array $filters = []): Collection
    {
        $institution = $filters['institution'] ?? null;

        $loginRows = MoodleUserActivity::query()
            ->from('analytics_clean.user_activity as ua')
            ->when($institution, function ($query, string $institution): void {
                $query->join('analytics_clean.students as s', 's.id', '=', 'ua.userid')
                    ->where('s.deleted', 0)
                    ->where('s.institution', $institution);
            })
            ->selectRaw("ua.last_login_time = 'Never logged in' as never_logged_in")
            ->selectRaw("
                case
                    when ua.last_login_time ~ '^\\d{4}-\\d{2}-\\d{2}' then ua.last_login_time::timestamp
                    else null
                end as login_at
            ")
            ->where('ua.deleted', 0);

        return DB::connection('analytics')
            ->query()
            ->fromSub($loginRows->toBase(), 'logins')
            ->selectRaw("
                case
                    when never_logged_in then 'Never logged in'
                    when login_at >= now() - interval '7 days' then 'Logged in within 1 week'
                    when login_at >= now() - interval '1 month' then 'Logged in within 1 month'
                    when login_at >= now() - interval '3 months' then 'Logged in within 3 months'
                    when login_at >= now() - interval '1 year' then 'Logged in within 1 year'
                    else 'No login over 1 year'
                end as login_status
            ")
            ->selectRaw("
                case
                    when never_logged_in then 6
                    when login_at >= now() - interval '7 days' then 1
                    when login_at >= now() - interval '1 month' then 2
                    when login_at >= now() - interval '3 months' then 3
                    when login_at >= now() - interval '1 year' then 4
                    else 5
                end as sort_order
            ")
            ->selectRaw('count(*) as total_users')
            ->groupBy('login_status', 'sort_order')
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($row) => [
                'loginStatus' => $row->login_status,
                'totalUsers' => (int) $row->total_users,
            ]);
    }

    public function learningActivity(array $filters = []): array
    {
        $section = (string) ($filters['section'] ?? 'all');
        $shouldLoadOverview = $this->shouldLoadSection($section, 'overview');
        $shouldLoadTrend = $shouldLoadOverview || $this->shouldLoadSection($section, 'trend');
        $overview = $shouldLoadOverview ? $this->summaryAndActivityTypes($filters) : null;
        $institutes = $this->shouldLoadSection($section, 'institutes')
            ? $this->institutes($filters)
            : $this->emptyPage($filters);
        $departments = $this->shouldLoadSection($section, 'departments')
            ? $this->departments($filters)
            : $this->emptyPage($filters);
        $courses = $this->shouldLoadSection($section, 'courses')
            ? $this->courses($filters)
            : $this->emptyPage($filters);
        $students = $this->shouldLoadSection($section, 'students')
            ? $this->students($filters)
            : $this->emptyPage($filters);
        $events = $this->shouldLoadSection($section, 'events')
            ? $this->events($filters)
            : $this->emptyPage($filters);

        return [
            'filters' => [
                'dateFrom' => $filters['dateFrom'] ?? null,
                'dateTo' => $filters['dateTo'] ?? null,
                'institution' => $filters['institution'] ?? null,
                'department' => $filters['department'] ?? null,
                'city' => $filters['city'] ?? null,
                'courseId' => isset($filters['courseId']) ? (int) $filters['courseId'] : null,
                'activityType' => $filters['activityType'] ?? null,
                'userStatus' => $filters['userStatus'] ?? null,
                'search' => $filters['search'] ?? null,
                'section' => $section,
                'page' => (int) ($filters['page'] ?? 1),
                'perPage' => (int) ($filters['perPage'] ?? 10),
            ],
            'options' => $section === 'trend'
                ? $this->emptyOptions()
                : $this->options($filters),
            'summary' => $shouldLoadOverview
                ? $overview['summary']
                : $this->emptySummary(),
            'trend' => $shouldLoadTrend
                ? $this->trend($filters)
                : [],
            'activityTypes' => $shouldLoadOverview
                ? $overview['activityTypes']
                : [],
            'loginHours' => $shouldLoadOverview
                ? $this->loginHours($filters)
                : [],
            'institutes' => $institutes['data'],
            'departments' => $departments['data'],
            'courses' => $courses['data'],
            'students' => $students['data'],
            'events' => $events['data'],
            'meta' => [
                'institutes' => $institutes['meta'],
                'departments' => $departments['meta'],
                'courses' => $courses['meta'],
                'students' => $students['meta'],
                'events' => $events['meta'],
            ],
        ];
    }

    private function shouldLoadSection(string $requestedSection, string $section): bool
    {
        return $requestedSection === 'all' || $requestedSection === $section;
    }

    private function emptySummary(): array
    {
        return [
            'totalActivities' => 0,
            'activeUsers' => 0,
            'totalLogins' => 0,
            'courseViews' => 0,
            'assignmentSubmissions' => 0,
            'quizSubmissions' => 0,
            'averageActivitiesPerStudent' => 0.0,
            'mostActiveCourse' => 'Not available',
            'snapshotDate' => null,
        ];
    }

    private function emptyOptions(): array
    {
        return [
            'institutes' => [],
            'departments' => [],
            'cities' => [],
            'courses' => [],
            'activityTypes' => [],
            'userStatuses' => [],
        ];
    }

    private function emptyPage(array $filters): array
    {
        return [
            'data' => [],
            'meta' => $this->paginationMeta(0, $filters),
        ];
    }

    private function pagination(array $filters): array
    {
        $page = max((int) ($filters['page'] ?? 1), 1);
        $perPage = min(max((int) ($filters['perPage'] ?? 10), 1), 100);

        return [
            'page' => $page,
            'perPage' => $perPage,
            'offset' => ($page - 1) * $perPage,
        ];
    }

    private function paginationMeta(int $total, array $filters): array
    {
        $pagination = $this->pagination($filters);

        return [
            'currentPage' => $pagination['page'],
            'perPage' => $pagination['perPage'],
            'total' => $total,
            'lastPage' => max((int) ceil($total / $pagination['perPage']), 1),
        ];
    }

    private function summary(array $filters): array
    {
        $base = $this->baseLogSql($filters);
        $row = DB::connection('analytics')->selectOne("
            select
                count(*)::bigint as total_activities,
                count(distinct l.userid)::bigint as active_users,
                count(*) filter (where l.component = 'core' and l.action = 'loggedin')::bigint as total_logins,
                count(*) filter (where l.component = 'core' and l.target = 'course' and l.action = 'viewed')::bigint as course_views
            {$base['from']}
            {$base['where']}
        ", $base['bindings']);

        return [
            'totalActivities' => (int) ($row->total_activities ?? 0),
            'activeUsers' => (int) ($row->active_users ?? 0),
            'totalLogins' => (int) ($row->total_logins ?? 0),
            'courseViews' => (int) ($row->course_views ?? 0),
            'assignmentSubmissions' => 0,
            'quizSubmissions' => 0,
        ];
    }

    private function summaryAndActivityTypes(array $filters): array
    {
        $base = $this->baseLogSql($filters);
        $rows = DB::connection('analytics')->select("
            select
                l.component,
                l.action,
                l.target,
                grouping(l.component) as is_total,
                count(*)::bigint as total,
                count(distinct l.userid)::bigint as active_users
            {$base['from']}
            {$base['where']}
            group by grouping sets ((l.component, l.action, l.target), ())
        ", $base['bindings']);

        $summary = $this->emptySummary();
        $activityTypes = [];

        foreach ($rows as $row) {
            if ((int) $row->is_total === 1) {
                $summary['totalActivities'] = (int) $row->total;
                $summary['activeUsers'] = (int) $row->active_users;
                continue;
            }

            $component = (string) $row->component;
            $action = (string) $row->action;
            $target = (string) $row->target;
            $total = (int) $row->total;

            if ($component === 'core' && $action === 'loggedin') {
                $summary['totalLogins'] += $total;
            }

            if ($component === 'core' && $target === 'course' && $action === 'viewed') {
                $summary['courseViews'] += $total;
            }

            $label = $this->activityTypeLabel($component, $action, $target);
            $activityTypes[$label] = ($activityTypes[$label] ?? 0) + $total;
        }

        arsort($activityTypes);
        $summary['averageActivitiesPerStudent'] = $summary['activeUsers'] > 0
            ? round($summary['totalActivities'] / $summary['activeUsers'], 1)
            : 0.0;

        $course = DB::connection('analytics')->selectOne("
            select c.fullname, count(*)::bigint as activities
            {$base['from']}
            {$base['where']} and c.id > 1
            group by c.id, c.fullname
            order by activities desc
            limit 1
        ", $base['bindings']);
        $snapshot = DB::connection('analytics')->selectOne("
            select max(l.timecreated)::bigint as latest_activity
            {$base['from']}
            {$base['where']}
        ", $base['bindings']);
        $summary['mostActiveCourse'] = $course?->fullname ?? 'Not available';
        $summary['snapshotDate'] = ! empty($snapshot?->latest_activity)
            ? date('Y-m-d', (int) $snapshot->latest_activity)
            : null;

        return [
            'summary' => $summary,
            'activityTypes' => collect($activityTypes)
                ->take(12)
                ->map(fn ($total, $label) => [
                    'label' => $label,
                    'total' => (int) $total,
                ])
                ->values()
                ->all(),
        ];
    }

    private function trend(array $filters): array
    {
        $base = $this->baseLogSql($filters);
        $bucket = $this->trendBucket($filters);

        return collect(DB::connection('analytics')->select("
            select
                to_char(date_trunc('{$bucket['unit']}', to_timestamp(l.timecreated)), '{$bucket['format']}') as period,
                count(*) filter (where l.component = 'core' and l.action = 'loggedin')::bigint as logins,
                count(*) filter (where l.component = 'core' and l.action = 'viewed')::bigint as course_views,
                count(*) filter (where l.component = 'mod_forum')::bigint as forum_activity
            {$base['from']}
            {$base['where']}
            group by date_trunc('{$bucket['unit']}', to_timestamp(l.timecreated))
            order by date_trunc('{$bucket['unit']}', to_timestamp(l.timecreated))
        ", $base['bindings']))->map(fn ($row) => [
            'period' => $row->period,
            'logins' => (int) $row->logins,
            'courseViews' => (int) $row->course_views,
            'assignmentSubmissions' => 0,
            'quizAttempts' => 0,
            'forumActivity' => (int) $row->forum_activity,
        ])->values()->all();
    }

    /**
     * @return array{unit: string, format: string}
     */
    private function trendBucket(array $filters): array
    {
        if (empty($filters['dateFrom']) || empty($filters['dateTo'])) {
            return ['unit' => 'month', 'format' => 'YYYY-MM'];
        }

        try {
            $dateFrom = new \DateTimeImmutable((string) $filters['dateFrom']);
            $dateTo = new \DateTimeImmutable((string) $filters['dateTo']);
        } catch (\Exception) {
            return ['unit' => 'month', 'format' => 'YYYY-MM'];
        }

        if ($dateFrom > $dateTo) {
            return ['unit' => 'month', 'format' => 'YYYY-MM'];
        }

        $rangeDays = (int) $dateFrom->diff($dateTo)->format('%a');

        return $rangeDays <= 92
            ? ['unit' => 'day', 'format' => 'YYYY-MM-DD']
            : ['unit' => 'month', 'format' => 'YYYY-MM'];
    }

    private function activityTypes(array $filters): array
    {
        $base = $this->baseLogSql($filters);

        return collect(DB::connection('analytics')->select("
            select
                case
                    when l.component = 'core' and l.action = 'loggedin' then 'Logins'
                    when l.component = 'core' and l.action = 'viewed' then 'Course Views'
                    when l.component = 'mod_forum' then 'Forum Activity'
                    when l.component = 'mod_scorm' then 'SCORM Activity'
                    when l.component in ('mod_hvp', 'mod_h5pactivity') then 'H5P Activity'
                    else initcap(replace(l.component, '_', ' ')) || ' ' || initcap(l.action)
                end as activity_type,
                count(*)::bigint as total
            {$base['from']}
            {$base['where']}
            group by activity_type
            order by total desc
            limit 12
        ", $base['bindings']))->map(fn ($row) => [
            'label' => $row->activity_type,
            'total' => (int) $row->total,
        ])->values()->all();
    }

    private function activityTypeLabel(string $component, string $action, string $target = ''): string
    {
        return match (true) {
            $component === 'core' && $action === 'loggedin' => 'Logins',
            $component === 'core' && $target === 'course' && $action === 'viewed' => 'Course Views',
            $component === 'mod_resource' && $action === 'viewed' => 'Resource Views',
            $component === 'mod_forum' => 'Forum Activity',
            $component === 'mod_scorm' => 'SCORM Activity',
            in_array($component, ['mod_hvp', 'mod_h5pactivity'], true) => 'H5P Activity',
            default => ucwords(str_replace('_', ' ', $component)).' '.ucwords($action),
        };
    }

    private function institutes(array $filters): array
    {
        $base = $this->baseLogSql($filters);
        $pagination = $this->pagination($filters);

        $rows = collect(DB::connection('analytics')->select("
            select
                nullif(trim(s.institution), '') as institution,
                count(*)::bigint as activities,
                count(distinct l.userid)::bigint as active_users,
                count(*) over()::bigint as total_rows
            {$base['from']}
            {$base['where']} and l.component = 'core' and l.action = 'loggedin'
            group by nullif(trim(s.institution), '')
            having nullif(trim(s.institution), '') is not null
            order by activities desc, nullif(trim(s.institution), '')
            limit ? offset ?
        ", [...$base['bindings'], $pagination['perPage'], $pagination['offset']]));

        $total = (int) ($rows->first()->total_rows ?? 0);

        return [
            'data' => $rows->map(fn ($row) => [
                'institution' => $row->institution,
                'activities' => (int) $row->activities,
                'activeUsers' => (int) $row->active_users,
                'courses' => 0,
                'activityRate' => 0.0,
            ])->values()->all(),
            'meta' => $this->paginationMeta($total, $filters),
        ];
    }

    private function departments(array $filters): array
    {
        $base = $this->baseLogSql($filters);
        $pagination = $this->pagination($filters);

        $rows = collect(DB::connection('analytics')->select("
            select
                nullif(trim(s.department), '') as department,
                count(*)::bigint as activities,
                count(distinct l.userid)::bigint as active_students,
                count(*) over()::bigint as total_rows
            {$base['from']}
            {$base['where']} and l.component = 'core' and l.action = 'loggedin'
            group by nullif(trim(s.department), '')
            having nullif(trim(s.department), '') is not null
            order by activities desc, nullif(trim(s.department), '')
            limit ? offset ?
        ", [...$base['bindings'], $pagination['perPage'], $pagination['offset']]));

        $total = (int) ($rows->first()->total_rows ?? 0);

        return [
            'data' => $rows->map(fn ($row) => [
                'department' => $row->department,
                'activities' => (int) $row->activities,
                'activeStudents' => (int) $row->active_students,
                'topCourse' => '-',
            ])->values()->all(),
            'meta' => $this->paginationMeta($total, $filters),
        ];
    }

    private function courses(array $filters): array
    {
        $base = $this->baseLogSql($filters);
        $pagination = $this->pagination($filters);

        $rows = collect(DB::connection('analytics')->select("
            select
                c.id,
                c.fullname as course,
                count(*) filter (where l.action = 'viewed')::bigint as views,
                count(*) over()::bigint as total_rows
            {$base['from']}
            {$base['where']}
            group by c.id, c.fullname
            having c.id > 1
            order by views desc, c.fullname
            limit ? offset ?
        ", [...$base['bindings'], $pagination['perPage'], $pagination['offset']]));

        $total = (int) ($rows->first()->total_rows ?? 0);

        return [
            'data' => $rows->map(fn ($row) => [
                'id' => (int) $row->id,
                'course' => $row->course,
                'views' => (int) $row->views,
            ])->values()->all(),
            'meta' => $this->paginationMeta($total, $filters),
        ];
    }

    private function students(array $filters): array
    {
        $base = $this->baseLogSql($filters);
        $pagination = $this->pagination($filters);

        $rows = collect(DB::connection('analytics')->select("
            select
                u.id,
                concat_ws(' ', nullif(u.firstname, ''), nullif(u.lastname, '')) as student,
                u.email,
                s.institution,
                s.department,
                s.city,
                max(c.fullname) as course,
                max(u.lastlogin) as last_login,
                count(*)::bigint as activities,
                count(distinct nullif(l.courseid, 0))::bigint as courses_accessed,
                case when u.deleted = 0 and u.suspended = 0 then 'Active' else 'Inactive' end as status,
                count(*) over()::bigint as total_rows
            {$base['from']}
            {$base['where']}
            group by u.id, u.firstname, u.lastname, u.email, s.institution, s.department, s.city, u.lastlogin, u.deleted, u.suspended
            order by student
            limit ? offset ?
        ", [...$base['bindings'], $pagination['perPage'], $pagination['offset']]));

        $total = (int) ($rows->first()->total_rows ?? 0);

        return [
            'data' => $rows->map(fn ($row) => [
                'id' => (int) $row->id,
                'student' => trim((string) $row->student) ?: 'Unknown student',
                'email' => $row->email,
                'institution' => $row->institution ?: '-',
                'department' => $row->department ?: '-',
                'city' => $row->city ?: '-',
                'course' => $row->course ?: '-',
                'lastLogin' => $this->formatUnixDate($row->last_login),
                'activities' => (int) $row->activities,
                'coursesAccessed' => (int) $row->courses_accessed,
                'status' => $row->status,
            ])->values()->all(),
            'meta' => $this->paginationMeta($total, $filters),
        ];
    }

    private function loginHours(array $filters): array
    {
        $base = $this->baseLogSql($filters);

        return collect(DB::connection('analytics')->select("
            select
                extract(hour from to_timestamp(l.timecreated))::int as hour,
                count(*)::bigint as logins
            {$base['from']}
            {$base['where']}
                and l.component = 'core'
                and l.action = 'loggedin'
            group by extract(hour from to_timestamp(l.timecreated))
            order by hour
        ", $base['bindings']))
            ->keyBy(fn ($row) => (int) $row->hour)
            ->pipe(fn (Collection $rows) => collect(range(0, 23))->map(fn (int $hour) => [
                'hour' => $hour,
                'label' => sprintf('%02d:00', $hour),
                'logins' => (int) ($rows->get($hour)?->logins ?? 0),
            ]))
            ->values()
            ->all();
    }

    private function events(array $filters): array
    {
        $base = $this->baseLogSql($filters);
        $pagination = $this->pagination($filters);

        $rows = collect(DB::connection('analytics')->select("
            select
                l.id,
                to_char(to_timestamp(l.timecreated), 'YYYY-MM-DD HH24:MI:SS') as occurred_at,
                concat_ws(' ', nullif(u.firstname, ''), nullif(u.lastname, '')) as student,
                coalesce(c.fullname, 'Site activity') as course,
                case
                    when l.component = 'core' and l.action = 'loggedin' then 'Login'
                    when l.component = 'core' and l.target = 'course' and l.action = 'viewed' then 'Course View'
                    when l.component = 'mod_resource' and l.action = 'viewed' then 'Resource View'
                    when l.component = 'mod_forum' and l.action = 'created' then 'Forum Post'
                    else initcap(replace(l.component, '_', ' ')) || ' ' || initcap(l.action)
                end as activity_type,
                coalesce(nullif(l.eventname, ''), initcap(l.target) || ' ' || initcap(l.action)) as description,
                count(*) over()::bigint as total_rows
            {$base['from']}
            {$base['where']}
            order by l.timecreated desc, l.id desc
            limit ? offset ?
        ", [...$base['bindings'], $pagination['perPage'], $pagination['offset']]));

        $total = (int) ($rows->first()->total_rows ?? 0);

        return [
            'data' => $rows->map(fn ($row) => [
                'id' => (int) $row->id,
                'time' => $row->occurred_at,
                'student' => trim((string) $row->student) ?: 'Unknown student',
                'course' => $row->course,
                'activityType' => $row->activity_type,
                'description' => $row->description,
            ])->values()->all(),
            'meta' => $this->paginationMeta($total, $filters),
        ];
    }

    private function options(array $filters): array
    {
        return [
            'institutes' => $this->pluckColumn("
                select distinct institution as value
                from analytics_clean.students
                where deleted = 0 and nullif(trim(institution), '') is not null
                order by institution
            "),
            'departments' => $this->pluckColumn(
                "select distinct department as value
                from analytics_clean.students
                where deleted = 0 and nullif(trim(department), '') is not null
                order by department",
            ),
            'cities' => $this->pluckColumn(
                "select distinct city as value
                from analytics_clean.students
                where deleted = 0 and nullif(trim(city), '') is not null
                order by city",
            ),
            'courses' => collect(DB::connection('analytics')->select("
                select id, fullname as name
                from mdl_course
                where id > 1
                order by fullname
                limit 500
            "))->map(fn ($row) => [
                'id' => (int) $row->id,
                'name' => $row->name,
            ])->values()->all(),
            'activityTypes' => array_keys(self::ACTIVITY_TYPES),
            'userStatuses' => ['All user statuses', 'Active', 'Inactive'],
        ];
    }

    /**
     * @return array{from: string, where: string, bindings: array<int, mixed>}
     */
    private function baseLogSql(array $filters): array
    {
        $where = [
            'l.userid > 0',
            'u.deleted = 0',
            's.deleted = 0',
            "l.component not in ('mod_assign', 'mod_quiz')",
        ];
        $bindings = [];

        if (! empty($filters['dateFrom'])) {
            $where[] = 'l.timecreated >= extract(epoch from ?::date)';
            $bindings[] = $filters['dateFrom'];
        }

        if (! empty($filters['dateTo'])) {
            $where[] = 'l.timecreated < extract(epoch from (?::date + interval \'1 day\'))';
            $bindings[] = $filters['dateTo'];
        }

        foreach (['institution', 'department', 'city'] as $field) {
            $value = trim((string) ($filters[$field] ?? ''));

            if ($value !== '') {
                $where[] = "s.{$field} = ?";
                $bindings[] = $value;
            }
        }

        if (! empty($filters['courseId'])) {
            $where[] = 'l.courseid = ?';
            $bindings[] = (int) $filters['courseId'];
        }

        $activityType = (string) ($filters['activityType'] ?? '');

        if ($activityType !== '' && $activityType !== 'All activity types' && isset(self::ACTIVITY_TYPES[$activityType])) {
            $where[] = self::ACTIVITY_TYPES[$activityType];
        }

        $userStatus = strtolower((string) ($filters['userStatus'] ?? ''));

        if ($userStatus === 'active') {
            $where[] = 'u.suspended = 0';
        } elseif ($userStatus === 'inactive') {
            $where[] = 'u.suspended = 1';
        }

        $search = trim((string) ($filters['search'] ?? ''));

        if ($search !== '') {
            $where[] = "(u.firstname || ' ' || u.lastname ilike ? or u.email ilike ? or u.username ilike ?)";
            $bindings[] = "%{$search}%";
            $bindings[] = "%{$search}%";
            $bindings[] = "%{$search}%";
        }

        return [
            'from' => '
                from mdl_logstore_standard_log l
                join mdl_user u on u.id = l.userid
                join analytics_clean.students s on s.id = l.userid
                left join mdl_course c on c.id = l.courseid
            ',
            'where' => 'where '.implode(' and ', $where),
            'bindings' => $bindings,
        ];
    }

    private function pluckColumn(string $sql, array $bindings = []): array
    {
        return collect(DB::connection('analytics')->select($sql, $bindings))
            ->pluck('value')
            ->filter()
            ->values()
            ->all();
    }

    private function formatUnixDate(mixed $timestamp): string
    {
        $timestamp = (int) $timestamp;

        if ($timestamp <= 0) {
            return 'Never logged in';
        }

        return date('Y-m-d', $timestamp);
    }
}
