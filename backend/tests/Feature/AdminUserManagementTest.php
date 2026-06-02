<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_create_update_and_delete_system_user(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'role' => 'manager',
        ]));

        $created = $this->postJson('/api/admin/users', [
            'name' => 'Partner Admin',
            'email' => 'partner.admin@example.com',
            'role' => 'partner',
            'institution_name' => 'ITC',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
            ->assertCreated()
            ->assertJsonPath('role', 'partner')
            ->json();

        $userId = $created['id'];

        $this->putJson("/api/admin/users/{$userId}", [
            'name' => 'Updated Partner',
            'email' => 'updated.partner@example.com',
            'role' => 'visitor',
            'institution_name' => null,
        ])
            ->assertOk()
            ->assertJsonPath('name', 'Updated Partner')
            ->assertJsonPath('role', 'visitor');

        $this->deleteJson("/api/admin/users/{$userId}")
            ->assertNoContent();

        $this->assertDatabaseMissing('users', [
            'email' => 'updated.partner@example.com',
        ]);
    }

    public function test_manager_can_reset_system_user_password(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'role' => 'manager',
        ]));

        $user = User::factory()->create([
            'email' => 'reset.password@example.com',
            'password' => 'old-password',
            'role' => 'visitor',
        ]);

        $this->patchJson("/api/admin/users/{$user->id}/password", [
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
            ->assertOk()
            ->assertJsonPath('email', 'reset.password@example.com');

        $this->postJson('/api/login', [
            'email' => 'reset.password@example.com',
            'password' => 'new-password',
        ])
            ->assertOk();
    }

    public function test_manager_cannot_delete_own_account(): void
    {
        $manager = User::factory()->create([
            'role' => 'manager',
        ]);

        Sanctum::actingAs($manager);

        $this->deleteJson("/api/admin/users/{$manager->id}")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'You cannot delete your own account.');
    }

    public function test_non_manager_cannot_manage_system_users(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'role' => 'visitor',
        ]));

        $this->getJson('/api/admin/users')
            ->assertForbidden();
    }
}
