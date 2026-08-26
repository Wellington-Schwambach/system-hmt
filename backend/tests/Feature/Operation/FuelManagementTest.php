<?php

namespace Tests\Feature\Operation;

use App\Models\Employee;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FuelManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_edit_invoice_and_delete_fuel_record(): void
    {
        $user = User::factory()->create(['menu_permissions' => ['fuel']]);
        $vehicle = $this->vehicle();
        $driver = $this->driver();

        $created = $this->actingAs($user)->postJson('/api/fuel', [
            'vehicle_id' => $vehicle->id,
            'driver_id' => $driver->id,
            'fuel_date' => '2026-08-26',
            'billing_month' => '2026-08',
            'station' => 'MIME',
            'km' => 161000,
            'diesel_liters' => 400,
            'diesel_total_value' => 2168,
            'arla_liters' => 40,
            'arla_total_value' => 216.80,
        ])->assertCreated()
            ->assertJsonPath('record.plate', 'SKT8H52')
            ->assertJsonPath('record.status', 'N')
            ->assertJsonPath('record.vehicle_km_reference', 160000)
            ->assertJsonPath('record.distance_km', 1000)
            ->assertJsonPath('record.diesel_average', 2.5);

        $id = (int) $created->json('record.id');

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'current_km' => 161000,
        ]);

        $this->actingAs($user)->patchJson("/api/fuel/{$id}/invoice", [
            'target' => 'DIESEL',
        ])->assertOk()->assertJsonPath('record.status', 'P');

        $this->actingAs($user)->patchJson("/api/fuel/{$id}/invoice", [
            'target' => 'ARLA',
        ])->assertOk()->assertJsonPath('record.status', 'F');

        $this->actingAs($user)->putJson("/api/fuel/{$id}", [
            'vehicle_id' => $vehicle->id,
            'driver_id' => $driver->id,
            'fuel_date' => '2026-08-26',
            'billing_month' => '2026-08',
            'station' => 'POSTO TESTE',
            'km' => null,
            'diesel_liters' => 410,
            'diesel_total_value' => 2255,
            'arla_liters' => 40,
            'arla_total_value' => 216.80,
        ])->assertOk()
            ->assertJsonPath('record.station', 'POSTO TESTE')
            ->assertJsonPath('record.km', null)
            ->assertJsonPath('record.distance_km', null)
            ->assertJsonPath('record.diesel_average', 0);

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'current_km' => 161000,
        ]);

        $this->actingAs($user)->deleteJson("/api/fuel/{$id}")->assertNoContent();

        $this->assertSoftDeleted('fuel_records', [
            'id' => $id,
            'deleted_by' => $user->id,
        ]);
    }

    public function test_optional_km_never_reduces_vehicle_odometer_and_only_valid_distance_generates_average(): void
    {
        $user = User::factory()->create(['menu_permissions' => ['fuel']]);
        $vehicle = $this->vehicle();
        $driver = $this->driver();

        $basePayload = [
            'vehicle_id' => $vehicle->id,
            'driver_id' => $driver->id,
            'fuel_date' => '2026-08-26',
            'billing_month' => '2026-08',
            'station' => 'POSTO TESTE',
            'diesel_liters' => 400,
            'diesel_total_value' => 2168,
            'arla_liters' => 0,
            'arla_total_value' => 0,
        ];

        $this->actingAs($user)->postJson('/api/fuel', [
            ...$basePayload,
            'km' => null,
        ])->assertCreated()
            ->assertJsonPath('record.km', null)
            ->assertJsonPath('record.distance_km', null)
            ->assertJsonPath('record.diesel_average', 0);

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'current_km' => 160000,
        ]);

        $this->actingAs($user)->postJson('/api/fuel', [
            ...$basePayload,
            'km' => 159000,
        ])->assertCreated()
            ->assertJsonPath('record.km', 159000)
            ->assertJsonPath('record.distance_km', null)
            ->assertJsonPath('record.diesel_average', 0);

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'current_km' => 160000,
        ]);

        $this->actingAs($user)->postJson('/api/fuel', [
            ...$basePayload,
            'km' => 160000,
        ])->assertCreated()
            ->assertJsonPath('record.distance_km', 0)
            ->assertJsonPath('record.diesel_average', 0);

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'current_km' => 160000,
        ]);

        $this->actingAs($user)->postJson('/api/fuel', [
            ...$basePayload,
            'km' => 161000,
        ])->assertCreated()
            ->assertJsonPath('record.distance_km', 1000)
            ->assertJsonPath('record.diesel_average', 2.5);

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'current_km' => 161000,
        ]);
    }

    private function vehicle(): Vehicle
    {
        return Vehicle::query()->create([
            'plate' => 'SKT8H52',
            'type' => 'TRACTOR',
            'brand' => 'Scania',
            'model' => 'R460',
            'manufacture_year' => 2025,
            'model_year' => 2026,
            'current_km' => 160000,
            'status' => 'ACTIVE',
        ]);
    }

    private function driver(): Employee
    {
        return Employee::query()->create([
            'employee_code' => '129',
            'full_name' => 'Patrick',
            'cpf' => '11111111111',
            'birth_date' => '1990-01-01',
            'job_title' => 'Motorista',
            'admission_date' => '2025-01-01',
            'status' => 'ACTIVE',
        ]);
    }
}
