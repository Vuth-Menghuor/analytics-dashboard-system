<?php

declare(strict_types=1);

if ($argc !== 3) {
    fwrite(STDERR, "Usage: php build_course_cleanup_review.php <source.csv> <output.csv>\n");
    exit(1);
}

[$script, $sourcePath, $outputPath] = $argv;

$source = fopen($sourcePath, 'rb');

if ($source === false) {
    fwrite(STDERR, "Unable to read source CSV: {$sourcePath}\n");
    exit(1);
}

$outputDirectory = dirname($outputPath);

if (! is_dir($outputDirectory) && ! mkdir($outputDirectory, 0775, true) && ! is_dir($outputDirectory)) {
    fwrite(STDERR, "Unable to create output directory: {$outputDirectory}\n");
    exit(1);
}

$output = fopen($outputPath, 'wb');

if ($output === false) {
    fwrite(STDERR, "Unable to create output CSV: {$outputPath}\n");
    exit(1);
}

// The source file has a title row followed by its actual header.
fgetcsv($source);
fgetcsv($source);

fputcsv($output, [
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
]);

$stats = [
    'rows' => 0,
    'safe_display' => 0,
    'family_suggested' => 0,
    'family_needs_review' => 0,
    'unchanged' => 0,
    'exclude_candidates' => 0,
    'quality_review_candidates' => 0,
];

while (($row = fgetcsv($source)) !== false) {
    if (count($row) !== 5) {
        fwrite(STDERR, 'Unexpected CSV column count on data row '.($stats['rows'] + 3)."\n");
        exit(1);
    }

    [$id, $category, $originalName, $cleanupCategory, $providedCleanupName] = $row;

    $id = (int) trim($id);
    $category = (int) trim($category);
    $providedCleanupName = normalizeWhitespace($providedCleanupName);
    $displayName = normalizeWhitespace($originalName);
    $displayStatus = $displayName !== $originalName ? 'approved' : 'unchanged';
    $courseFamily = '';
    $familyStatus = 'none';
    $familyConfidence = '';
    $overallStatus = $displayStatus === 'approved' ? 'approved_display' : 'unchanged';
    [$dataQualityStatus, $recommendedAction, $qualityReason] = classifyDataQuality(
        $id,
        $displayName
    );
    $suggestionSource = 'none';
    $notes = [];

    if ($displayName !== $originalName) {
        $suggestionSource = 'safe_formatting';
        $notes[] = 'Normalized outer, repeated, or non-breaking whitespace.';
    }

    if ($providedCleanupName !== '') {
        $courseFamily = $providedCleanupName;
        $familyStatus = 'review';
        $familyConfidence = 'medium';
        $overallStatus = 'review_family';
        $suggestionSource = 'provided_cleanup_csv';

        if (isFormattingOnlyChange($originalName, $providedCleanupName)) {
            $displayName = $providedCleanupName;
            $displayStatus = 'approved';
            $familyStatus = 'approved';
            $familyConfidence = 'high';
            $overallStatus = 'approved_display';
            $notes[] = 'Provided cleanup is a formatting, capitalization, or punctuation correction.';
        } elseif ($providedCleanupName === $originalName) {
            $familyStatus = 'approved';
            $familyConfidence = 'high';
            $overallStatus = $displayStatus === 'approved' ? 'approved_display' : 'unchanged';
            $notes[] = 'Provided cleanup is identical to the original name.';
        } else {
            $notes[] = 'Use as an analytics family; preserve level, exam, semester, teacher, or cohort details in the display name.';
            $stats['family_needs_review']++;
        }
    } else {
        $heuristicFamily = suggestFamily($displayName);

        if ($heuristicFamily !== '' && $heuristicFamily !== $displayName) {
            $courseFamily = $heuristicFamily;
            $familyStatus = 'review';
            $familyConfidence = 'low';
            $overallStatus = 'review_family';
            $suggestionSource = 'conservative_pattern';
            $notes[] = 'Automatically extracted from course-code, year, cohort, teacher, or duplicate-instance text; review before import.';
            $stats['family_needs_review']++;
        }
    }

    if ($displayStatus === 'approved') {
        $stats['safe_display']++;
    }

    if ($courseFamily !== '') {
        $stats['family_suggested']++;
    }

    if ($overallStatus === 'unchanged') {
        $stats['unchanged']++;
    }

    if ($recommendedAction === 'exclude_from_analytics') {
        $stats['exclude_candidates']++;
    } elseif ($recommendedAction === 'review_record') {
        $stats['quality_review_candidates']++;
    }

    fputcsv($output, [
        $id,
        $category,
        $originalName,
        $displayName,
        $displayStatus,
        $courseFamily,
        $familyStatus,
        $familyConfidence,
        $overallStatus,
        $dataQualityStatus,
        $recommendedAction,
        $qualityReason,
        $suggestionSource,
        implode(' ', array_unique($notes)),
    ]);

    $stats['rows']++;
}

fclose($source);
fclose($output);

fwrite(STDOUT, json_encode($stats, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)."\n");

function normalizeWhitespace(string $value): string
{
    $value = trim(str_replace("\u{00A0}", ' ', $value));

    return trim(preg_replace('/\s+/u', ' ', $value) ?? $value);
}

function comparisonKey(string $value): string
{
    $value = mb_strtolower(normalizeWhitespace($value), 'UTF-8');

    return preg_replace('/[\W_]+/u', '', $value) ?? $value;
}

function isFormattingOnlyChange(string $original, string $proposed): bool
{
    return comparisonKey($original) === comparisonKey($proposed);
}

function suggestFamily(string $name): string
{
    $candidate = $name;

    // Remove only clearly administrative suffixes from an analytics-family suggestion.
    $candidate = preg_replace('/(?:[-\s]+ccun|[-\s]+old|[-\s]+copy\s*\d*)$/iu', '', $candidate) ?? $candidate;
    $candidate = preg_replace('/\s+\d{4}(?:-\d{2,4})?$/u', '', $candidate) ?? $candidate;

    // Instructor/group instances are useful metadata but usually share one analytics family.
    if (preg_match('/^(.+?)\s*\(([^)]*(?:Prof\.?|Dr\.?|G\d+|[A-Z][A-Za-z]+\s+[A-Z][A-Za-z]+)[^)]*)\)$/u', $candidate, $matches)) {
        $candidate = $matches[1];
    }

    // Remove common curriculum prefixes while retaining the meaningful title and level.
    $candidate = preg_replace(
        '/^(?:20\d{2}-\d{2}-)?(?:[A-Z]\d[A-Z0-9]*|[A-Z]\d-[A-Z0-9]+|Co|DOC|T\d[A-Z0-9]*|M\d[A-Z0-9]*)-(?:S[12]-)?(?:[A-Z0-9]+-){0,3}/u',
        '',
        $candidate
    ) ?? $candidate;

    // Some records put the final course code and title in the same segment.
    $candidate = preg_replace('/^[A-Z]{2,}\d+[A-Z0-9]*\s+/u', '', $candidate) ?? $candidate;

    $candidate = normalizeWhitespace($candidate);
    $candidate = trim($candidate, "-_ \t\n\r\0\x0B");

    if ($candidate === '' || mb_strlen($candidate) < 4) {
        return '';
    }

    return $candidate;
}

/**
 * @return array{string, string, string}
 */
function classifyDataQuality(int $courseId, string $name): array
{
    $normalized = mb_strtolower(normalizeWhitespace($name), 'UTF-8');

    $explicitDecisions = [
        13 => [
            'historical_course',
            'keep',
            'Hidden legacy course with substantial enrollments, completions, and historical activity.',
        ],
        41 => [
            'historical_course',
            'keep',
            'Hidden legacy course with meaningful enrollments and historical activity.',
        ],
        52 => [
            'historical_course',
            'keep',
            'Hidden legacy course with substantial historical enrollment activity.',
        ],
        74 => [
            'non_production',
            'exclude_from_analytics',
            'Unusually short placeholder name with only one enrollment.',
        ],
        180 => [
            'non_production',
            'exclude_from_analytics',
            'Role/permission behavior test course with negligible usage.',
        ],
        254 => [
            'invalid_duplicate',
            'exclude_from_analytics',
            'Hidden course explicitly marked with a wrong code and negligible usage.',
        ],
        1645 => [
            'non_production',
            'exclude_from_analytics',
            'Placeholder-like name and shortname with negligible usage.',
        ],
        1653 => [
            'non_production',
            'exclude_from_analytics',
            'Placeholder-like token with negligible usage.',
        ],
        1688 => [
            'non_production',
            'exclude_from_analytics',
            'Explicit test token in a temporary category.',
        ],
        2054 => [
            'non_production',
            'exclude_from_analytics',
            'Explicit testing token with negligible usage.',
        ],
        2100 => [
            'historical_course',
            'keep',
            'Legacy E-Commerce course with real enrollments; retain for historical analytics.',
        ],
    ];

    if (isset($explicitDecisions[$courseId])) {
        return $explicitDecisions[$courseId];
    }

    if ($courseId === 1) {
        return [
            'system_course',
            'exclude_from_analytics',
            'Moodle site course, not a teaching course.',
        ];
    }

    $excludePatterns = [
        '/^(?:test|testing)$/u' => 'Name is only a test/testing placeholder.',
        '/^(?:content\s+test|content\s+testing)$/u' => 'Content test/testing placeholder.',
        '/^test\s+course(?:\s+.*)?$/u' => 'Name explicitly indicates a test course.',
        '/^course\s+test(?:\s+.*)?$/u' => 'Name explicitly indicates a test course.',
        '/^testing\s+(?:course(?:[\s-]+.*)?|gci|\d+)$/u' => 'Name explicitly indicates a testing placeholder.',
        '/^test\s*math$/u' => 'Name explicitly indicates a test mathematics placeholder.',
        '/^support\d*\s+course\s+test$/u' => 'Name explicitly indicates a support/test course.',
        '/^coursetestlms$/u' => 'Name explicitly indicates an LMS test course.',
        '/^demo(?:\s+prototype)?$/u' => 'Name explicitly indicates a demo/prototype course.',
        '/course\s+restoration\s+in\s+progress/u' => 'Temporary course-restoration artifact.',
        '/\btestcreate\b/u' => 'Temporary course-creation test.',
        '/\btest123\b/u' => 'Placeholder test name.',
    ];

    foreach ($excludePatterns as $pattern => $reason) {
        if (preg_match($pattern, $normalized)) {
            return ['non_production', 'exclude_from_analytics', $reason];
        }
    }

    $reviewPatterns = [
        '/\bwrong\s+code\b/u' => 'Name explicitly says the course code is wrong.',
        '/\bcopy\s*\d*\b/u' => 'Possible duplicate/copy course.',
        '/\bold\b/u' => 'Name marks the course as old; verify whether it should remain in historical analytics.',
        '/\brestore\b|\brestoration\b/u' => 'Possible restore-related artifact.',
        '/^coursebycreatorrole$/u' => 'Looks like a role/permission behavior test course.',
        '/^ta+ta+$/u' => 'Looks like a placeholder name.',
        '/^(?:test\d+|testing\d+|tt\d{4})$/u' => 'Name looks like a short placeholder/test token.',
    ];

    foreach ($reviewPatterns as $pattern => $reason) {
        if (preg_match($pattern, $normalized)) {
            return ['suspicious', 'review_record', $reason];
        }
    }

    if (mb_strlen($normalized, 'UTF-8') <= 2) {
        return [
            'suspicious',
            'review_record',
            'Course name is unusually short.',
        ];
    }

    return ['valid_candidate', 'keep', 'No obvious demo, test, placeholder, or restoration marker.'];
}
