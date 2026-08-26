<?php

namespace Tests\Feature\Operation;

use App\Models\Employee;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VehicleSetManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_mount_change_driver_and_detach_a_vehicle_set(): void
    {
        $user = User::factory()->create(['menu_permissions' => ['vehicle_sets']]);
        $tractor = $this->vehicle('ABC1D23', 'TRACTOR');
        $trailer = $this->vehicle('DEF4G56', 'TRAILER');
        $firstDriver = $this->driver('MOT-001', 'Motorista Um', '11111111111');
        $secondDriver = $this->driver('MOT-002', 'Motorista Dois', '22222222222');

        $response = $this->actingAs($user)->postJson('/api/vehicle-sets', [
            'tractor_id' => $tractor->id,
            'trailer_id' => $trailer->id,
            'driver_id' => $firstDriver->id,
            'coupled_at' => '2026-08-25 08:00:00',
            'driver_assigned_at' => '2026-08-25 08:10:00',
        ]);

        $response->assertCreated()
            ->assertJsonPath('set.tractor_plate', 'ABC1D23')
            ->assertJsonPath('set.trailer_plate', 'DEF4G56')
            ->assertJsonPath('set.driver_name', 'Motorista Um');

        $setId = (int) $response->json('set.id');
        $this->assertDatabaseHas('vehicle_set_events', ['vehicle_set_id' => $setId, 'action' => 'COUPLED']);
        $this->assertDatabaseHas('vehicle_set_events', ['vehicle_set_id' => $setId, 'action' => 'DRIVER_ASSIGNED']);

        $this->actingAs($user)->putJson("/api/vehicle-sets/{$setId}/driver", [
            'driver_id' => $secondDriver->id,
            'assigned_at' => '2026-08-25 12:00:00',
        ])->assertOk()
            ->assertJsonPath('set.driver_name', 'Motorista Dois');

        $this->actingAs($user)->postJson("/api/vehicle-sets/{$setId}/detach", [
            'detached_at' => '2026-08-25 18:00:00',
        ])->assertOk();

        $this->assertDatabaseHas('vehicle_sets', ['id' => $setId, 'status' => 'DETACHED']);
        $this->assertDatabaseHas('vehicle_set_events', ['vehicle_set_id' => $setId, 'action' => 'DRIVER_CHANGED']);
        $this->assertDatabaseHas('vehicle_set_events', ['vehicle_set_id' => $setId, 'action' => 'DETACHED']);
    }

    public function test_active_tractor_trailer_and_driver_cannot_be_reused(): void
    {
        $user = User::factory()->create(['menu_permissions' => ['vehicle_sets']]);
        $tractor = $this->vehicle('AAA1A11', 'TRACTOR');
        $otherTractor = $this->vehicle('BBB2B22', 'TRACTOR');
        $trailer = $this->vehicle('CCC3C33', 'TRAILER');
        $otherTrailer = $this->vehicle('DDD4D44', 'TRAILER');
        $driver = $this->driver('MOT-101', 'Motorista A', '33333333333');
        $otherDriver = $this->driver('MOT-102', 'Motorista B', '44444444444');

        $payload = [
            'tractor_id' => $tractor->id,
            'trailer_id' => $trailer->id,
            'driver_id' => $driver->id,
            'coupled_at' => '2026-08-25 08:00:00',
            'driver_assigned_at' => '2026-08-25 08:00:00',
        ];

        $this->actingAs($user)->postJson('/api/vehicle-sets', $payload)->assertCreated();

        $this->actingAs($user)->postJson('/api/vehicle-sets', [
            ...$payload,
            'trailer_id' => $otherTrailer->id,
            'driver_id' => $otherDriver->id,
        ])->assertUnprocessable()->assertJsonValidationErrors(['tractor_id']);

        $this->actingAs($user)->postJson('/api/vehicle-sets', [
            ...$payload,
            'tractor_id' => $otherTractor->id,
            'driver_id' => $otherDriver->id,
        ])->assertUnprocessable()->assertJsonValidationErrors(['trailer_id']);
    }

    private function vehicle(string $plate, string $type): Vehicle
    {
        return Vehicle::query()->create([
            'plate' => $plate,
            'type' => $type,
            'brand' => 'Scania',
            'model' => $type === 'TRACTOR' ? 'R460' : 'Carreta 3 Eixos',
            'manufacture_year' => 2025,
            'model_year' => 2026,
            'status' => 'ACTIVE',
        ]);
    }

    private function driver(string $code, string $name, string $cpf): Employee
    {
        return Employee::query()->create([
            'employee_code' => $code,
            'full_name' => $name,
            'cpf' => $cpf,
            'birth_date' => '1990-01-01',
            'job_title' => 'Motorista',
            'admission_date' => '2025-01-01',
            'status' => 'ACTIVE',
        ]);
    }
}
