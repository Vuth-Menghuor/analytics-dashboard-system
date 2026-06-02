<?php

namespace App\Services\Analytics;

use Illuminate\Support\Facades\DB;

class ImportedAnalyticsService
{
    public function overview(): array
    {
        $analytics = DB::connection('analytics');

        $totalUsers = $analytics->table('mdl_user')
            ->where('deleted', 0)
            ->count();

        $activeUsers = $analytics->table('mdl_user')
            ->where('deleted', 0)
            ->where('suspended', 0)
            ->count();

        $totalCourses = $analytics->table('mdl_course')->count();

        $visibleCourses = $analytics->table('mdl_course')
            ->where('visible', 1)
            ->count();

        $totalCategories = $analytics->table('mdl_course_categories')->count();

        $topCategories = $analytics->table('mdl_course_categories')
            ->select(['name', 'coursecount'])
            ->where('coursecount', '>', 0)
            ->orderByDesc('coursecount')
            ->orderBy('name')
            ->limit(8)
            ->get();

        $recentCourses = $analytics->table('mdl_course')
            ->select(['fullname', 'shortname', 'visible', 'timemodified'])
            ->where('id', '>', 1)
            ->orderByDesc('timemodified')
            ->limit(8)
            ->get()
            ->map(fn ($course) => [
                'fullname' => $course->fullname,
                'shortname' => $course->shortname,
                'visible' => (bool) $course->visible,
                'updated_at' => $course->timemodified
                    ? now()->setTimestamp((int) $course->timemodified)->toDateString()
                    : null,
            ]);

        return [
            'metrics' => [
                [
                    'label' => 'Moodle Users',
                    'value' => number_format($totalUsers),
                    'trend' => number_format($activeUsers).' active accounts',
                    'icon' => 'Users',
                ],
                [
                    'label' => 'Courses',
                    'value' => number_format($totalCourses),
                    'trend' => number_format($visibleCourses).' visible courses',
                    'icon' => 'BookOpen',
                ],
                [
                    'label' => 'Categories',
                    'value' => number_format($totalCategories),
                    'trend' => 'Imported from PostgreSQL',
                    'icon' => 'FolderTree',
                ],
            ],
            'top_categories' => $topCategories,
            'recent_courses' => $recentCourses,
        ];
    }
}