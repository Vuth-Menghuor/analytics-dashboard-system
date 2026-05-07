<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_and_receive_role(): void
    {
        User::factory()->create([
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'manager@example.com',
            'password' => 'password',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.role', 'manager')
            ->assertJsonStructure(['token']);
    }

    public function test_role_middleware_blocks_other_roles(): void
    {
        $user = User::factory()->create([
            'role' => 'visitor',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/manager/dashboard')
            ->assertForbidden();
    }
}
