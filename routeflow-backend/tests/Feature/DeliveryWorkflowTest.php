<?php

namespace Tests\Feature;

use App\Enums\DeliveryStatus;
use App\Enums\DriverStatus;
use App\Enums\VehicleStatus;
use App\Models\Delivery;
use App\Models\Driver;
use App\Models\Organization;
use App\Models\Role;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DeliveryWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRolesAndPermissions();
        $this->organization = Organization::factory()->create();
    }

    private function makeDelivery(DeliveryStatus $status = DeliveryStatus::PENDING): Delivery
    {
        return Delivery::factory()->create([
            'organization_id' => $this->organization->id,
            'shipment_id' => Shipment::factory()->create(['organization_id' => $this->organization->id])->id,
            'status' => $status,
        ]);
    }

    public function test_dispatcher_can_assign_an_available_driver_and_vehicle(): void
    {
        $delivery = $this->makeDelivery();
        $driver = Driver::factory()->create([
            'organization_id' => $this->organization->id,
            'user_id' => User::factory()->for($this->organization)->create()->id,
            'status' => DriverStatus::AVAILABLE,
        ]);
        $vehicle = Vehicle::factory()->create(['organization_id' => $this->organization->id, 'status' => VehicleStatus::AVAILABLE]);

        Sanctum::actingAs($this->userWithRole('dispatcher', $this->organization));

        $this->postJson("/api/v1/deliveries/{$delivery->id}/assign", [
            'driver_id' => $driver->id,
            'vehicle_id' => $vehicle->id,
        ])->assertOk();

        $this->assertSame(DeliveryStatus::ASSIGNED, $delivery->fresh()->status);
        $this->assertSame(DriverStatus::ON_DELIVERY, $driver->fresh()->status);
        $this->assertSame(VehicleStatus::IN_USE, $vehicle->fresh()->status);
    }

    public function test_cannot_assign_a_driver_who_is_already_on_a_delivery(): void
    {
        $delivery = $this->makeDelivery();
        $busyDriver = Driver::factory()->create([
            'organization_id' => $this->organization->id,
            'user_id' => User::factory()->for($this->organization)->create()->id,
            'status' => DriverStatus::ON_DELIVERY,
        ]);
        $vehicle = Vehicle::factory()->create(['organization_id' => $this->organization->id]);

        Sanctum::actingAs($this->userWithRole('dispatcher', $this->organization));

        $this->postJson("/api/v1/deliveries/{$delivery->id}/assign", [
            'driver_id' => $busyDriver->id,
            'vehicle_id' => $vehicle->id,
        ])->assertStatus(422)->assertJsonValidationErrors('driver_id');
    }

    public function test_illegal_status_transition_is_rejected(): void
    {
        $delivery = $this->makeDelivery(DeliveryStatus::PENDING);

        Sanctum::actingAs($this->userWithRole('dispatcher', $this->organization));

        // PENDING -> DELIVERED skips the entire workflow.
        $this->postJson("/api/v1/deliveries/{$delivery->id}/status", [
            'status' => DeliveryStatus::DELIVERED->value,
        ])->assertStatus(422);

        $this->assertSame(DeliveryStatus::PENDING, $delivery->fresh()->status);
    }

    public function test_every_status_change_is_recorded_in_history(): void
    {
        $delivery = $this->makeDelivery(DeliveryStatus::ASSIGNED);

        Sanctum::actingAs($this->userWithRole('dispatcher', $this->organization));

        $this->postJson("/api/v1/deliveries/{$delivery->id}/status", [
            'status' => DeliveryStatus::PICKED_UP->value,
        ])->assertOk();

        $this->assertDatabaseHas('delivery_status_histories', [
            'delivery_id' => $delivery->id,
            'status' => DeliveryStatus::PICKED_UP->value,
        ]);
        $this->assertNotNull($delivery->fresh()->picked_up_at);
    }

    public function test_driver_can_only_act_on_their_own_delivery(): void
    {
        $otherDelivery = $this->makeDelivery(DeliveryStatus::ASSIGNED);

        $driverUser = User::factory()->for($this->organization)->create();
        $driverUser->roles()->attach(Role::whereNull('organization_id')->where('slug', 'driver')->first());
        Driver::factory()->create(['organization_id' => $this->organization->id, 'user_id' => $driverUser->id]);

        Sanctum::actingAs($driverUser->load('roles.permissions', 'driver'));

        $this->postJson("/api/v1/deliveries/{$otherDelivery->id}/status", [
            'status' => DeliveryStatus::PICKED_UP->value,
        ])->assertForbidden();
    }
}
