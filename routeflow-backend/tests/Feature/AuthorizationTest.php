<?php

namespace Tests\Feature;

use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRolesAndPermissions();
        $this->organization = Organization::factory()->create();
    }

    public function test_unauthenticated_requests_are_rejected(): void
    {
        $this->getJson('/api/v1/customers')->assertUnauthorized();
        $this->getJson('/api/v1/deliveries')->assertUnauthorized();
    }

    public function test_driver_cannot_manage_customers(): void
    {
        Sanctum::actingAs($this->userWithRole('driver', $this->organization));

        $this->getJson('/api/v1/customers')->assertForbidden();
        $this->postJson('/api/v1/customers', ['name' => 'Nope'])->assertForbidden();
    }

    public function test_warehouse_staff_cannot_assign_deliveries(): void
    {
        Sanctum::actingAs($this->userWithRole('warehouse-staff', $this->organization));

        $this->getJson('/api/v1/drivers')->assertForbidden();
    }

    public function test_organization_admin_has_broad_access(): void
    {
        Sanctum::actingAs($this->userWithRole('organization-admin', $this->organization));

        $this->getJson('/api/v1/customers')->assertOk();
        $this->getJson('/api/v1/deliveries')->assertOk();
        $this->getJson('/api/v1/users')->assertOk();
    }

    public function test_registration_creates_organization_and_admin_together(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'organization_name' => 'Addis Express',
            'organization_slug' => 'addis-express',
            'admin_name' => 'Dawit T.',
            'admin_email' => 'dawit@addisexpress.test',
            'admin_password' => 'password123',
            'admin_password_confirmation' => 'password123',
        ])->assertCreated()->assertJsonStructure(['data' => ['id', 'name', 'email'], 'token']);

        $this->assertDatabaseHas('organizations', ['slug' => 'addis-express']);
        $this->assertDatabaseHas('users', ['email' => 'dawit@addisexpress.test']);
    }
}
