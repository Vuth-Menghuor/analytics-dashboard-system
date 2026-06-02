<?php

namespace Tests\Feature;

use App\Support\InstitutionNormalizer;
use Tests\TestCase;

class InstitutionNormalizerTest extends TestCase
{
    public function test_it_normalizes_full_institute_names_to_moodle_codes(): void
    {
        $this->assertSame(
            'ITC',
            InstitutionNormalizer::normalize('Institute of Technology of Cambodia')
        );

        $this->assertSame('ITC', InstitutionNormalizer::normalize('itc'));
    }

    public function test_partner_scope_never_falls_back_to_global_when_institute_is_blank(): void
    {
        $this->assertSame(
            InstitutionNormalizer::UNASSIGNED_SCOPE,
            InstitutionNormalizer::partnerScope(null)
        );

        $this->assertSame(
            InstitutionNormalizer::UNASSIGNED_SCOPE,
            InstitutionNormalizer::partnerScope('')
        );
    }
}
