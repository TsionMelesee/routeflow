<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * The single most important property of a multi-tenant SaaS: organization
 * A must never be able to see or touch organization B's data, whatever
 * the request says.
 */
class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRolesAndPermissions();
    }

    public function test_listing_customers_excludes_other_organizations(): void
    {
        $mine = Organization::factory()->create();
        $theirs = Organization::factory()->create();

        Customer::factory()->for($mine)->create(['name' => 'My Customer']);
        Customer::factory()->for($theirs)->create(['name' => 'Their Customer']);

        Sanctum::actingAs($this->userWithRole('organization-admin', $mine));

        $response = $this->getJson('/api/v1/customers');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');
        $this->assertContains('My Customer', $names->all());
        $this->assertNotContains('Their Customer', $names->all());
    }

    public function test_cannot_view_another_organizations_customer_by_id(): void
    {
        $mine = Organization::factory()->create();
        $theirs = Organization::factory()->create();
        $theirCustomer = Customer::factory()->for($theirs)->create();

        Sanctum::actingAs($this->userWithRole('organization-admin', $mine));

        // The global scope hides the record entirely, so this is a 404
        // rather than a 403 — we don't confirm the record even exists.
        $this->getJson("/api/v1/customers/{$theirCustomer->id}")->assertNotFound();
    }

    public function test_organization_id_in_payload_is_ignored_on_create(): void
    {
        $mine = Organization::factory()->create();
        $theirs = Organization::factory()->create();

        Sanctum::actingAs($this->userWithRole('organization-admin', $mine));

        $this->postJson('/api/v1/customers', [
            'name' => 'Injected Customer',
            'organization_id' => $theirs->id,
        ])->assertCreated();

        $this->assertDatabaseHas('customers', [
            'name' => 'Injected Customer',
            'organization_id' => $mine->id,
        ]);
    }
}
