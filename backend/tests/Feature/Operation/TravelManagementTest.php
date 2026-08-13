<?php

namespace Tests\Feature\Operation;

use App\Models\Employee;
use App\Models\Shipper;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TravelManagementTest extends TestCase
{


    public function test_travel_model_uses_the_travels_table(): void
    {
        $this->assertSame('travels', (new \App\Models\Travel())->getTable());
    }

    use RefreshDatabase;

    public function test_user_can_create_and_update_third_party_travel_without_fleet_links(): void
    {
        $user = User::factory()->create(['menu_permissions' => ['travel']]);
        $shipper = $this->shipper();

        $response = $this->actingAs($user)->postJson('/api/travels', [
            ...$this->basePayload($shipper->id, '900001'),
            'operation_type' => 'THIRD_PARTY',
            'vehicle_id' => 999999,
            'driver_one_id' => 999999,
            'third_party_name' => 'Transportadora Terceira Ltda.',
            'third_party_plate' => 'ABC1D23',
            'third_party_payout_amount' => 4500.50,
        ]);

        $response->assertCreated()
            ->assertJsonPath('travel.operation_type', 'THIRD_PARTY')
            ->assertJsonPath('travel.plate', 'ABC1D23')
            ->assertJsonPath('travel.vehicle_id', null)
            ->assertJsonPath('travel.driver_one_id', null);

        $travelId = (int) $response->json('travel.id');
        $this->assertDatabaseHas('travels', [
            'id' => $travelId,
            'operation_type' => 'THIRD_PARTY',
            'vehicle_id' => null,
            'driver_one_id' => null,
            'third_party_plate' => 'ABC1D23',
        ]);

        $this->actingAs($user)->putJson("/api/travels/{$travelId}", [
            ...$this->basePayload($shipper->id, '900001'),
            'operation_type' => 'THIRD_PARTY',
            'third_party_name' => 'Transportadora Atualizada Ltda.',
            'third_party_plate' => 'DEF4G56',
            'third_party_payout_amount' => 4700,
        ])->assertOk()
            ->assertJsonPath('travel.third_party_plate', 'DEF4G56');
    }

    public function test_user_can_create_and_update_fleet_travel_without_third_party_data(): void
    {
        $user = User::factory()->create(['menu_permissions' => ['travel']]);
        $shipper = $this->shipper();
        $tractor = $this->vehicle('AAA1A11', 'TRACTOR');
        $driver = $this->driver();

        $response = $this->actingAs($user)->postJson('/api/travels', [
            ...$this->basePayload($shipper->id, '900002'),
            'operation_type' => 'FLEET',
            'vehicle_id' => $tractor->id,
            'driver_one_id' => $driver->id,
            'third_party_name' => 'Dado antigo que deve ser ignorado',
            'third_party_plate' => 'ZZZ9Z99',
            'third_party_payout_amount' => 9999,
        ]);

        $response->assertCreated()
            ->assertJsonPath('travel.operation_type', 'FLEET')
            ->assertJsonPath('travel.vehicle_id', $tractor->id)
            ->assertJsonPath('travel.driver_one_id', $driver->id)
            ->assertJsonPath('travel.third_party_name', null);

        $travelId = (int) $response->json('travel.id');
        $this->assertDatabaseHas('travels', [
            'id' => $travelId,
            'operation_type' => 'FLEET',
            'vehicle_id' => $tractor->id,
            'driver_one_id' => $driver->id,
            'third_party_name' => null,
            'third_party_plate' => null,
            'third_party_payout_amount' => 0,
        ]);

        $this->actingAs($user)->putJson("/api/travels/{$travelId}", [
            ...$this->basePayload($shipper->id, '900002'),
            'operation_type' => 'FLEET',
            'vehicle_id' => $tractor->id,
            'driver_one_id' => $driver->id,
        ])->assertOk();
    }

    public function test_mode_specific_fields_have_friendly_validation_messages(): void
    {
        $user = User::factory()->create(['menu_permissions' => ['travel']]);
        $shipper = $this->shipper();

        $this->actingAs($user)->postJson('/api/travels', [
            ...$this->basePayload($shipper->id, '900003'),
            'operation_type' => 'THIRD_PARTY',
            'third_party_name' => '',
            'third_party_plate' => 'INVALIDA',
            'third_party_payout_amount' => null,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors([
                'third_party_name',
                'third_party_plate',
                'third_party_payout_amount',
            ]);

        $this->actingAs($user)->postJson('/api/travels', [
            ...$this->basePayload($shipper->id, '900004'),
            'operation_type' => 'FLEET',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['vehicle_id', 'driver_one_id']);
    }

    /** @return array<string, mixed> */
    private function basePayload(int $shipperId, string $cteNumber): array
    {
        return [
            'travel_date' => '2026-08-13',
            'receipt_date' => '2026-08-14',
            'origin' => 'Itajaí - SC',
            'destination' => 'São Paulo - SP',
            'shipper_id' => $shipperId,
            'detached_trailer_id' => null,
            'ctes' => [[
                'cte_type' => 'NORMAL',
                'cte_number' => $cteNumber,
                'cte_series' => '1',
                'net_freight' => 10000,
                'insurance_amount' => 500,
                'toll_amount' => 300,
                'icms_amount' => 1200,
            ]],
        ];
    }

    private function shipper(): Shipper
    {
        return Shipper::query()->create([
            'name' => 'Embarcador Teste',
            'normalized_name' => 'EMBARCADOR TESTE',
            'status' => 'ACTIVE',
        ]);
    }

    private function vehicle(string $plate, string $type): Vehicle
    {
        return Vehicle::query()->create([
            'fleet_number' => 'F-'.substr($plate, -3),
            'plate' => $plate,
            'type' => $type,
            'brand' => 'Scania',
            'model' => 'R460',
            'manufacture_year' => 2024,
            'model_year' => 2025,
            'status' => 'ACTIVE',
        ]);
    }

    private function driver(): Employee
    {
        return Employee::query()->create([
            'employee_code' => 'MOT-900',
            'full_name' => 'Motorista Teste',
            'cpf' => '98765432100',
            'birth_date' => '1990-01-01',
            'job_title' => 'Motorista',
            'admission_date' => '2024-01-01',
            'status' => 'ACTIVE',
        ]);
    }
}
