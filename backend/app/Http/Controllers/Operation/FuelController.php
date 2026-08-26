<?php

namespace App\Http\Controllers\Operation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Operation\InvoiceFuelRecordRequest;
use App\Http\Requests\Operation\SaveFuelRecordRequest;
use App\Models\Employee;
use App\Models\FuelRecord;
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

        return response()->json([
            'tractors' => $tractors->values(),
            'drivers' => $drivers->values(),
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
                $imported++;
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
            $vehicleKmReference = (int) $vehicle->current_km;
            $attributes = $this->attributes($request, $vehicle, $driver, $vehicleKmReference);

            $record = FuelRecord::query()->create([
                ...$attributes,
                'created_by' => $request->user()?->id,
                'updated_by' => $request->user()?->id,
            ]);

            $this->updateVehicleCurrentKm($vehicle, $attributes['km'], $request->user()?->id);

            return $record;
        });

        return response()->json([
            'message' => 'Abastecimento cadastrado com sucesso.',
            'record' => $this->payload($record),
        ], 201);
    }

    public function update(SaveFuelRecordRequest $request, FuelRecord $fuelRecord): JsonResponse
    {
        DB::transaction(function () use ($request, $fuelRecord): void {
            $vehicle = Vehicle::query()
                ->whereKey((int) $request->integer('vehicle_id'))
                ->lockForUpdate()
                ->firstOrFail();
            $driver = Employee::query()->findOrFail((int) $request->integer('driver_id'));
            $sameVehicle = (int) $fuelRecord->vehicle_id === (int) $vehicle->id;
            $vehicleKmReference = $sameVehicle && $fuelRecord->vehicle_km_reference !== null
                ? (int) $fuelRecord->vehicle_km_reference
                : (int) $vehicle->current_km;
            $attributes = $this->attributes($request, $vehicle, $driver, $vehicleKmReference);
            $attributes['updated_by'] = $request->user()?->id;

            if ((float) $attributes['arla_liters'] <= 0 || (float) $attributes['arla_total_value'] <= 0) {
                $attributes['arla_liters'] = 0;
                $attributes['arla_total_value'] = 0;
                $attributes['arla_invoiced'] = false;
                $attributes['arla_invoiced_at'] = null;
                $attributes['arla_invoiced_by'] = null;
            }

            $fuelRecord->fill($attributes)->save();
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
        $fuelRecord->forceFill([
            'deleted_by' => $request->user()?->id,
        ])->save();
        $fuelRecord->delete();

        return response()->noContent();
    }

    /** @return array<string, mixed> */
    private function attributes(
        SaveFuelRecordRequest $request,
        Vehicle $vehicle,
        Employee $driver,
        int $vehicleKmReference,
    ): array {
        $validated = $request->validated();
        $fuelKm = isset($validated['km']) && $validated['km'] !== null
            ? (int) $validated['km']
            : null;
        $dieselLiters = (float) $validated['diesel_liters'];

        $hasValidDistance = $fuelKm !== null
            && $vehicleKmReference > 0
            && $fuelKm >= $vehicleKmReference;

        $distanceKm = $hasValidDistance
            ? $fuelKm - $vehicleKmReference
            : null;
        $dieselAverage = $distanceKm !== null && $dieselLiters > 0
            ? round($distanceKm / $dieselLiters, 3)
            : 0.0;

        return [
            'vehicle_id' => $vehicle->id,
            'driver_id' => $driver->id,
            'plate' => strtoupper($vehicle->plate),
            'driver_name' => $driver->full_name,
            'fuel_date' => $validated['fuel_date'],
            'billing_month' => $validated['billing_month'] . '-01',
            'station' => $validated['station'],
            'km' => $fuelKm,
            'vehicle_km_reference' => $vehicleKmReference > 0 ? $vehicleKmReference : null,
            'distance_km' => $distanceKm,
            'diesel_average' => $dieselAverage,
            'diesel_liters' => $validated['diesel_liters'],
            'diesel_total_value' => $validated['diesel_total_value'],
            'arla_liters' => $validated['arla_liters'] ?? 0,
            'arla_total_value' => $validated['arla_total_value'] ?? 0,
        ];
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
    private function payload(FuelRecord $record): array
    {
        $hasArla = (float) $record->arla_liters > 0 || (float) $record->arla_total_value > 0;
        $status = $record->diesel_invoiced && (! $hasArla || $record->arla_invoiced)
            ? 'F'
            : ($hasArla && ($record->diesel_invoiced || $record->arla_invoiced) ? 'P' : 'N');

        return [
            'id' => $record->id,
            'vehicle_id' => $record->vehicle_id,
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
