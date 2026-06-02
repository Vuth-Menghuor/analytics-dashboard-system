<?php

namespace App\Support;

class InstitutionNormalizer
{
    public const UNASSIGNED_SCOPE = '__partner_institution_not_assigned__';

    /**
     * @var array<string, string>
     */
    private const INSTITUTION_ALIASES = [
        'itc' => 'ITC',
        'institute of technology of cambodia' => 'ITC',
        'institut de technologie du cambodge' => 'ITC',
        'rupp' => 'RUPP',
        'royal university of phnom penh' => 'RUPP',
        'num' => 'NUM',
        'national university of management' => 'NUM',
        'rua' => 'RUA',
        'royal university of agriculture' => 'RUA',
        'sru' => 'SRU',
        'svay rieng university' => 'SRU',
        'uhst' => 'UHST',
        'university of health sciences' => 'UHST',
        'aeu' => 'AEU',
        'asia euro university' => 'AEU',
        'nubb' => 'NUBB',
        'national university of battambang' => 'NUBB',
    ];

    public static function normalize(?string $institution): ?string
    {
        $institution = trim((string) $institution);

        if ($institution === '') {
            return null;
        }

        $key = str($institution)
            ->lower()
            ->replaceMatches('/\s+/', ' ')
            ->toString();

        return self::INSTITUTION_ALIASES[$key] ?? strtoupper($institution);
    }

    public static function partnerScope(?string $institution): string
    {
        return self::normalize($institution) ?? self::UNASSIGNED_SCOPE;
    }
}
