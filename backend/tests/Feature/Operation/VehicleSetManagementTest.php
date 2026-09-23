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
            'released_at' => '2026-08-25 11:30:00',
            'assigned_at' => '2026-08-25 12:00:00',
        ])->assertOk()
            ->assertJsonPath('set.driver_name', 'Motorista Dois');

        $this->actingAs($user)->postJson("/api/vehicle-sets/{$setId}/detach", [
            'detached_at' => '2026-08-25 18:00:00',
        ])->assertOk();

        $this->assertDatabaseHas('vehicle_sets', ['id' => $setId, 'status' => 'DETACHED']);
        $this->assertDatabaseHas('vehicle_set_events', [
            'vehicle_set_id' => $setId,
            'action' => 'DRIVER_RELEASED',
            'driver_id' => $firstDriver->id,
            'occurred_at' => '2026-08-25 11:30:00',
        ]);
        $this->assertDatabaseHas('vehicle_set_events', [
            'vehicle_set_id' => $setId,
            'action' => 'DRIVER_ASSIGNED',
            'driver_id' => $secondDriver->id,
            'occurred_at' => '2026-08-25 12:00:00',
        ]);
        $this->assertDatabaseHas('vehicle_set_events', ['vehicle_set_id' => $setId, 'action' => 'DETACHED']);
    }

    public function test_driver_exit_and_new_driver_entry_can_have_independent_times(): void
    {
        $user = User::factory()->create(['menu_permissions' => ['vehicle_sets']]);
        $tractor = $this->vehicle('TIM1E23', 'TRACTOR');
        $firstDriver = $this->driver('MOT-401', 'Motorista Atual', '10101010101');
        $secondDriver = $this->driver('MOT-402', 'Motorista Novo', '20202020202');

        $created = $this->actingAs($user)->postJson('/api/vehicle-sets', [
            'tractor_id' => $tractor->id,
            'driver_id' => $firstDriver->id,
            'coupled_at' => '2026-08-27 08:00:00',
            'driver_assigned_at' => '2026-08-27 08:00:00',
        ])->assertCreated();

        $setId = (int) $created->json('set.id');

        $this->actingAs($user)->putJson("/api/vehicle-sets/{$setId}/driver", [
            'driver_id' => $secondDriver->id,
            'released_at' => '2026-08-27 12:00:00',
            'assigned_at' => '2026-08-27 11:30:00',
        ])->assertOk()
            ->assertJsonPath('set.driver_name', 'Motorista Novo');

        $this->assertDatabaseHas('vehicle_set_events', [
            'vehicle_set_id' => $setId,
            'action' => 'DRIVER_RELEASED',
            'driver_id' => $firstDriver->id,
            'occurred_at' => '2026-08-27 12:00:00',
        ]);
        $this->assertDatabaseHas('vehicle_set_events', [
            'vehicle_set_id' => $setId,
            'action' => 'DRIVER_ASSIGNED',
            'driver_id' => $secondDriver->id,
            'occurred_at' => '2026-08-27 11:30:00',
        ]);
    }

    public function test_second_driver_can_be_linked_to_the_same_active_set(): void
    {
        $user = User::factory()->create(['menu_permissions' => ['vehicle_sets']]);
        $tractor = $this->vehicle('TWO1A23', 'TRACTOR');
        $trailer = $this->vehicle('TWO4B56', 'TRAILER');
        $firstDriver = $this->driver('MOT-201', 'Motorista Principal', '55555555555');
        $secondDriver = $this->driver('MOT-202', 'Motorista Auxiliar', '66666666666');

        $response = $this->actingAs($user)->postJson('/api/vehicle-sets', [
            'tractor_id' => $tractor->id,
            'trailer_id' => $trailer->id,
            'driver_id' => $firstDriver->id,
            'driver_two_id' => $secondDriver->id,
            'coupled_at' => '2026-08-26 08:00:00',
            'driver_assigned_at' => '2026-08-26 08:05:00',
            'driver_two_assigned_at' => '2026-08-26 08:10:00',
        ]);

        $response->assertCreated()
            ->assertJsonPath('set.driver_name', 'Motorista Principal')
            ->assertJsonPath('set.driver_two_name', 'Motorista Auxiliar');

        $setId = (int) $response->json('set.id');
        $this->assertDatabaseHas('vehicle_sets', [
            'id' => $setId,
            'driver_id' => $firstDriver->id,
            'driver_two_id' => $secondDriver->id,
        ]);
        $this->assertDatabaseHas('vehicle_set_events', [
            'vehicle_set_id' => $setId,
            'action' => 'DRIVER_ASSIGNED',
            'driver_id' => $secondDriver->id,
        ]);
    }

    public function test_second_driver_can_be_added_after_set_is_created(): void
    {
        $user = User::factory()->create(['menu_permissions' => ['vehicle_sets']]);
        $tractor = $this->vehicle('ADD1C23', 'TRACTOR');
        $trailer = $this->vehicle('ADD4D56', 'TRAILER');
        $firstDriver = $this->driver('MOT-301', 'Motorista Um', '77777777777');
        $secondDriver = $this->driver('MOT-302', 'Motorista Dois', '88888888888');

        $created = $this->actingAs($user)->postJson('/api/vehicle-sets', [
            'tractor_id' => $tractor->id,
            'trailer_id' => $trailer->id,
            'driver_id' => $firstDriver->id,
            'coupled_at' => '2026-08-26 09:00:00',
            'driver_assigned_at' => '2026-08-26 09:00:00',
        ])->assertCreated();

        $setId = (int) $created->json('set.id');
        $this->actingAs($user)->putJson("/api/vehicle-sets/{$setId}/driver", [
            'driver_id' => $secondDriver->id,
            'assigned_at' => '2026-08-26 10:00:00',
            'slot' => 'SECONDARY',
        ])->assertOk()
            ->assertJsonPath('set.driver_two_name', 'Motorista Dois');
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
