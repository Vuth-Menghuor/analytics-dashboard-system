<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Analytics\InstituteAnalyticsService;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class InstituteAnalyticsTest extends TestCase
{
    public function test_manager_can_request_filtered_institute_analytics(): void
    {
        Sanctum::actingAs(User::factory()->make([
            'role' => 'manager',
        ]));

        $service = Mockery::mock(InstituteAnalyticsService::class);
        $service->shouldReceive('overview')
            ->once()
            ->with([
                'institution' => 'ITC',
                'department' => 'GCI',
                'search' => null,
                'dateFrom' => '2025-01-01',
                'dateTo' => '2025-07-28',
            ])
            ->andReturn([
                'snapshotDate' => '2025-07-28',
                'summary' => ['institutes' => 1],
            ]);
        $this->app->instance(InstituteAnalyticsService::class, $service);

        $this->getJson('/api/dashboard/institutes?institution=ITC&department=GCI&dateFrom=2025-01-01&dateTo=2025-07-28')
            ->assertOk()
            ->assertJsonPath('snapshotDate', '2025-07-28');
    }

    public function test_manager_can_search_institute_analytics(): void
    {
        Sanctum::actingAs(User::factory()->make([
            'role' => 'manager',
        ]));

        $service = Mockery::mock(InstituteAnalyticsService::class);
        $service->shouldReceive('overview')
            ->once()
            ->with(Mockery::on(fn (array $filters) => $filters['search'] === 'itc'))
            ->andReturn([
                'snapshotDate' => '2025-07-28',
                'summary' => ['institutes' => 1],
            ]);
        $this->app->instance(InstituteAnalyticsService::class, $service);

        $this->getJson('/api/dashboard/institutes?search=itc')
            ->assertOk();
    }

    public function test_partner_institute_scope_overrides_requested_institute(): void
    {
        Sanctum::actingAs(User::factory()->make([
            'role' => 'partner',
            'institution_name' => 'Institute of Technology of Cambodia',
        ]));

        $service = Mockery::mock(InstituteAnalyticsService::class);
        $service->shouldReceive('overview')
            ->once()
            ->with(Mockery::on(fn (array $filters) => $filters['institution'] === 'ITC'))
            ->andReturn([
                'snapshotDate' => '2025-07-28',
                'summary' => ['institutes' => 1],
            ]);
        $this->app->instance(InstituteAnalyticsService::class, $service);

        $this->getJson('/api/dashboard/institutes?institution=RUA')
            ->assertOk();
    }

    public function test_institute_date_range_is_validated(): void
    {
        Sanctum::actingAs(User::factory()->make([
            'role' => 'manager',
        ]));

        $this->getJson('/api/dashboard/institutes?dateFrom=2025-07-28&dateTo=2025-01-01')
            ->assertUnprocessable();
    }
}
