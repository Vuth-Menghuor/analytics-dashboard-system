<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Analytics\StudentAnalyticsService;
use App\Services\Analytics\SummaryAnalyticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.google.client_id' => 'test-google-client-id']);
    }

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

    public function test_visitor_can_register_with_verified_google_account(): void
    {
        $this->fakeVerifiedGoogleAccount(
            'new.visitor@example.com',
            name: 'Visitor User',
        );

        $response = $this->postJson('/api/register', [
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'visitor',
            'google_id_token' => 'valid-google-token',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.role', 'visitor')
            ->assertJsonPath('user.email', 'new.visitor@example.com')
            ->assertJsonStructure(['token']);

        $this->assertDatabaseHas('users', [
            'email' => 'new.visitor@example.com',
            'name' => 'Visitor User',
            'role' => 'visitor',
        ]);
    }

    public function test_registration_does_not_create_manager_accounts(): void
    {
        $this->fakeVerifiedGoogleAccount('manager.request@example.com');

        $this->postJson('/api/register', [
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'manager',
            'google_id_token' => 'valid-google-token',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('role');

        $this->assertDatabaseMissing('users', [
            'email' => 'manager.request@example.com',
        ]);
    }

    public function test_public_visitor_summary_is_available_without_login(): void
    {
        $service = Mockery::mock(SummaryAnalyticsService::class);
        $service->shouldReceive('summary')
            ->once()
            ->with(null)
            ->andReturn([
                'totalStudents' => 10,
                'totalTeachers' => 2,
                'totalCourses' => 3,
                'totalActiveUsers' => 8,
                'totalInactiveUsers' => 2,
                'totalActiveStudents' => 7,
                'totalInactiveStudents' => 3,
                'totalEnrollments' => 15,
            ]);
        $this->app->instance(SummaryAnalyticsService::class, $service);

        $this->getJson('/api/public/dashboard/summary')
            ->assertOk()
            ->assertJsonPath('totalStudents', 10);
    }

    public function test_public_visitor_institute_summary_is_available_without_login(): void
    {
        $service = Mockery::mock(StudentAnalyticsService::class);
        $service->shouldReceive('studentsByInstitution')
            ->once()
            ->with([
                'search' => null,
                'institution' => null,
                'department' => null,
                'city' => null,
                'gender' => null,
                'status' => null,
            ])
            ->andReturn(collect([
                [
                    'institution' => 'ITC',
                    'totalStudents' => 12,
                ],
            ]));
        $this->app->instance(StudentAnalyticsService::class, $service);

        $this->getJson('/api/public/dashboard/students/by-institution')
            ->assertOk()
            ->assertJsonPath('0.institution', 'ITC')
            ->assertJsonPath('0.totalStudents', 12);
    }

    public function test_role_middleware_blocks_other_roles(): void
    {
        $user = User::factory()->create([
            'role' => 'visitor',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/admin/users')
            ->assertForbidden();
    }

    public function test_visitor_cannot_access_private_dashboard_analytics(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'role' => 'visitor',
        ]));

        $this->getJson('/api/dashboard/students')
            ->assertForbidden();
    }

    private function fakeVerifiedGoogleAccount(string $email, ?string $name = null): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/tokeninfo*' => Http::response([
                'aud' => 'test-google-client-id',
                'email' => $email,
                'email_verified' => 'true',
                'name' => $name,
            ]),
        ]);
    }
}
