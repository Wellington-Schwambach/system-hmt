<?php

namespace App\Http\Controllers\Operation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Operation\InvoiceFuelRecordRequest;
use App\Http\Requests\Operation\SaveFuelRecordRequest;
use App\Models\Employee;
use App\Models\FuelRecord;
use App\Models\FuelRecordEvent;
use App\Models\VehicleSet;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class FuelController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'billing_month' => ['nullable', 'date_format:Y-m'],
        ]);

        $query = FuelRecord::query();

        if (! empty($validated['billing_month'])) {
            $query->whereDate('billing_month', $validated['billing_month'] . '-01');
        }

        $records = $query
            ->orderByDesc('billing_month')
            ->orderByDesc('fuel_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (FuelRecord $record): array => $this->payload($record));

        return response()->json([
            'records' => $records,
            'total' => $records->count(),
        ]);
    }

    public function options(): JsonResponse
    {
        $tractors = collect();
        $drivers = collect();
        $trailers = collect();
        $activeSets = collect();
        $filterPlates = collect();

        if (Schema::hasTable('vehicles')) {
            $tractors = Vehicle::query()
                ->where('type', 'TRACTOR')
                ->where('status', 'ACTIVE')
                ->orderBy('plate')
                ->get(['id', 'plate', 'fleet_number', 'current_km'])
                ->map(fn (Vehicle $vehicle): array => [
                    'id' => $vehicle->id,
                    'plate' => $vehicle->plate,
                    'fleet_number' => $vehicle->fleet_number,
                    'current_km' => (int) $vehicle->current_km,
                ]);

            $filterPlates = Vehicle::query()
                ->where('type', 'TRACTOR')
                ->orderBy('plate')
                ->pluck('plate')
                ->filter()
                ->map(fn ($plate): string => strtoupper((string) $plate))
                ->unique()
                ->values();


            $trailers = Vehicle::query()
                ->where('type', 'TRAILER')
                ->where('status', 'ACTIVE')
                ->orderBy('plate')
                ->get(['id', 'plate', 'fleet_number'])
                ->map(fn (Vehicle $vehicle): array => [
                    'id' => $vehicle->id,
                    'plate' => $vehicle->plate,
                    'fleet_number' => $vehicle->fleet_number,
                ]);
        }

        if (Schema::hasTable('employees')) {
            $drivers = Employee::query()
                ->where('status', 'ACTIVE')
                ->whereRaw('LOWER(job_title) LIKE ?', ['%motorista%'])
                ->orderBy('full_name')
                ->get(['id', 'employee_code', 'full_name'])
                ->map(fn (Employee $employee): array => [
                    'id' => $employee->id,
                    'employee_code' => $employee->employee_code,
                    'name' => $employee->full_name,
                ]);
        }

        if (Schema::hasTable('vehicle_sets')) {
            $activeSets = VehicleSet::query()
                ->where('status', VehicleSet::STATUS_ACTIVE)
                ->get(['id', 'tractor_id', 'trailer_id', 'driver_id', 'driver_two_id'])
                ->map(fn (VehicleSet $set): array => [
                    'id' => (int) $set->id,
                    'tractor_id' => $set->tractor_id ? (int) $set->tractor_id : null,
                    'trailer_id' => $set->trailer_id ? (int) $set->trailer_id : null,
                    'driver_id' => $set->driver_id ? (int) $set->driver_id : null,
                    'driver_two_id' => $set->driver_two_id ? (int) $set->driver_two_id : null,
                ]);
        }

        return response()->json([
            'tractors' => $tractors->values(),
            'trailers' => $trailers->values(),
            'drivers' => $drivers->values(),
            'active_sets' => $activeSets->values(),
            'filter_plates' => $filterPlates->values(),
        ]);
    }

    public function importLegacy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'records' => ['required', 'array', 'max:500'],
            'records.*.date' => ['required', 'date_format:Y-m-d'],
            'records.*.station' => ['required', 'string', 'max:120'],
            'records.*.plate' => ['required', 'string', 'max:10'],
            'records.*.km' => ['nullable', 'integer', 'min:0'],
            'records.*.dieselLiters' => ['required', 'numeric', 'min:0'],
            'records.*.dieselTotalValue' => ['required', 'numeric', 'min:0'],
            'records.*.arlaLiters' => ['nullable', 'numeric', 'min:0'],
            'records.*.arlaTotalValue' => ['nullable', 'numeric', 'min:0'],
            'records.*.driver' => ['required', 'string', 'max:180'],
            'records.*.dieselInvoiced' => ['nullable', 'boolean'],
            'records.*.arlaInvoiced' => ['nullable', 'boolean'],
        ]);

        if (FuelRecord::query()->exists()) {
            return response()->json(['imported' => 0, 'message' => 'O banco já possui abastecimentos.']);
        }

        $userId = $request->user()?->id;
        $imported = 0;

        DB::transaction(function () use ($validated, $userId, &$imported): void {
            $affectedVehicleIds = [];

            foreach ($validated['records'] as $item) {
                $plate = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', (string) $item['plate']));
                $vehicle = Vehicle::query()->where('plate', $plate)->where('type', 'TRACTOR')->first();
                if (! $vehicle) continue;

                $driverName = trim((string) $item['driver']);
                $driver = Employee::query()->whereRaw('LOWER(full_name) = ?', [mb_strtolower($driverName)])->first();
                $hasArla = (float) ($item['arlaLiters'] ?? 0) > 0 || (float) ($item['arlaTotalValue'] ?? 0) > 0;
                $dieselInvoiced = (bool) ($item['dieselInvoiced'] ?? false);
                $arlaInvoiced = $hasArla && (bool) ($item['arlaInvoiced'] ?? false);

                FuelRecord::query()->create([
                    'vehicle_id' => $vehicle->id,
                    'driver_id' => $driver?->id,
                    'plate' => $plate,
                    'driver_name' => $driver?->full_name ?? $driverName,
                    'fuel_date' => $item['date'],
                    'billing_month' => substr((string) $item['date'], 0, 7) . '-01',
                    'station' => trim((string) $item['station']),
                    'km' => ! empty($item['km']) ? (int) $item['km'] : null,
                    'diesel_liters' => (float) $item['dieselLiters'],
                    'diesel_total_value' => (float) $item['dieselTotalValue'],
                    'arla_liters' => (float) ($item['arlaLiters'] ?? 0),
                    'arla_total_value' => (float) ($item['arlaTotalValue'] ?? 0),
                    'diesel_invoiced' => $dieselInvoiced,
                    'arla_invoiced' => $arlaInvoiced,
                    'diesel_invoiced_at' => $dieselInvoiced ? now() : null,
                    'arla_invoiced_at' => $arlaInvoiced ? now() : null,
                    'diesel_invoiced_by' => $dieselInvoiced ? $userId : null,
                    'arla_invoiced_by' => $arlaInvoiced ? $userId : null,
                    'created_by' => $userId,
                    'updated_by' => $userId,
                ]);
                $affectedVehicleIds[(int) $vehicle->id] = true;
                $imported++;
            }

            foreach (array_keys($affectedVehicleIds) as $vehicleId) {
                $vehicle = Vehicle::query()->whereKey($vehicleId)->lockForUpdate()->first();
                if (! $vehicle) {
                    continue;
                }

                // Na importação histórica não usamos o KM atual do veículo como base,
                // pois ele normalmente representa o odômetro mais recente da frota.
                $this->recalculateVehicleFuelMetrics((int) $vehicleId, null);

                $maxFuelKm = FuelRecord::query()
                    ->where('vehicle_id', $vehicleId)
                    ->whereNotNull('km')
                    ->max('km');
                $this->updateVehicleCurrentKm($vehicle, $maxFuelKm, $userId);
            }
        });

        return response()->json([
            'imported' => $imported,
            'message' => $imported > 0 ? 'Abastecimentos anteriores importados para o banco.' : 'Nenhum abastecimento anterior pôde ser importado.',
        ]);
    }

    public function store(SaveFuelRecordRequest $request): JsonResponse
    {
        $record = DB::transaction(function () use ($request): FuelRecord {
            $vehicle = Vehicle::query()
                ->whereKey((int) $request->integer('vehicle_id'))
                ->lockForUpdate()
                ->firstOrFail();
            $driver = Employee::query()->findOrFail((int) $request->integer('driver_id'));
            $trailer = $request->filled('trailer_id') ? Vehicle::query()->findOrFail((int) $request->integer('trailer_id')) : null;
            $sequenceBaseline = $this->fuelSequenceBaseline((int) $vehicle->id);
            if ($sequenceBaseline === null && ! $this->vehicleHasActiveFuelRecords((int) $vehicle->id)) {
                $sequenceBaseline = (int) $vehicle->current_km > 0 ? (int) $vehicle->current_km : null;
            }

            $attributes = $this->attributes($request, $vehicle, $driver, $trailer);

            $record = FuelRecord::query()->create([
                ...$attributes,
                'created_by' => $request->user()?->id,
                'updated_by' => $request->user()?->id,
            ]);

            $this->recalculateVehicleFuelMetrics((int) $vehicle->id, $sequenceBaseline);
            $this->updateVehicleCurrentKm($vehicle, $attributes['km'], $request->user()?->id);

            return $record->fresh();
        });

        return response()->json([
            'message' => 'Abastecimento cadastrado com sucesso.',
            'record' => $this->payload($record),
        ], 201);
    }

    public function update(SaveFuelRecordRequest $request, FuelRecord $fuelRecord): JsonResponse
    {
        DB::transaction(function () use ($request, $fuelRecord): void {
            $oldVehicleId = (int) $fuelRecord->vehicle_id;
            Vehicle::query()
                ->whereKey($oldVehicleId)
                ->lockForUpdate()
                ->first();

            $vehicle = Vehicle::query()
                ->whereKey((int) $request->integer('vehicle_id'))
                ->lockForUpdate()
                ->firstOrFail();
            $driver = Employee::query()->findOrFail((int) $request->integer('driver_id'));
            $trailer = $request->filled('trailer_id') ? Vehicle::query()->findOrFail((int) $request->integer('trailer_id')) : null;
            $sameVehicle = $oldVehicleId === (int) $vehicle->id;
            $oldSequenceBaseline = $this->fuelSequenceBaseline($oldVehicleId);
            $newSequenceBaseline = $sameVehicle
                ? $oldSequenceBaseline
                : $this->fuelSequenceBaseline((int) $vehicle->id);

            if (! $sameVehicle && $newSequenceBaseline === null && ! $this->vehicleHasActiveFuelRecords((int) $vehicle->id)) {
                $newSequenceBaseline = (int) $vehicle->current_km > 0 ? (int) $vehicle->current_km : null;
            }

            $attributes = $this->attributes($request, $vehicle, $driver, $trailer);
            $attributes['updated_by'] = $request->user()?->id;

            if ((float) $attributes['arla_liters'] <= 0 || (float) $attributes['arla_total_value'] <= 0) {
                $attributes['arla_liters'] = 0;
                $attributes['arla_total_value'] = 0;
                $attributes['arla_invoiced'] = false;
                $attributes['arla_invoiced_at'] = null;
                $attributes['arla_invoiced_by'] = null;
            }

            $before = $this->auditSnapshot($fuelRecord);
            $fuelRecord->fill($attributes)->save();
            $this->recordAuditEvent($fuelRecord, FuelRecordEvent::ACTION_UPDATED, $before, $this->auditSnapshot($fuelRecord->fresh()), $request);

            if (! $sameVehicle) {
                $this->recalculateVehicleFuelMetrics($oldVehicleId, $oldSequenceBaseline);
            }
            $this->recalculateVehicleFuelMetrics((int) $vehicle->id, $newSequenceBaseline);
            $this->updateVehicleCurrentKm($vehicle, $attributes['km'], $request->user()?->id);
        });

        return response()->json([
            'message' => 'Abastecimento atualizado com sucesso.',
            'record' => $this->payload($fuelRecord->fresh()),
        ]);
    }

    public function invoice(InvoiceFuelRecordRequest $request, FuelRecord $fuelRecord): JsonResponse
    {
        $target = (string) $request->validated('target');

        if ($target === 'ARLA' && ((float) $fuelRecord->arla_liters <= 0 || (float) $fuelRecord->arla_total_value <= 0)) {
            throw ValidationException::withMessages([
                'target' => ['Este abastecimento não possui ARLA para faturar.'],
            ]);
        }

        $userId = $request->user()?->id;

        if ($target === 'DIESEL') {
            $fuelRecord->forceFill([
                'diesel_invoiced' => true,
                'diesel_invoiced_at' => now(),
                'diesel_invoiced_by' => $userId,
                'updated_by' => $userId,
            ])->save();
        } else {
            $fuelRecord->forceFill([
                'arla_invoiced' => true,
                'arla_invoiced_at' => now(),
                'arla_invoiced_by' => $userId,
                'updated_by' => $userId,
            ])->save();
        }

        return response()->json([
            'message' => sprintf('%s faturado com sucesso.', $target === 'DIESEL' ? 'Diesel' : 'ARLA'),
            'record' => $this->payload($fuelRecord->fresh()),
        ]);
    }

    public function destroy(Request $request, FuelRecord $fuelRecord): Response
    {
        DB::transaction(function () use ($request, $fuelRecord): void {
            $vehicleId = (int) $fuelRecord->vehicle_id;
            Vehicle::query()->whereKey($vehicleId)->lockForUpdate()->first();
            $sequenceBaseline = $this->fuelSequenceBaseline($vehicleId);

            $before = $this->auditSnapshot($fuelRecord);
            $fuelRecord->forceFill(['deleted_by' => $request->user()?->id])->save();
            $fuelRecord->delete();
            $this->recordAuditEvent($fuelRecord, FuelRecordEvent::ACTION_DELETED, $before, null, $request);

            $this->recalculateVehicleFuelMetrics($vehicleId, $sequenceBaseline);
        });

        return response()->noContent();
    }

    public function history(): JsonResponse
    {
        $events = FuelRecordEvent::query()->with('user:id,name,username')
            ->latest('occurred_at')->latest('id')->limit(500)->get()
            ->map(function (FuelRecordEvent $event): array {
                $record = FuelRecord::withTrashed()->find($event->fuel_record_id);
                return [
                    'id' => $event->id,
                    'record_id' => (int) $event->fuel_record_id,
                    'action' => $event->action,
                    'before' => $event->before_data,
                    'after' => $event->after_data,
                    'user_name' => $event->user?->name ?? $event->user?->username,
                    'occurred_at' => $event->occurred_at?->toIso8601String(),
                    'inactive' => $record?->trashed() ?? false,
                ];
            });
        return response()->json(['events' => $events]);
    }

    public function restore(Request $request, int $fuelRecord): JsonResponse
    {
        $record = DB::transaction(function () use ($request, $fuelRecord): FuelRecord {
            $record = FuelRecord::withTrashed()->lockForUpdate()->findOrFail($fuelRecord);
            $vehicle = Vehicle::query()->whereKey((int) $record->vehicle_id)->lockForUpdate()->first();

            if (! $record->trashed()) {
                return $record->fresh();
            }

            $sequenceBaseline = $this->fuelSequenceBaseline((int) $record->vehicle_id)
                ?? ($record->vehicle_km_reference !== null ? (int) $record->vehicle_km_reference : null);

            if ($sequenceBaseline === null && ! $this->vehicleHasActiveFuelRecords((int) $record->vehicle_id)) {
                $sequenceBaseline = $vehicle && (int) $vehicle->current_km > 0
                    ? (int) $vehicle->current_km
                    : null;
            }

            $before = $this->auditSnapshot($record);
            $record->restore();
            $record->forceFill(['deleted_by' => null, 'updated_by' => $request->user()?->id])->save();
            $this->recalculateVehicleFuelMetrics((int) $record->vehicle_id, $sequenceBaseline);
            if ($vehicle) {
                $this->updateVehicleCurrentKm($vehicle, $record->km, $request->user()?->id);
            }
            $this->recordAuditEvent($record, FuelRecordEvent::ACTION_RESTORED, $before, $this->auditSnapshot($record->fresh()), $request);

            return $record->fresh();
        });

        return response()->json(['message' => 'Abastecimento reativado com sucesso.', 'record' => $this->payload($record)]);
    }

    /** @return array<string, mixed> */
    private function attributes(
        SaveFuelRecordRequest $request,
        Vehicle $vehicle,
        Employee $driver,
        ?Vehicle $trailer,
    ): array {
        $validated = $request->validated();
        $fuelKm = isset($validated['km']) && $validated['km'] !== null
            ? (int) $validated['km']
            : null;
        $dieselLiters = round((float) $validated['diesel_liters'], 2, PHP_ROUND_HALF_UP);
        $dieselTotalValue = round((float) $validated['diesel_total_value'], 2, PHP_ROUND_HALF_UP);
        $arlaLiters = round((float) ($validated['arla_liters'] ?? 0), 2, PHP_ROUND_HALF_UP);
        $arlaTotalValue = round((float) ($validated['arla_total_value'] ?? 0), 2, PHP_ROUND_HALF_UP);

        return [
            'vehicle_id' => $vehicle->id,
            'trailer_id' => $trailer?->id,
            'driver_id' => $driver->id,
            'plate' => strtoupper($vehicle->plate),
            'trailer_plate_snapshot' => $trailer?->plate ? strtoupper($trailer->plate) : null,
            'driver_name' => $driver->full_name,
            'fuel_date' => $validated['fuel_date'],
            'billing_month' => $validated['billing_month'] . '-01',
            'station' => $validated['station'],
            'km' => $fuelKm,
            'vehicle_km_reference' => null,
            'distance_km' => null,
            'diesel_average' => 0.0,
            'diesel_liters' => $dieselLiters,
            'diesel_total_value' => $dieselTotalValue,
            'arla_liters' => $arlaLiters,
            'arla_total_value' => $arlaTotalValue,
        ];
    }

    private function vehicleHasActiveFuelRecords(int $vehicleId): bool
    {
        return FuelRecord::query()->where('vehicle_id', $vehicleId)->exists();
    }

    private function fuelSequenceBaseline(int $vehicleId): ?int
    {
        // A única referência que pode ser reaproveitada é a referência do primeiro
        // abastecimento cronológico com KM. Referências de registros posteriores
        // podem ter sido gravadas pela regra antiga usando o KM atual do veículo e,
        // por isso, não podem servir de âncora para toda a sequência.
        $firstRecordWithKm = FuelRecord::query()
            ->where('vehicle_id', $vehicleId)
            ->whereNotNull('km')
            ->orderBy('fuel_date')
            ->orderBy('id')
            ->lockForUpdate()
            ->first(['km', 'vehicle_km_reference']);

        if (! $firstRecordWithKm || $firstRecordWithKm->vehicle_km_reference === null) {
            return null;
        }

        $fuelKm = (int) $firstRecordWithKm->km;
        $referenceKm = (int) $firstRecordWithKm->vehicle_km_reference;

        // Uma referência maior que o próprio primeiro KM é impossível
        // cronologicamente e denuncia a regra antiga baseada no odômetro atual.
        return $referenceKm > 0 && $referenceKm <= $fuelKm
            ? $referenceKm
            : null;
    }

    /**
     * Recalcula a sequência ativa de abastecimentos do veículo em ordem cronológica.
     *
     * A média nunca usa vehicles.current_km como referência para registros históricos.
     * Depois do primeiro ponto conhecido, a referência passa a ser o último KM válido
     * de abastecimento anterior. Um KM regressivo fica sem distância/média e não reduz
     * a referência utilizada pelos registros seguintes.
     */
    private function recalculateVehicleFuelMetrics(int $vehicleId, ?int $initialReferenceKm = null): void
    {
        $records = FuelRecord::query()
            ->where('vehicle_id', $vehicleId)
            ->orderBy('fuel_date')
            ->orderBy('id')
            ->lockForUpdate()
            ->get(['id', 'km', 'diesel_liters']);

        if ($records->isEmpty()) {
            return;
        }

        $firstFuelKm = $records
            ->pluck('km')
            ->first(fn ($value): bool => $value !== null && (int) $value > 0);

        $lastValidKm = $initialReferenceKm !== null && $initialReferenceKm > 0
            ? $initialReferenceKm
            : null;

        // Caso uma abastecida retroativa seja inserida antes da referência que
        // existia até então, essa referência deixa de ser válida. Ex.: a frota
        // estava em 365.188 km e depois é lançada uma abastecida antiga de
        // 362.000 km. O primeiro registro fica como ponto de partida e os
        // seguintes passam a usar sempre o KM cronologicamente anterior.
        if ($firstFuelKm !== null && $lastValidKm !== null && $lastValidKm > (int) $firstFuelKm) {
            $lastValidKm = null;
        }

        foreach ($records as $record) {
            $fuelKm = $record->km !== null ? (int) $record->km : null;
            $referenceKm = $lastValidKm;
            $distanceKm = null;
            $dieselAverage = 0.0;

            if ($fuelKm !== null && $referenceKm !== null && $fuelKm >= $referenceKm) {
                $distanceKm = $fuelKm - $referenceKm;
                $dieselLiters = (float) $record->diesel_liters;
                $dieselAverage = $dieselLiters > 0
                    ? round($distanceKm / $dieselLiters, 3)
                    : 0.0;
            }

            FuelRecord::query()
                ->whereKey($record->id)
                ->update([
                    'vehicle_km_reference' => $referenceKm,
                    'distance_km' => $distanceKm,
                    'diesel_average' => $dieselAverage,
                ]);

            if ($fuelKm === null) {
                continue;
            }

            if ($lastValidKm === null || $fuelKm >= $lastValidKm) {
                $lastValidKm = $fuelKm;
            }
        }
    }

    private function updateVehicleCurrentKm(Vehicle $vehicle, mixed $fuelKm, ?int $userId): void
    {
        if ($fuelKm === null) {
            return;
        }

        $fuelKm = (int) $fuelKm;
        if ($fuelKm < (int) $vehicle->current_km) {
            return;
        }

        $vehicle->forceFill([
            'current_km' => $fuelKm,
            'updated_by' => $userId,
        ])->save();
    }

    /** @return array<string, mixed> */
    private function auditSnapshot(FuelRecord $record): array
    {
        return [
            'id' => $record->id,
            'date' => $record->fuel_date?->format('Y-m-d'),
            'billing_month' => $record->billing_month?->format('Y-m'),
            'plate' => $record->plate,
            'trailer_plate' => $record->trailer_plate_snapshot,
            'driver' => $record->driver_name,
            'station' => $record->station,
            'km' => $record->km,
            'diesel_liters' => (float) $record->diesel_liters,
            'diesel_total_value' => (float) $record->diesel_total_value,
            'arla_liters' => (float) $record->arla_liters,
            'arla_total_value' => (float) $record->arla_total_value,
        ];
    }

    private function recordAuditEvent(FuelRecord $record, string $action, ?array $before, ?array $after, Request $request): void
    {
        FuelRecordEvent::query()->create([
            'fuel_record_id' => $record->id,
            'action' => $action,
            'before_data' => $before,
            'after_data' => $after,
            'user_id' => $request->user()?->id,
            'occurred_at' => now(),
        ]);
    }

    /** @return array<string, mixed> */
    private function payload(FuelRecord $record): array
    {
        $hasArla = (float) $record->arla_liters > 0 || (float) $record->arla_total_value > 0;
        $status = $record->diesel_invoiced && (! $hasArla || $record->arla_invoiced)
            ? 'F'
            : ($hasArla && ($record->diesel_invoiced || $record->arla_invoiced) ? 'P' : 'N');

        return [
            'id' => $record->id,
            'vehicle_id' => $record->vehicle_id,
            'trailer_id' => $record->trailer_id,
            'trailer_plate' => $record->trailer_plate_snapshot,
            'driver_id' => $record->driver_id,
            'date' => $record->fuel_date?->format('Y-m-d'),
            'billing_month' => $record->billing_month?->format('Y-m') ?? $record->fuel_date?->format('Y-m'),
            'station' => $record->station,
            'plate' => $record->plate,
            'km' => $record->km,
            'vehicle_km_reference' => $record->vehicle_km_reference,
            'distance_km' => $record->distance_km,
            'diesel_average' => $record->diesel_average !== null ? (float) $record->diesel_average : null,
            'diesel_liters' => (float) $record->diesel_liters,
            'diesel_total_value' => (float) $record->diesel_total_value,
            'arla_liters' => (float) $record->arla_liters,
            'arla_total_value' => (float) $record->arla_total_value,
            'driver' => $record->driver_name,
            'diesel_invoiced' => (bool) $record->diesel_invoiced,
            'arla_invoiced' => (bool) $record->arla_invoiced,
            'status' => $status,
            'created_at' => $record->created_at?->toISOString(),
            'updated_at' => $record->updated_at?->toISOString(),
        ];
    }
}
