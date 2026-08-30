<?php

namespace App\Http\Controllers\Operation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Operation\StoreShipperRequest;
use App\Http\Requests\Operation\StoreTravelRequest;
use App\Http\Requests\Operation\UpdateTravelRequest;
use App\Models\BrazilCity;
use App\Models\Employee;
use App\Models\Shipper;
use App\Models\Travel;
use App\Models\TravelCte;
use App\Models\TravelEvent;
use App\Models\VehicleSet;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Schema;
use Throwable;

class TravelController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (! Schema::hasTable('travels')) {
            return response()->json([
                'message' => 'O módulo de viagens ainda não foi preparado no banco de dados. Execute as migrations do backend.',
                'code' => 'TRAVEL_SCHEMA_MISSING',
            ], 503);
        }

        $search = trim((string) $request->query('search', ''));
        $shipperId = (int) $request->query('shipper_id', 0);
        $plate = strtoupper(trim((string) $request->query('plate', '')));
        $cteType = strtoupper(trim((string) $request->query('cte_type', '')));
        $hasTravelCtes = Schema::hasTable('travel_ctes');

        $query = Travel::query()->with('shipperRelation:id,display_color');

        if ($hasTravelCtes) {
            $query->with('ctes');
        }

        $travels = $query
            ->when($shipperId > 0, fn ($query) => $query->where('shipper_id', $shipperId))
            ->when($plate !== '' && $plate !== 'ALL', fn ($query) => $query->where('plate_snapshot', $plate))
            ->when(
                in_array($cteType, ['NORMAL', 'FREIGHT_COMPLEMENT', 'DAILY'], true),
                function ($query) use ($cteType, $hasTravelCtes): void {
                    if ($hasTravelCtes) {
                        $query->whereHas('ctes', fn ($cteQuery) => $cteQuery->where('cte_type', $cteType));
                    } else {
                        $query->where('cte_type', $cteType);
                    }
                }
            )
            ->when($search !== '', function ($query) use ($search, $hasTravelCtes): void {
                $like = '%'.strtolower($search).'%';
                $query->where(function ($query) use ($like, $hasTravelCtes): void {
                    $query
                        ->whereRaw('LOWER(origin) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(destination) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(shipper) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(plate_snapshot) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(driver_one_name, \'\')) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(driver_two_name, \'\')) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(third_party_name, \'\')) LIKE ?', [$like]);

                    if ($hasTravelCtes) {
                        $query->orWhereHas('ctes', function ($cteQuery) use ($like): void {
                            $cteQuery
                                ->whereRaw('LOWER(cte_number) LIKE ?', [$like])
                                ->orWhereRaw('LOWER(cte_series) LIKE ?', [$like])
                                ->orWhereRaw("LOWER(COALESCE(complemented_cte_number, '')) LIKE ?", [$like]);
                        });
                    } else {
                        $query
                            ->orWhereRaw('LOWER(cte_number) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(cte_series) LIKE ?', [$like]);
                    }
                });
            })
            ->orderByDesc('travel_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Travel $travel): array => $this->payload($travel));

        return response()->json([
            'travels' => $travels,
            'total' => $travels->count(),
        ]);
    }

    public function options(): JsonResponse
    {
        $warnings = [];

        $tractors = $this->safeAuxiliaryQuery('vehicles', function (): Collection {
            return Vehicle::query()->where('type', 'TRACTOR')->where('status', 'ACTIVE')->orderBy('plate')
                ->get(['id', 'plate', 'fleet_number'])->map(fn (Vehicle $vehicle): array => [
                    'id' => $vehicle->id,
                    'plate' => $vehicle->plate,
                    'fleet_number' => $vehicle->fleet_number,
                ]);
        }, 'Não foi possível carregar os cavalos cadastrados.', $warnings);

        $trailers = $this->safeAuxiliaryQuery('vehicles', function (): Collection {
            return Vehicle::query()->where('type', 'TRAILER')->where('status', 'ACTIVE')->orderBy('plate')
                ->get(['id', 'plate', 'fleet_number'])->map(fn (Vehicle $vehicle): array => [
                    'id' => $vehicle->id,
                    'plate' => $vehicle->plate,
                    'fleet_number' => $vehicle->fleet_number,
                ]);
        }, 'Não foi possível carregar as carretas cadastradas.', $warnings);

        $drivers = $this->safeAuxiliaryQuery('employees', function (): Collection {
            return Employee::query()
                ->where('status', 'ACTIVE')
                ->whereRaw('LOWER(job_title) LIKE ?', ['%motorista%'])
                ->orderBy('full_name')
                ->get(['id', 'employee_code', 'full_name'])
                ->map(fn (Employee $employee): array => [
                    'id' => $employee->id,
                    'employee_code' => $employee->employee_code,
                    'name' => $employee->full_name,
                ]);
        }, 'Não foi possível carregar os motoristas cadastrados.', $warnings);

        $shippers = $this->safeAuxiliaryQuery(
            'shippers',
            fn (): Collection => Shipper::query()
                ->where('status', 'ACTIVE')
                ->orderBy('name')
                ->get(['id', 'name', 'status', 'display_color'])
                ->map(fn (Shipper $shipper): array => $this->shipperPayload($shipper)),
            'O cadastro de embarcadores ainda não está disponível. Execute as migrations do backend.',
            $warnings
        );

        // O filtro usa a mesma fonte do cadastro. Assim todo embarcador ativo cadastrado,
        // inclusive um recém-criado pelo botão (+), aparece imediatamente na listagem.
        $filterShippers = $shippers->values();

        // O filtro de placas usa exclusivamente os cavalos cadastrados no módulo de Veículos.
        // Placas de terceiros e carretas não entram nesta lista.
        $filterPlates = $this->safeAuxiliaryQuery(
            'vehicles',
            fn (): Collection => Vehicle::query()
                ->where('type', 'TRACTOR')
                ->orderBy('plate')
                ->pluck('plate')
                ->filter()
                ->map(fn ($plate): string => strtoupper((string) $plate))
                ->unique()
                ->values(),
            'Não foi possível carregar as placas dos cavalos cadastrados.',
            $warnings
        );

        $activeSets = collect();
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
            'tractors' => $tractors,
            'trailers' => $trailers,
            'drivers' => $drivers,
            'shippers' => $shippers,
            'filter_shippers' => $filterShippers,
            'filter_plates' => $filterPlates,
            'active_sets' => $activeSets->values(),
            'warnings' => array_values(array_unique($warnings)),
        ]);
    }

    public function cities(): JsonResponse
    {
        if (! Schema::hasTable('brazil_cities') || ! Schema::hasTable('brazil_states')) {
            return response()->json([
                'message' => 'A base de cidades ainda não foi preparada no banco de dados. Execute as migrations do backend.',
                'code' => 'TRAVEL_CITIES_SCHEMA_MISSING',
            ], 503);
        }

        $cities = BrazilCity::query()
            ->join('brazil_states as state', 'state.id', '=', 'brazil_cities.state_id')
            ->orderBy('brazil_cities.name')
            ->orderBy('state.abbreviation')
            ->get([
                'brazil_cities.id',
                'brazil_cities.name',
                'state.abbreviation as state_abbreviation',
            ])
            ->map(fn ($city): array => [
                'id' => (int) $city->id,
                'name' => (string) $city->name,
                'state_abbreviation' => (string) $city->state_abbreviation,
            ]);

        return response()->json(['cities' => $cities]);
    }

    /** @param callable(): Collection $query @param array<int, string> $warnings */
    private function safeAuxiliaryQuery(
        string $table,
        callable $query,
        string $warning,
        array &$warnings
    ): Collection {
        if (! Schema::hasTable($table)) {
            $warnings[] = $warning;
            return collect();
        }

        try {
            return $query();
        } catch (Throwable $exception) {
            report($exception);
            $warnings[] = $warning;
            return collect();
        }
    }

    public function storeShipper(StoreShipperRequest $request): JsonResponse
    {
        if (! Schema::hasTable('shippers')) {
            return response()->json([
                'message' => 'O cadastro de embarcadores ainda não foi preparado no banco. Execute as migrations do backend.',
                'code' => 'SHIPPER_SCHEMA_MISSING',
            ], 503);
        }

        $validated = $request->validated();

        $shipper = Shipper::query()->create([
            'name' => $validated['name'],
            'normalized_name' => $validated['normalized_name'],
            'status' => 'ACTIVE',
            'display_color' => Shipper::suggestedColor($validated['name']),
            'created_by' => $request->user()?->id,
            'updated_by' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Embarcador cadastrado com sucesso.',
            'shipper' => $this->shipperPayload($shipper),
        ], 201);
    }

    public function store(StoreTravelRequest $request): JsonResponse
    {
        if (! Schema::hasTable('travel_ctes')) {
            return response()->json([
                'message' => 'A atualização para múltiplos CT-es ainda não foi aplicada. Execute as migrations do backend.',
                'code' => 'TRAVEL_CTES_SCHEMA_MISSING',
            ], 503);
        }

        try {
            $travel = DB::transaction(function () use ($request): Travel {
                $cteRows = $this->cteAttributes($request);

                $travel = Travel::query()->create([
                    ...$this->attributes($request),
                    ...$this->legacyCteTotals($cteRows),
                    'created_by' => $request->user()?->id,
                    'updated_by' => $request->user()?->id,
                ]);

                $travel->ctes()->createMany($cteRows);

                return $travel->fresh()->loadMissing('ctes');
            });
        } catch (QueryException $exception) {
            return $this->travelDatabaseError($exception);
        }

        return response()->json([
            'message' => 'Viagem cadastrada com sucesso.',
            'travel' => $this->payload($travel),
        ], 201);
    }

    public function update(UpdateTravelRequest $request, Travel $travel): JsonResponse
    {
        if (! Schema::hasTable('travel_ctes')) {
            return response()->json([
                'message' => 'A atualização para múltiplos CT-es ainda não foi aplicada. Execute as migrations do backend.',
                'code' => 'TRAVEL_CTES_SCHEMA_MISSING',
            ], 503);
        }

        try {
            $travel = DB::transaction(function () use ($request, $travel): Travel {
                $travel->loadMissing('ctes');
                $before = $this->auditSnapshot($travel);
                $cteRows = $this->cteAttributes($request);

                $travel->fill([
                    ...$this->attributes($request),
                    ...$this->legacyCteTotals($cteRows),
                    'updated_by' => $request->user()?->id,
                ])->save();

                $travel->ctes()->delete();
                $travel->ctes()->createMany($cteRows);
                $updated = $travel->fresh()->loadMissing('ctes');
                $this->recordAuditEvent($updated, TravelEvent::ACTION_UPDATED, $before, $this->auditSnapshot($updated), $request);

                return $updated;
            });
        } catch (QueryException $exception) {
            return $this->travelDatabaseError($exception);
        }

        return response()->json([
            'message' => 'Viagem atualizada com sucesso.',
            'travel' => $this->payload($travel),
        ]);
    }

    public function destroy(Request $request, Travel $travel): Response
    {
        $travel->loadMissing('ctes');
        $before = $this->auditSnapshot($travel);
        $travel->forceFill(['deleted_by' => $request->user()?->id])->save();
        $travel->delete();
        $this->recordAuditEvent($travel, TravelEvent::ACTION_DELETED, $before, null, $request);
        return response()->noContent();
    }

    public function history(): JsonResponse
    {
        $events = TravelEvent::query()->with('user:id,name,username')
            ->latest('occurred_at')->latest('id')->limit(500)->get()
            ->map(function (TravelEvent $event): array {
                $travel = Travel::withTrashed()->find($event->travel_id);
                return [
                    'id' => $event->id,
                    'travel_id' => (int) $event->travel_id,
                    'action' => $event->action,
                    'before' => $event->before_data,
                    'after' => $event->after_data,
                    'user_name' => $event->user?->name ?? $event->user?->username,
                    'occurred_at' => $event->occurred_at?->toIso8601String(),
                    'inactive' => $travel?->trashed() ?? false,
                ];
            });
        return response()->json(['events' => $events]);
    }

    public function restore(Request $request, int $travel): JsonResponse
    {
        $record = Travel::withTrashed()->with('ctes')->findOrFail($travel);
        if ($record->trashed()) {
            $before = $this->auditSnapshot($record);
            $record->restore();
            $record->forceFill(['deleted_by' => null, 'updated_by' => $request->user()?->id])->save();
            $this->recordAuditEvent($record, TravelEvent::ACTION_RESTORED, $before, $this->auditSnapshot($record), $request);
        }
        return response()->json(['message' => 'Viagem reativada com sucesso.', 'travel' => $this->payload($record->fresh()->loadMissing('ctes'))]);
    }

    /** @return array<string, mixed> */
    private function attributes(StoreTravelRequest $request): array
    {
        $validated = $request->validated();
        $operationType = $validated['operation_type'];

        $shipper = Shipper::query()->findOrFail((int) $validated['shipper_id']);
        $vehicle = null;
        $driverOne = null;
        $driverTwo = null;

        if ($operationType === 'FLEET') {
            $vehicle = Vehicle::query()->findOrFail((int) $validated['vehicle_id']);

            $requiresDriver = collect($validated['ctes'] ?? [])
                ->contains(fn (array $cte): bool => ($cte['cte_type'] ?? 'NORMAL') === 'NORMAL');

            if ($requiresDriver) {
                $driverOne = Employee::query()->findOrFail((int) $validated['driver_one_id']);
                $driverTwo = ! empty($validated['driver_two_id'])
                    ? Employee::query()->findOrFail((int) $validated['driver_two_id'])
                    : null;
            }
        }

        $trailer = ! empty($validated['detached_trailer_id'])
            ? Vehicle::query()->findOrFail((int) $validated['detached_trailer_id'])
            : null;

        $thirdPartyName = $operationType === 'THIRD_PARTY'
            ? trim((string) ($validated['third_party_name'] ?? ''))
            : null;
        $thirdPartyPlate = $operationType === 'THIRD_PARTY'
            ? strtoupper((string) ($validated['third_party_plate'] ?? ''))
            : null;
        $plateSnapshot = $operationType === 'FLEET'
            ? (string) $vehicle?->plate
            : (string) $thirdPartyPlate;

        return [
            'travel_date' => $validated['travel_date'],
            'receipt_date' => $validated['receipt_date'] ?? null,
            'origin' => trim($validated['origin']),
            'destination' => trim($validated['destination']),
            'shipper_id' => $shipper->id,
            'shipper' => $shipper->name,
            'operation_type' => $operationType,
            'vehicle_id' => $vehicle?->id,
            'plate_snapshot' => $plateSnapshot,
            'driver_one_id' => $driverOne?->id,
            'driver_one_name' => $driverOne?->full_name,
            'driver_two_id' => $driverTwo?->id,
            'driver_two_name' => $driverTwo?->full_name,
            'third_party_name' => $thirdPartyName,
            'third_party_plate' => $thirdPartyPlate,
            'third_party_payout_amount' => $operationType === 'THIRD_PARTY'
                ? round((float) ($validated['third_party_payout_amount'] ?? 0), 2)
                : 0,
            'third_party_payout_date' => $operationType === 'THIRD_PARTY'
                ? ($validated['third_party_payout_date'] ?? null)
                : null,
            'detached_trailer_id' => $trailer?->id,
            'detached_trailer_plate_snapshot' => $trailer?->plate,
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function cteAttributes(StoreTravelRequest $request): array
    {
        $ctes = $request->validated('ctes', []);

        return collect($ctes)->map(function (array $cte): array {
            $netFreight = round((float) $cte['net_freight'], 2);
            $insurance = round((float) ($cte['insurance_amount'] ?? 0), 2);
            $toll = round((float) ($cte['toll_amount'] ?? 0), 2);
            $icms = round((float) ($cte['icms_amount'] ?? 0), 2);

            return [
                'cte_type' => $cte['cte_type'],
                'cte_number' => trim((string) $cte['cte_number']),
                'cte_series' => trim((string) $cte['cte_series']),
                'complemented_cte_number' => ($cte['cte_type'] ?? 'NORMAL') !== 'NORMAL'
                    ? trim((string) ($cte['complemented_cte_number'] ?? ''))
                    : null,
                'net_freight' => $netFreight,
                'insurance_amount' => $insurance,
                'toll_amount' => $toll,
                'icms_amount' => $icms,
                'bonus_amount' => 0,
                'gross_freight' => round($netFreight + $insurance + $toll + $icms, 2),
            ];
        })->values()->all();
    }

    /**
     * Mantém os campos antigos de travels sincronizados para BI/Acertos e relatórios
     * que ainda não foram migrados para a relação travel_ctes.
     *
     * @param array<int, array<string, mixed>> $cteRows
     * @return array<string, mixed>
     */
    private function legacyCteTotals(array $cteRows): array
    {
        $first = $cteRows[0];

        return [
            'cte_type' => $first['cte_type'],
            'cte_number' => $first['cte_number'],
            'cte_series' => $first['cte_series'],
            'net_freight' => round((float) collect($cteRows)->sum('net_freight'), 2),
            'insurance_amount' => round((float) collect($cteRows)->sum('insurance_amount'), 2),
            'toll_amount' => round((float) collect($cteRows)->sum('toll_amount'), 2),
            'icms_amount' => round((float) collect($cteRows)->sum('icms_amount'), 2),
            'bonus_amount' => 0,
            'gross_freight' => round((float) collect($cteRows)->sum('gross_freight'), 2),
        ];
    }

    /** @return array<string, mixed> */
    private function auditSnapshot(Travel $travel): array
    {
        $travel->loadMissing('ctes');
        return [
            'id' => $travel->id,
            'date' => $travel->travel_date?->format('Y-m-d'),
            'plate' => $travel->plate_snapshot,
            'trailer_plate' => $travel->detached_trailer_plate_snapshot,
            'origin' => $travel->origin,
            'destination' => $travel->destination,
            'shipper' => $travel->shipper,
            'driver_one' => $travel->driver_one_name,
            'driver_two' => $travel->driver_two_name,
            'gross_freight' => (float) $travel->gross_freight,
            'net_freight' => (float) $travel->net_freight,
            'ctes' => $travel->ctes->map(fn (TravelCte $cte): array => [
                'cte_type' => $cte->cte_type,
                'cte_number' => $cte->cte_number,
                'cte_series' => $cte->cte_series,
                'complemented_cte_number' => $cte->complemented_cte_number,
            ])->values()->all(),
        ];
    }

    private function recordAuditEvent(Travel $travel, string $action, ?array $before, ?array $after, Request $request): void
    {
        TravelEvent::query()->create([
            'travel_id' => $travel->id,
            'action' => $action,
            'before_data' => $before,
            'after_data' => $after,
            'user_id' => $request->user()?->id,
            'occurred_at' => now(),
        ]);
    }

    /** @return array<string, mixed> */
    private function payload(Travel $travel): array
    {
        $ctes = collect();

        if (Schema::hasTable('travel_ctes')) {
            if (! $travel->relationLoaded('ctes')) {
                $travel->load('ctes');
            }
            $ctes = $travel->ctes;
        }

        if ($ctes->isEmpty()) {
            $ctes = collect([
                new TravelCte([
                    'cte_type' => $travel->cte_type,
                    'cte_number' => $travel->cte_number,
                    'cte_series' => $travel->cte_series,
                    'complemented_cte_number' => null,
                    'net_freight' => $travel->net_freight,
                    'insurance_amount' => $travel->insurance_amount,
                    'toll_amount' => $travel->toll_amount,
                    'icms_amount' => $travel->icms_amount,
                    'bonus_amount' => 0,
                    'gross_freight' => $travel->gross_freight,
                ]),
            ]);
        }

        return [
            'id' => $travel->id,
            'cte_type' => $travel->cte_type,
            'travel_date' => $travel->travel_date?->format('Y-m-d'),
            'receipt_date' => $travel->receipt_date?->format('Y-m-d'),
            'origin' => $travel->origin,
            'destination' => $travel->destination,
            'cte_number' => $travel->cte_number,
            'cte_series' => $travel->cte_series,
            'ctes' => $ctes->map(fn (TravelCte $cte): array => $this->ctePayload($cte))->values(),
            'shipper_id' => $travel->shipper_id,
            'shipper' => $travel->shipper,
            'shipper_color' => $travel->shipperRelation?->display_color ?? '#009E60',
            'operation_type' => $travel->operation_type,
            'vehicle_id' => $travel->vehicle_id,
            'plate' => $travel->plate_snapshot,
            'driver_one_id' => $travel->driver_one_id,
            'driver_one_name' => $travel->driver_one_name,
            'driver_two_id' => $travel->driver_two_id,
            'driver_two_name' => $travel->driver_two_name,
            'third_party_name' => $travel->third_party_name,
            'third_party_plate' => $travel->third_party_plate,
            'third_party_payout_amount' => (float) $travel->third_party_payout_amount,
            'third_party_payout_date' => $travel->third_party_payout_date?->format('Y-m-d'),
            'detached_trailer_id' => $travel->detached_trailer_id,
            'detached_trailer_plate' => $travel->detached_trailer_plate_snapshot,
            'net_freight' => (float) $travel->net_freight,
            'insurance_amount' => (float) $travel->insurance_amount,
            'toll_amount' => (float) $travel->toll_amount,
            'icms_amount' => (float) $travel->icms_amount,
            'bonus_amount' => 0.0,
            'gross_freight' => (float) $travel->gross_freight,
            'created_at' => $travel->created_at?->toIso8601String(),
            'updated_at' => $travel->updated_at?->toIso8601String(),
        ];
    }

    /** @return array<string, mixed> */
    private function ctePayload(TravelCte $cte): array
    {
        return [
            'id' => $cte->exists ? $cte->id : 0,
            'cte_type' => $cte->cte_type,
            'cte_number' => $cte->cte_number,
            'cte_series' => $cte->cte_series,
            'complemented_cte_number' => $cte->complemented_cte_number,
            'net_freight' => (float) $cte->net_freight,
            'insurance_amount' => (float) $cte->insurance_amount,
            'toll_amount' => (float) $cte->toll_amount,
            'icms_amount' => (float) $cte->icms_amount,
            'bonus_amount' => 0.0,
            'gross_freight' => (float) $cte->gross_freight,
        ];
    }

    /** @return array{id:int,name:string,status:string,color:string} */
    private function shipperPayload(Shipper $shipper): array
    {
        return [
            'id' => $shipper->id,
            'name' => $shipper->name,
            'status' => $shipper->status,
            'color' => $shipper->display_color ?? '#009E60',
        ];
    }
}
