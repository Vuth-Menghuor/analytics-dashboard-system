<?php

declare(strict_types=1);

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

if ($argc !== 2) {
    fwrite(STDERR, "Usage: php database/scripts/import_course_cleanup_review.php <review.csv>\n");
    exit(1);
}

$backendPath = dirname(__DIR__, 2);

require $backendPath.'/vendor/autoload.php';

$app = require $backendPath.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$csvPath = $argv[1];

if (! str_starts_with($csvPath, '/')) {
    $csvPath = getcwd().'/'.$csvPath;
}

$handle = fopen($csvPath, 'rb');

if ($handle === false) {
    throw new RuntimeException("Unable to read review CSV: {$csvPath}");
}

$header = fgetcsv($handle);

if ($header === false) {
    throw new RuntimeException('The review CSV is empty.');
}

$indexes = array_flip($header);
$requiredColumns = [
    'course_id',
    'category_id',
    'original_name',
    'suggested_display_name',
    'display_status',
    'suggested_course_family',
    'family_status',
    'family_confidence',
    'overall_status',
    'data_quality_status',
    'recommended_action',
    'quality_reason',
    'suggestion_source',
    'note',
];

foreach ($requiredColumns as $column) {
    if (! array_key_exists($column, $indexes)) {
        throw new RuntimeException("Missing required CSV column: {$column}");
    }
}

$rows = [];
$seenIds = [];

while (($record = fgetcsv($handle)) !== false) {
    $courseId = (int) $record[$indexes['course_id']];

    if (isset($seenIds[$courseId])) {
        throw new RuntimeException("Duplicate course ID in review CSV: {$courseId}");
    }

    $seenIds[$courseId] = true;
    $displayStatus = $record[$indexes['display_status']];
    $originalName = $record[$indexes['original_name']];
    $suggestedDisplayName = $record[$indexes['suggested_display_name']];

    $rows[] = [
        'course_id' => $courseId,
        'category_id' => (int) $record[$indexes['category_id']],
        'original_name' => $originalName,
        'display_name' => $displayStatus === 'approved'
            && $suggestedDisplayName !== $originalName
                ? $suggestedDisplayName
                : null,
        'display_status' => $displayStatus,
        'proposed_course_family' => $record[$indexes['suggested_course_family']] ?: null,
        'family_status' => $record[$indexes['family_status']],
        'family_confidence' => $record[$indexes['family_confidence']] ?: null,
        'overall_status' => $record[$indexes['overall_status']],
        'data_quality_status' => $record[$indexes['data_quality_status']],
        'recommended_action' => $record[$indexes['recommended_action']],
        'quality_reason' => $record[$indexes['quality_reason']],
        'suggestion_source' => $record[$indexes['suggestion_source']],
        'note' => $record[$indexes['note']] ?: null,
    ];
}

fclose($handle);

if (count($rows) !== 1524) {
    throw new RuntimeException(
        'Expected 1,524 reviewed courses, found '.count($rows).'.'
    );
}

$database = DB::connection('analytics');

$database->transaction(function () use ($backendPath, $database, $rows): void {
    $liveCourses = $database->table('public.mdl_course')
        ->select(['id', 'category', 'fullname'])
        ->get()
        ->keyBy('id');

    if ($liveCourses->count() !== count($rows)) {
        throw new RuntimeException(
            "Live course count {$liveCourses->count()} does not match review count ".count($rows).'.'
        );
    }

    foreach ($rows as $row) {
        $live = $liveCourses->get($row['course_id']);

        if (! $live) {
            throw new RuntimeException("Course {$row['course_id']} does not exist.");
        }

        if ((int) $live->category !== $row['category_id']) {
            throw new RuntimeException("Category changed for course {$row['course_id']}.");
        }

        if ($live->fullname !== $row['original_name']) {
            throw new RuntimeException("Name changed for course {$row['course_id']}.");
        }
    }

    $database->statement('
        CREATE TABLE IF NOT EXISTS analytics_clean.course_mapping (
            course_id bigint PRIMARY KEY,
            category_id bigint NOT NULL,
            original_name text NOT NULL,
            display_name text NULL,
            display_status text NOT NULL,
            proposed_course_family text NULL,
            family_status text NOT NULL,
            family_confidence text NULL,
            overall_status text NOT NULL,
            data_quality_status text NOT NULL,
            recommended_action text NOT NULL,
            quality_reason text NOT NULL,
            suggestion_source text NOT NULL,
            note text NULL,
            imported_at timestamptz NOT NULL DEFAULT now()
        )
    ');

    $database->table('analytics_clean.course_mapping')->delete();

    foreach (array_chunk($rows, 250) as $chunk) {
        $database->table('analytics_clean.course_mapping')->insert($chunk);
    }

    $database->unprepared(
        file_get_contents($backendPath.'/database/sql/analytics_clean_course_cleanup.sql')
    );

    $mappingCount = $database->table('analytics_clean.course_mapping')->count();

    if ($mappingCount !== count($rows)) {
        throw new RuntimeException(
            "Imported mapping count {$mappingCount} does not match review count ".count($rows).'.'
        );
    }
});

$summary = $database->table('analytics_clean.course_mapping')
    ->selectRaw('count(*) as mappings')
    ->selectRaw("count(*) filter (where display_name is not null) as active_display_fixes")
    ->selectRaw("count(*) filter (where recommended_action = 'exclude_from_analytics') as exclusions")
    ->selectRaw("count(*) filter (where recommended_action = 'review_record') as review_records")
    ->first();

fwrite(STDOUT, json_encode($summary, JSON_PRETTY_PRINT)."\n");
