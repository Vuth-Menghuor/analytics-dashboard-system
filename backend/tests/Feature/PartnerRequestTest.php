<?php

namespace Tests\Feature;

use App\Models\PartnerRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PartnerRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_partner_can_submit_access_request(): void
    {
        $this->postJson('/api/partner-requests', [
            'state_province' => 'Phnom Penh',
            'first_name' => 'Partner',
            'last_name' => 'User',
            'email' => 'partner.request@example.com',
            'phone_number' => '+85512345678',
            'institution_name' => 'ITC',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
            ->assertCreated()
            ->assertJsonPath('status', 'pending')
            ->assertJsonPath('institution_name', 'ITC')
            ->assertJsonPath('email', 'partner.request@example.com');

        $this->assertDatabaseHas('partner_requests', [
            'email' => 'partner.request@example.com',
            'status' => 'pending',
        ]);

        $this->assertDatabaseMissing('users', [
            'email' => 'partner.request@example.com',
        ]);
    }

    public function test_partner_request_normalizes_full_institute_name_to_moodle_code(): void
    {
        $this->postJson('/api/partner-requests', [
            'state_province' => 'Phnom Penh',
            'first_name' => 'Full',
            'last_name' => 'Institute',
            'email' => 'full.institute@example.com',
            'phone_number' => '+85512345678',
            'institution_name' => 'Institute of Technology of Cambodia',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
            ->assertCreated()
            ->assertJsonPath('institution_name', 'ITC');
    }

    public function test_manager_can_approve_partner_request_and_create_partner_user(): void
    {
        $manager = User::factory()->create([
            'role' => 'manager',
        ]);

        Sanctum::actingAs($manager);

        $partnerRequest = PartnerRequest::create([
            'state_province' => 'Phnom Penh',
            'first_name' => 'Approved',
            'last_name' => 'Partner',
            'email' => 'approved.partner@example.com',
            'phone_number' => '+85512345678',
            'institution_name' => 'ITC',
            'password' => 'password',
        ]);

        $this->patchJson("/api/admin/partner-requests/{$partnerRequest->id}/approve")
            ->assertOk()
            ->assertJsonPath('status', 'approved')
            ->assertJsonPath('reviewed_by', $manager->id);

        $this->assertDatabaseHas('users', [
            'email' => 'approved.partner@example.com',
            'role' => 'partner',
            'institution_name' => 'ITC',
        ]);
    }

    public function test_approved_partner_can_login_with_partner_role_and_institution_scope(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'role' => 'manager',
        ]));

        $partnerRequest = PartnerRequest::create([
            'state_province' => 'Phnom Penh',
            'first_name' => 'Login',
            'last_name' => 'Partner',
            'email' => 'login.partner@example.com',
            'phone_number' => '+85512345678',
            'institution_name' => 'ITC',
            'password' => 'password',
        ]);

        $this->patchJson("/api/admin/partner-requests/{$partnerRequest->id}/approve")
            ->assertOk();

        $this->postJson('/api/login', [
            'email' => 'login.partner@example.com',
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonPath('user.role', 'partner')
            ->assertJsonPath('user.institution_name', 'ITC')
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'name', 'email', 'role', 'institution_name'],
            ]);
    }

    public function test_pending_partner_request_cannot_login_before_approval(): void
    {
        PartnerRequest::create([
            'state_province' => 'Phnom Penh',
            'first_name' => 'Pending',
            'last_name' => 'Partner',
            'email' => 'pending.partner@example.com',
            'phone_number' => '+85512345678',
            'institution_name' => 'ITC',
            'password' => 'password',
        ]);

        $this->postJson('/api/login', [
            'email' => 'pending.partner@example.com',
            'password' => 'password',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_manager_can_reject_partner_request(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'role' => 'manager',
        ]));

        $partnerRequest = PartnerRequest::create([
            'state_province' => 'Phnom Penh',
            'first_name' => 'Rejected',
            'last_name' => 'Partner',
            'email' => 'rejected.partner@example.com',
            'phone_number' => '+85512345678',
            'institution_name' => 'ITC',
            'password' => 'password',
        ]);

        $this->patchJson("/api/admin/partner-requests/{$partnerRequest->id}/reject", [
            'reason' => 'Unable to verify institute affiliation.',
        ])
            ->assertOk()
            ->assertJsonPath('status', 'rejected')
            ->assertJsonPath('rejection_reason', 'Unable to verify institute affiliation.');

        $this->assertDatabaseMissing('users', [
            'email' => 'rejected.partner@example.com',
        ]);
    }

    public function test_non_manager_cannot_review_partner_requests(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'role' => 'visitor',
        ]));

        $this->getJson('/api/admin/partner-requests')
            ->assertForbidden();
    }

    public function test_partner_access_is_limited_to_partner_routes(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'role' => 'partner',
            'institution_name' => 'ITC',
        ]));

        $this->getJson('/api/partner/dashboard')
            ->assertOk()
            ->assertJsonPath('message', 'Partner dashboard');

        $this->getJson('/api/manager/dashboard')
            ->assertForbidden();

        $this->getJson('/api/admin/users')
            ->assertForbidden();

        $this->getJson('/api/admin/partner-requests')
            ->assertForbidden();
    }

    public function test_manager_cannot_access_partner_only_dashboard(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'role' => 'manager',
        ]));

        $this->getJson('/api/partner/dashboard')
            ->assertForbidden();
    }

    public function test_reviewed_partner_request_cannot_be_reviewed_again(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'role' => 'manager',
        ]));

        $partnerRequest = PartnerRequest::create([
            'state_province' => 'Phnom Penh',
            'first_name' => 'Already',
            'last_name' => 'Reviewed',
            'email' => 'already.reviewed@example.com',
            'phone_number' => '+85512345678',
            'institution_name' => 'ITC',
            'password' => 'password',
            'status' => PartnerRequest::STATUS_APPROVED,
            'reviewed_at' => now(),
        ]);

        $this->patchJson("/api/admin/partner-requests/{$partnerRequest->id}/reject", [
            'reason' => 'Changed decision.',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }
}
