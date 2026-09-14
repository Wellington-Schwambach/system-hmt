<?php

namespace Tests\Feature\Operation;

use App\Models\Employee;
use App\Models\FuelRecord;
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
            ->assertJsonPath('record.vehicle_km_reference', 159000)
            ->assertJsonPath('record.distance_km', 1000)
            ->assertJsonPath('record.diesel_average', 2.5);

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

    public function test_retroactive_fueling_recalculates_chronological_averages_without_reducing_vehicle_odometer(): void
    {
        $user = User::factory()->create(['menu_permissions' => ['fuel']]);
        $vehicle = $this->vehicle();
        $vehicle->forceFill(['current_km' => 196000])->save();
        $driver = $this->driver();

        $basePayload = [
            'vehicle_id' => $vehicle->id,
            'driver_id' => $driver->id,
            'billing_month' => '2026-09',
            'station' => 'POSTO TESTE',
            'diesel_liters' => 400,
            'diesel_total_value' => 2200,
            'arla_liters' => 0,
            'arla_total_value' => 0,
        ];

        $first = $this->actingAs($user)->postJson('/api/fuel', [
            ...$basePayload,
            'fuel_date' => '2026-09-02',
            'km' => 196000,
        ])->assertCreated();

        $later = $this->actingAs($user)->postJson('/api/fuel', [
            ...$basePayload,
            'fuel_date' => '2026-09-08',
            'km' => 200000,
        ])->assertCreated()
            ->assertJsonPath('record.vehicle_km_reference', 196000)
            ->assertJsonPath('record.distance_km', 4000)
            ->assertJsonPath('record.diesel_average', 10);

        $retroactive = $this->actingAs($user)->postJson('/api/fuel', [
            ...$basePayload,
            'fuel_date' => '2026-09-05',
            'km' => 198000,
        ])->assertCreated()
            ->assertJsonPath('record.vehicle_km_reference', 196000)
            ->assertJsonPath('record.distance_km', 2000)
            ->assertJsonPath('record.diesel_average', 5);

        $laterId = (int) $later->json('record.id');
        $retroactiveId = (int) $retroactive->json('record.id');

        $this->assertDatabaseHas('fuel_records', [
            'id' => $laterId,
            'vehicle_km_reference' => 198000,
            'distance_km' => 2000,
            'diesel_average' => 5.000,
        ]);
        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'current_km' => 200000,
        ]);

        $this->actingAs($user)->deleteJson("/api/fuel/{$retroactiveId}")->assertNoContent();

        $this->assertDatabaseHas('fuel_records', [
            'id' => $laterId,
            'vehicle_km_reference' => 196000,
            'distance_km' => 4000,
            'diesel_average' => 10.000,
        ]);
        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'current_km' => 200000,
        ]);

        $this->actingAs($user)->patchJson("/api/fuel/{$retroactiveId}/restore")
            ->assertOk()
            ->assertJsonPath('record.vehicle_km_reference', 196000)
            ->assertJsonPath('record.distance_km', 2000)
            ->assertJsonPath('record.diesel_average', 5);

        $this->assertDatabaseHas('fuel_records', [
            'id' => $laterId,
            'vehicle_km_reference' => 198000,
            'distance_km' => 2000,
            'diesel_average' => 5.000,
        ]);

        $firstId = (int) $first->json('record.id');
        $this->assertNotNull(FuelRecord::query()->find($firstId));
    }


    public function test_retroactive_sequence_discards_future_odometer_baseline_and_uses_previous_fueling_km(): void
    {
        $user = User::factory()->create(['menu_permissions' => ['fuel']]);
        $vehicle = $this->vehicle();
        $vehicle->forceFill(['current_km' => 365188])->save();
        $driver = $this->driver();

        $basePayload = [
            'vehicle_id' => $vehicle->id,
            'driver_id' => $driver->id,
            'billing_month' => '2026-09',
            'station' => 'MIME',
            'diesel_liters' => 260,
            'diesel_total_value' => 1800,
            'arla_liters' => 0,
            'arla_total_value' => 0,
        ];

        $first = $this->actingAs($user)->postJson('/api/fuel', [
            ...$basePayload,
            'fuel_date' => '2026-09-05',
            'km' => 362000,
        ])->assertCreated()
            ->assertJsonPath('record.vehicle_km_reference', null)
            ->assertJsonPath('record.distance_km', null)
            ->assertJsonPath('record.diesel_average', 0);

        $second = $this->actingAs($user)->postJson('/api/fuel', [
            ...$basePayload,
            'fuel_date' => '2026-09-07',
            'km' => 365000,
        ])->assertCreated()
            ->assertJsonPath('record.vehicle_km_reference', 362000)
            ->assertJsonPath('record.distance_km', 3000)
            ->assertJsonPath('record.diesel_average', 11.538);

        $third = $this->actingAs($user)->postJson('/api/fuel', [
            ...$basePayload,
            'fuel_date' => '2026-09-10',
            'km' => 367000,
        ])->assertCreated()
            ->assertJsonPath('record.vehicle_km_reference', 365000)
            ->assertJsonPath('record.distance_km', 2000)
            ->assertJsonPath('record.diesel_average', 7.692);

        $this->assertDatabaseHas('fuel_records', [
            'id' => (int) $second->json('record.id'),
            'vehicle_km_reference' => 362000,
            'distance_km' => 3000,
            'diesel_average' => 11.538,
        ]);
        $this->assertDatabaseHas('fuel_records', [
            'id' => (int) $third->json('record.id'),
            'vehicle_km_reference' => 365000,
            'distance_km' => 2000,
            'diesel_average' => 7.692,
        ]);
        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'current_km' => 367000,
        ]);

        $this->assertNotNull(FuelRecord::query()->find((int) $first->json('record.id')));
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
