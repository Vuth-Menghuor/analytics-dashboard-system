<?php

namespace App\Services\Analytics;

use App\Models\Analytics\MoodleUserActivity;
use Illuminate\Support\Collection;

class UserActivityAnalyticsService
{
    public function userActivity(?string $institution = null): Collection
    {
        return MoodleUserActivity::query()
            ->from('vw_moodle_user_activity as ua')
            ->when($institution, function ($query, string $institution): void {
                $query->join('vw_moodle_students as s', 's.id', '=', 'ua.userid')
                    ->where('s.deleted', 0)
                    ->where('s.institution', $institution);
            })
            ->selectRaw("
                case
                    when last_login_time = 'Never logged in' then 'Never logged in'
                    when last_login_time::timestamp >= now() - interval '7 days' then 'Logged in within 1 week'
                    when last_login_time::timestamp >= now() - interval '1 month' then 'Logged in within 1 month'
                    when last_login_time::timestamp >= now() - interval '3 months' then 'Logged in within 3 months'
                    when last_login_time::timestamp >= now() - interval '1 year' then 'Logged in within 1 year'
                    else 'No login over 1 year'
                end as login_status
            ")
            ->selectRaw('count(*) as total_users')
            ->where('ua.deleted', 0)
            ->groupBy('login_status')
            ->orderByDesc('total_users')
            ->get()
            ->map(fn ($row) => [
                'loginStatus' => $row->login_status,
                'totalUsers' => (int) $row->total_users,
            ]);
    }
}
