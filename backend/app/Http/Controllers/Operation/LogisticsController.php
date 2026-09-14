<?php

namespace App\Http\Controllers\Operation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Operation\MoveLogisticsLoadRequest;
use App\Http\Requests\Operation\SaveLogisticsLoadRequest;
use App\Models\BrazilCity;
use App\Models\Employee;
use App\Models\LogisticsCargoType;
use App\Models\LogisticsContainerType;
use App\Models\LogisticsLocationType;
use App\Models\LogisticsShipowner;
use App\Models\LogisticsLoad;
use App\Models\LogisticsLoadEvent;
use App\Models\LogisticsLoadStatusNote;
use App\Models\Shipper;
use App\Models\Vehicle;
use App\Models\VehicleSet;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class LogisticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = LogisticsLoad::query()->with($this->relations());

        $status = strtoupper((string) $request->query('status', 'PROCESSING'));
        if (! in_array($status, ['PROCESSING', 'FINALIZED', 'ALL'], true)) {
            $status = 'PROCESSING';
        }

        if ($status === 'PROCESSING') {
            $query->whereNull('completed_at');
        } elseif ($status === 'FINALIZED') {
            $query->whereNotNull('completed_at');
        }

        $referenceDateExpression = "CASE
            WHEN completed_at IS NOT NULL THEN completed_at
            WHEN stage = 'PROGRAMMING' AND collection_at IS NULL THEN COALESCE(collection_scheduled_at, loading_at, scheduled_at)
            WHEN stage = 'PROGRAMMING' THEN COALESCE(collection_at, collection_scheduled_at, scheduled_at)
            WHEN stage = 'COLLECTION' THEN COALESCE(loading_at, collection_at, scheduled_at)
            WHEN stage = 'LOADING' THEN COALESCE(delivery_at, loading_at, scheduled_at)
            WHEN stage = 'DELIVERY' THEN COALESCE(delivery_at, loading_at, collection_at, scheduled_at)
            ELSE scheduled_at
        END";

        if ($request->filled('date_from')) {
            $query->whereRaw("DATE({$referenceDateExpression}) >= ?", [(string) $request->query('date_from')]);
        }

        if ($request->filled('date_to')) {
            $query->whereRaw("DATE({$referenceDateExpression}) <= ?", [(string) $request->query('date_to')]);
        }

        if ($request->filled('shipper_id')) {
            $query->where('shipper_id', (int) $request->query('shipper_id'));
        }

        if ($request->filled('driver_id')) {
            $driverId = (int) $request->query('driver_id');
            $query->where(fn (Builder $builder) => $builder
                ->where('driver_id', $driverId)
                ->orWhere('driver_two_id', $driverId));
        }

        if ($request->filled('tractor_id')) {
            $query->where('tractor_id', (int) $request->query('tractor_id'));
        }

        if ($request->filled('stage')) {
            $query->where('stage', (string) $request->query('stage'));
        }

        if ($request->filled('location')) {
            $location = trim((string) $request->query('location'));
            $query->where(fn (Builder $builder) => $builder
                ->where('collection_terminal', 'ILIKE', "%{$location}%")
                ->orWhere('loading_location', 'ILIKE', "%{$location}%")
                ->orWhere('delivery_location', 'ILIKE', "%{$location}%"));
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where(fn (Builder $builder) => $builder
                ->where('reference_code', 'ILIKE', "%{$search}%")
                ->orWhere('shipment_number', 'ILIKE', "%{$search}%")
                ->orWhere('load_number', 'ILIKE', "%{$search}%")
                ->orWhere('cargo_number', 'ILIKE', "%{$search}%")
                ->orWhereRaw('CAST(load_entries AS TEXT) ILIKE ?', ["%{$search}%"])
                ->orWhere('shipowner', 'ILIKE', "%{$search}%")
                ->orWhere('booking_number', 'ILIKE', "%{$search}%")
                ->orWhere('collection_booking_number', 'ILIKE', "%{$search}%")
                ->orWhere('grade_number', 'ILIKE', "%{$search}%")
                ->orWhere('collection_terminal', 'ILIKE', "%{$search}%")
                ->orWhere('loading_location', 'ILIKE', "%{$search}%")
                ->orWhere('delivery_location', 'ILIKE', "%{$search}%")
                ->orWhere('third_party_tractor_plate', 'ILIKE', "%{$search}%")
                ->orWhere('third_party_trailer_plate', 'ILIKE', "%{$search}%")
                ->orWhereHas('shipownerRelation', fn (Builder $shipowner) => $shipowner->where('name', 'ILIKE', "%{$search}%"))
                ->orWhereHas('shipper', fn (Builder $shipper) => $shipper->where('name', 'ILIKE', "%{$search}%"))
                ->orWhereHas('tractor', fn (Builder $tractor) => $tractor->where('plate', 'ILIKE', "%{$search}%"))
                ->orWhereHas('trailer', fn (Builder $trailer) => $trailer->where('plate', 'ILIKE', "%{$search}%")));
        }

        if ($status === 'FINALIZED') {
            $query->orderByDesc('completed_at')->orderByDesc('id');
        } else {
            $query
                ->orderByRaw("CASE stage WHEN 'PROGRAMMING' THEN 1 WHEN 'COLLECTION' THEN 2 WHEN 'LOADING' THEN 3 WHEN 'DELIVERY' THEN 4 ELSE 9 END")
                ->orderByRaw("{$referenceDateExpression} ASC NULLS LAST")
                ->orderBy('id');
        }

        $loads = $query->get()->map(fn (LogisticsLoad $load): array => $this->loadPayload($load));

        return response()->json(['loads' => $loads]);
    }

    public function calendar(Request $request): JsonResponse
    {
        if ($request->filled('date_from') || $request->filled('date_to')) {
            $validated = $request->validate([
                'date_from' => ['required', 'date_format:Y-m-d'],
                'date_to' => ['required', 'date_format:Y-m-d', 'after_or_equal:date_from'],
                'shipper_id' => ['nullable', 'integer', 'exists:shippers,id'],
            ]);

            $dateFrom = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $validated['date_from'].' 00:00:00');
            $dateTo = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $validated['date_to'].' 23:59:59');

            if ($dateFrom === false || $dateTo === false || $dateFrom->diffInDays($dateTo) > 31) {
                throw ValidationException::withMessages([
                    'date_from' => ['Informe um período válido de até 31 dias.'],
                ]);
            }

            $query = LogisticsLoad::query()
                ->with($this->relations())
                ->where(function ($query) use ($dateFrom, $dateTo): void {
                    // A agenda semanal só usa datas operacionais reais.
                    // Não usamos scheduled_at/created_at como fallback para evitar cargas
                    // aparecendo em dias sem coleta, carregamento ou entrega preenchidos.
                    $query->whereBetween('collection_scheduled_at', [$dateFrom, $dateTo])
                        ->orWhereRaw(
                            "EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(collection_appointments, '[]'::jsonb)) AS appointment WHERE NULLIF(appointment->>'scheduled_at', '')::timestamp BETWEEN ? AND ?)",
                            [$dateFrom, $dateTo]
                        )
                        ->orWhereBetween('collection_at', [$dateFrom, $dateTo])
                        ->orWhereBetween('loading_at', [$dateFrom, $dateTo])
                        ->orWhereBetween('delivery_at', [$dateFrom, $dateTo])
                        ->orWhereRaw(
                            "EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(delivery_appointments, '[]'::jsonb)) AS appointment WHERE NULLIF(appointment->>'scheduled_at', '')::timestamp BETWEEN ? AND ?)",
                            [$dateFrom, $dateTo]
                        );
                });

            if (! empty($validated['shipper_id'])) {
                $query->where('shipper_id', (int) $validated['shipper_id']);
            }

            $loads = $query
                ->orderByRaw('COALESCE(collection_scheduled_at, collection_at, loading_at, delivery_at) ASC NULLS LAST')
                ->orderBy('id')
                ->get();

            return response()->json([
                'date_from' => $validated['date_from'],
                'date_to' => $validated['date_to'],
                'loads' => $loads->map(fn (LogisticsLoad $load): array => $this->loadPayload($load))->values(),
            ]);
        }

        $month = trim((string) $request->query('month', now()->format('Y-m')));

        if (! preg_match('/^\d{4}-\d{2}$/', $month)) {
            throw ValidationException::withMessages([
                'month' => ['Informe o mês no formato AAAA-MM.'],
            ]);
        }

        try {
            $monthStart = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $month.'-01 00:00:00');
        } catch (\Throwable) {
            throw ValidationException::withMessages([
                'month' => ['Informe um mês válido.'],
            ]);
        }

        if ($monthStart === false || $monthStart->format('Y-m') !== $month) {
            throw ValidationException::withMessages([
                'month' => ['Informe um mês válido.'],
            ]);
        }

        $monthEnd = $monthStart->endOfMonth()->endOfDay();
        $query = LogisticsLoad::query()
            ->with($this->relations())
            ->whereNotNull('loading_at')
            ->whereBetween('loading_at', [$monthStart, $monthEnd]);

        if ($request->filled('shipper_id')) {
            $query->where('shipper_id', (int) $request->query('shipper_id'));
        }

        $loads = $query
            ->orderBy('loading_at')
            ->orderBy('shipowner')
            ->orderBy('id')
            ->get();

        $counts = $loads
            ->groupBy(fn (LogisticsLoad $load): string => $load->loading_at?->format('Y-m-d') ?? '')
            ->filter(fn ($items, string $date): bool => $date !== '')
            ->map(fn ($items): int => $items->count());

        return response()->json([
            'month' => $month,
            'counts' => $counts,
            'loads' => $loads->map(fn (LogisticsLoad $load): array => $this->loadPayload($load))->values(),
        ]);
    }

    public function options(): JsonResponse
    {
        $shippers = Shipper::query()
            ->where('status', 'ACTIVE')
            ->orderBy('name')
            ->get(['id', 'name', 'display_color'])
            ->map(fn (Shipper $shipper): array => [
                'id' => (int) $shipper->id,
                'name' => (string) $shipper->name,
                'display_color' => (string) ($shipper->display_color ?: Shipper::suggestedColor($shipper->name)),
            ]);

        $drivers = Employee::query()
            ->where('status', 'ACTIVE')
            ->whereRaw('LOWER(job_title) LIKE ?', ['%motorista%'])
            ->orderBy('full_name')
            ->get(['id', 'employee_code', 'full_name'])
            ->map(fn (Employee $driver): array => [
                'id' => (int) $driver->id,
                'employee_code' => (string) $driver->employee_code,
                'name' => (string) $driver->full_name,
            ]);

        $tractors = Vehicle::query()
            ->where('status', 'ACTIVE')
            ->where('type', 'TRACTOR')
            ->orderBy('plate')
            ->get(['id', 'plate', 'fleet_number', 'brand', 'model'])
            ->map(fn (Vehicle $vehicle): array => $this->vehicleOption($vehicle));

        $trailers = Vehicle::query()
            ->where('status', 'ACTIVE')
            ->where('type', 'TRAILER')
            ->orderBy('plate')
            ->get(['id', 'plate', 'fleet_number', 'brand', 'model'])
            ->map(fn (Vehicle $vehicle): array => $this->vehicleOption($vehicle));

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

        $cargoTypes = Schema::hasTable('logistics_cargo_types')
            ? LogisticsCargoType::query()->where('active', true)->orderBy('name')->get(['id', 'name'])->map(fn ($item): array => ['id' => (int) $item->id, 'name' => (string) $item->name])
            : collect();
        $containerTypes = Schema::hasTable('logistics_container_types')
            ? LogisticsContainerType::query()->where('active', true)->orderBy('name')->get(['id', 'name'])->map(fn ($item): array => ['id' => (int) $item->id, 'name' => (string) $item->name])
            : collect();
        $shipowners = Schema::hasTable('logistics_shipowners')
            ? LogisticsShipowner::query()->where('active', true)->orderBy('name')->get(['id', 'name'])->map(fn ($item): array => ['id' => (int) $item->id, 'name' => (string) $item->name])
            : collect();
        $locationTypes = Schema::hasTable('logistics_location_types')
            ? LogisticsLocationType::query()->where('active', true)->orderBy('scope')->orderBy('name')->get(['id', 'name', 'scope'])->map(fn ($item): array => ['id' => (int) $item->id, 'name' => (string) $item->name, 'scope' => (string) $item->scope])
            : collect();
        $cities = (Schema::hasTable('brazil_cities') && Schema::hasTable('brazil_states'))
            ? BrazilCity::query()
                ->join('brazil_states as state', 'state.id', '=', 'brazil_cities.state_id')
                ->orderBy('brazil_cities.name')
                ->get(['brazil_cities.id', 'brazil_cities.name', 'state.abbreviation as state_abbreviation'])
                ->map(fn ($city): array => [
                    'id' => (int) $city->id,
                    'name' => (string) $city->name,
                    'state_abbreviation' => (string) $city->state_abbreviation,
                    'label' => (string) $city->name.' / '.(string) $city->state_abbreviation,
                ])
            : collect();

        return response()->json([
            'shippers' => $shippers,
            'drivers' => $drivers,
            'tractors' => $tractors,
            'trailers' => $trailers,
            'active_sets' => $activeSets,
            'cargo_types' => $cargoTypes,
            'container_types' => $containerTypes,
            'shipowners' => $shipowners,
            'location_types' => $locationTypes,
            'cities' => $cities,
        ]);
    }

    public function storeCatalog(Request $request, string $catalog): JsonResponse
    {
        $catalog = strtolower(trim($catalog));
        $allowed = ['shippers', 'cargo-types', 'container-types', 'shipowners', 'location-types'];
        if (! in_array($catalog, $allowed, true)) {
            abort(404);
        }

        // Mantém a validação alinhada ao tamanho real de cada coluna no banco.
        $maxNameLength = match ($catalog) {
            'shippers' => 100,
            'shipowners' => 140,
            'cargo-types', 'container-types', 'location-types' => 120,
        };
        $rules = ['name' => ['required', 'string', 'min:2', 'max:'.$maxNameLength]];
        if ($catalog === 'location-types') {
            $rules['scope'] = ['required', 'string', 'in:C,B'];
        }
        $validated = $request->validate($rules);
        $name = trim((string) $validated['name']);
        $normalized = mb_strtoupper($name, 'UTF-8');

        if ($catalog === 'shippers') {
            $exists = Shipper::query()->whereRaw('UPPER(TRIM(name)) = ?', [$normalized])->first();
            if ($exists) {
                throw ValidationException::withMessages(['name' => ['Este embarcador já está cadastrado.']]);
            }
            $item = Shipper::query()->create([
                'name' => $name,
                'normalized_name' => $normalized,
                'status' => 'ACTIVE',
                'display_color' => Shipper::suggestedColor($name),
                'created_by' => $request->user()?->id,
                'updated_by' => $request->user()?->id,
            ]);
            return response()->json(['item' => ['id' => (int) $item->id, 'name' => (string) $item->name, 'display_color' => (string) $item->display_color]], 201);
        }

        $scope = $catalog === 'location-types' ? (string) $validated['scope'] : null;
        $modelClass = match ($catalog) {
            'cargo-types' => LogisticsCargoType::class,
            'container-types' => LogisticsContainerType::class,
            'shipowners' => LogisticsShipowner::class,
            'location-types' => LogisticsLocationType::class,
        };

        $query = $modelClass::query()->where('normalized_name', $normalized);
        if ($scope !== null) $query->where('scope', $scope);
        if ($query->exists()) {
            throw ValidationException::withMessages(['name' => ['Este cadastro já existe.']]);
        }

        $attributes = ['name' => $name, 'normalized_name' => $normalized, 'active' => true];
        if ($scope !== null) $attributes['scope'] = $scope;
        $item = $modelClass::query()->create($attributes);

        return response()->json(['item' => [
            'id' => (int) $item->id,
            'name' => (string) $item->name,
            'scope' => $scope,
        ]], 201);
    }

    public function store(SaveLogisticsLoadRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $load = DB::transaction(function () use ($request, $validated): LogisticsLoad {
            $stage = (string) ($validated['stage'] ?? LogisticsLoad::STAGE_PROGRAMMING);
            $position = (int) (LogisticsLoad::query()
                ->whereNull('completed_at')
                ->where('stage', $stage)
                ->max('position') ?? -1) + 1;
            $reference = trim((string) ($validated['reference_code'] ?? ''));

            if ($reference === '') {
                $reference = $this->generateReference();
            }

            $attributes = $this->attributes($validated);
            $scheduledAt = $this->firstOperationalDate($attributes) ?? CarbonImmutable::now();

            $load = LogisticsLoad::query()->create([
                ...$attributes,
                'reference_code' => strtoupper($reference),
                'scheduled_at' => $scheduledAt,
                'stage' => $stage,
                'position' => $position,
                'created_by' => $request->user()?->id,
                'updated_by' => $request->user()?->id,
            ]);

            $this->recordEvent(
                $load,
                LogisticsLoadEvent::ACTION_CREATED,
                null,
                $stage,
                ['message' => 'Carga criada na logística.'],
                $request
            );

            return $load->fresh($this->relations());
        });

        return response()->json([
            'message' => 'Carga cadastrada com sucesso.',
            'load' => $this->loadPayload($load),
        ], 201);
    }

    public function update(
        SaveLogisticsLoadRequest $request,
        LogisticsLoad $logisticsLoad
    ): JsonResponse {
        $validated = $request->validated();

        $load = DB::transaction(function () use ($request, $validated, $logisticsLoad): LogisticsLoad {
            unset($validated['stage']);
            $reference = trim((string) ($validated['reference_code'] ?? $logisticsLoad->reference_code));
            $attributes = [
                ...$this->attributes($validated),
                'reference_code' => strtoupper($reference ?: $logisticsLoad->reference_code),
                'updated_by' => $request->user()?->id,
            ];

            $logisticsLoad->fill($attributes);
            $dirty = array_keys($logisticsLoad->getDirty());
            $logisticsLoad->save();

            if ($dirty !== []) {
                $this->recordEvent(
                    $logisticsLoad,
                    LogisticsLoadEvent::ACTION_UPDATED,
                    $logisticsLoad->stage,
                    $logisticsLoad->stage,
                    [
                        'message' => 'Dados da carga atualizados.',
                        'changed_fields' => array_values(array_diff($dirty, ['updated_at', 'updated_by'])),
                    ],
                    $request
                );
            }

            return $logisticsLoad->fresh($this->relations());
        });

        return response()->json([
            'message' => 'Carga atualizada com sucesso.',
            'load' => $this->loadPayload($load),
        ]);
    }

    public function updateAppointments(Request $request, LogisticsLoad $logisticsLoad): JsonResponse
    {
        $kind = strtoupper(trim((string) $request->input('kind', '')));
        $scope = $kind === 'DELIVERY' ? 'B' : 'C';

        $validated = $request->validate([
            'kind' => ['required', Rule::in(['COLLECTION', 'DELIVERY'])],
            'appointments' => ['nullable', 'array', 'max:20'],
            'appointments.*.scheduled_at' => ['required', 'date'],
            'appointments.*.location_type_id' => [
                'nullable',
                'integer',
                Rule::exists('logistics_location_types', 'id')->where(
                    fn ($query) => $query->where('scope', $scope)->where('active', true)
                ),
            ],
            'appointments.*.location' => ['nullable', 'string', 'max:180'],
        ], [
            'appointments.*.scheduled_at.required' => 'Informe a data e hora de todos os agendamentos adicionados.',
            'appointments.*.scheduled_at.date' => 'Existe um agendamento com data ou hora inválida.',
            'appointments.*.location.max' => 'O local do agendamento deve possuir no máximo 180 caracteres.',
        ]);

        $load = DB::transaction(function () use ($request, $validated, $logisticsLoad, $kind): LogisticsLoad {
            $entries = collect($validated['appointments'] ?? [])
                ->filter(fn ($entry): bool => is_array($entry) && ! empty($entry['scheduled_at']))
                ->map(fn (array $entry): array => [
                    'scheduled_at' => (string) $entry['scheduled_at'],
                    'location_type_id' => ! empty($entry['location_type_id']) ? (int) $entry['location_type_id'] : null,
                    'location' => trim((string) ($entry['location'] ?? '')) ?: null,
                ])
                ->sortBy('scheduled_at')
                ->values()
                ->all();

            $field = $kind === 'COLLECTION' ? 'collection_appointments' : 'delivery_appointments';
            $changes = [
                $field => $entries === [] ? null : $entries,
                'updated_by' => $request->user()?->id,
            ];

            // Mantém o campo legado somente como resumo do primeiro agendamento de coleta.
            // O cadastro da carga não escreve mais nesse campo.
            if ($kind === 'COLLECTION') {
                $changes['collection_scheduled_at'] = $entries[0]['scheduled_at'] ?? null;
            }

            $logisticsLoad->forceFill($changes)->save();

            $this->recordEvent(
                $logisticsLoad,
                LogisticsLoadEvent::ACTION_UPDATED,
                $logisticsLoad->stage,
                $logisticsLoad->stage,
                [
                    'message' => $kind === 'COLLECTION'
                        ? 'Agendamentos de coleta atualizados.'
                        : 'Agendamentos de baixa atualizados.',
                    'changed_fields' => [$field],
                ],
                $request
            );

            return $logisticsLoad->fresh($this->relations());
        });

        return response()->json([
            'message' => 'Agendamentos atualizados com sucesso.',
            'load' => $this->loadPayload($load),
        ]);
    }

    public function addStatusNote(Request $request, LogisticsLoad $logisticsLoad): JsonResponse
    {
        $validated = $request->validate([
            'observation' => ['required', 'string', 'max:2000'],
            'is_visible' => ['sometimes', 'boolean'],
        ], [
            'observation.required' => 'Informe a observação do status da viagem.',
            'observation.max' => 'A observação do status deve possuir no máximo 2000 caracteres.',
        ]);

        $isAdministrator = $this->isAdministrator($request);
        $isVisible = $isAdministrator ? (bool) ($validated['is_visible'] ?? true) : true;

        $load = DB::transaction(function () use ($request, $validated, $logisticsLoad, $isVisible): LogisticsLoad {
            $logisticsLoad->statusNotes()->create([
                'user_id' => $request->user()?->id,
                'observation' => trim((string) $validated['observation']),
                'is_visible' => $isVisible,
            ]);

            $logisticsLoad->forceFill(['updated_by' => $request->user()?->id])->save();

            return $logisticsLoad->fresh($this->relations());
        });

        return response()->json([
            'message' => 'Status da viagem registrado com sucesso.',
            'load' => $this->loadPayload($load),
        ], 201);
    }

    public function updateStatusNoteVisibility(
        Request $request,
        LogisticsLoad $logisticsLoad,
        LogisticsLoadStatusNote $statusNote
    ): JsonResponse {
        abort_unless($this->isAdministrator($request), 403, 'Apenas administradores podem alterar a visibilidade das observações.');
        abort_unless((int) $statusNote->logistics_load_id === (int) $logisticsLoad->id, 404);

        $validated = $request->validate([
            'is_visible' => ['required', 'boolean'],
        ]);

        $statusNote->forceFill([
            'is_visible' => (bool) $validated['is_visible'],
        ])->save();

        $load = $logisticsLoad->fresh($this->relations());

        return response()->json([
            'message' => $statusNote->is_visible
                ? 'Observação liberada para os demais usuários.'
                : 'Observação ocultada dos demais usuários.',
            'load' => $this->loadPayload($load),
        ]);
    }

    public function move(
        MoveLogisticsLoadRequest $request,
        LogisticsLoad $logisticsLoad
    ): JsonResponse {
        $validated = $request->validated();
        $destinationStage = (string) $validated['stage'];
        $destinationPosition = (int) $validated['position'];

        $load = DB::transaction(function () use ($request, $logisticsLoad, $destinationStage, $destinationPosition): LogisticsLoad {
            /** @var LogisticsLoad $locked */
            $locked = LogisticsLoad::query()->lockForUpdate()->findOrFail($logisticsLoad->id);

            if ($locked->completed_at !== null) {
                throw ValidationException::withMessages([
                    'load' => 'Uma carga finalizada não pode ser movimentada entre as etapas.',
                ]);
            }

            $sourceStage = (string) $locked->stage;
            $sourcePosition = (int) $locked->position;
            $destinationCount = LogisticsLoad::query()
                ->whereNull('completed_at')
                ->where('stage', $destinationStage)
                ->count();
            $maxPosition = $sourceStage === $destinationStage
                ? max(0, $destinationCount - 1)
                : $destinationCount;
            $newPosition = min(max(0, $destinationPosition), $maxPosition);

            if ($sourceStage === $destinationStage) {
                if ($newPosition < $sourcePosition) {
                    LogisticsLoad::query()
                        ->whereNull('completed_at')
                        ->where('stage', $sourceStage)
                        ->where('id', '<>', $locked->id)
                        ->whereBetween('position', [$newPosition, $sourcePosition - 1])
                        ->increment('position');
                } elseif ($newPosition > $sourcePosition) {
                    LogisticsLoad::query()
                        ->whereNull('completed_at')
                        ->where('stage', $sourceStage)
                        ->where('id', '<>', $locked->id)
                        ->whereBetween('position', [$sourcePosition + 1, $newPosition])
                        ->decrement('position');
                }
            } else {
                LogisticsLoad::query()
                    ->whereNull('completed_at')
                    ->where('stage', $sourceStage)
                    ->where('position', '>', $sourcePosition)
                    ->decrement('position');

                LogisticsLoad::query()
                    ->whereNull('completed_at')
                    ->where('stage', $destinationStage)
                    ->where('position', '>=', $newPosition)
                    ->increment('position');
            }

            $locked->forceFill([
                'stage' => $destinationStage,
                'position' => $newPosition,
                'updated_by' => $request->user()?->id,
            ])->save();

            if ($sourceStage !== $destinationStage) {
                $this->recordEvent(
                    $locked,
                    LogisticsLoadEvent::ACTION_STAGE_CHANGED,
                    $sourceStage,
                    $destinationStage,
                    [
                        'message' => 'Carga movida no quadro de logística.',
                        'next_activity' => $this->nextActivityForStage($destinationStage),
                    ],
                    $request
                );
            }

            return $locked->fresh($this->relations());
        });

        return response()->json([
            'message' => 'Carga movida com sucesso.',
            'load' => $this->loadPayload($load),
        ]);
    }

    public function finish(Request $request, LogisticsLoad $logisticsLoad): JsonResponse
    {
        $load = DB::transaction(function () use ($request, $logisticsLoad): LogisticsLoad {
            /** @var LogisticsLoad $locked */
            $locked = LogisticsLoad::query()->lockForUpdate()->findOrFail($logisticsLoad->id);

            if ($locked->completed_at !== null) {
                return $locked->fresh($this->relations());
            }

            if ($locked->stage !== LogisticsLoad::STAGE_DELIVERY) {
                throw ValidationException::withMessages([
                    'load' => 'A carga só pode ser finalizada quando estiver em Baixa / Entrega.',
                ]);
            }

            LogisticsLoad::query()
                ->whereNull('completed_at')
                ->where('stage', LogisticsLoad::STAGE_DELIVERY)
                ->where('position', '>', $locked->position)
                ->decrement('position');

            $locked->forceFill([
                'completed_at' => CarbonImmutable::now(),
                'completed_by' => $request->user()?->id,
                'updated_by' => $request->user()?->id,
            ])->save();

            $this->recordEvent(
                $locked,
                LogisticsLoadEvent::ACTION_FINALIZED,
                LogisticsLoad::STAGE_DELIVERY,
                LogisticsLoad::STAGE_DELIVERY,
                ['message' => 'Carga finalizada e retirada do quadro de cargas em processo.'],
                $request
            );

            return $locked->fresh($this->relations());
        });

        return response()->json([
            'message' => 'Carga finalizada com sucesso.',
            'load' => $this->loadPayload($load),
        ]);
    }

    public function destroy(Request $request, LogisticsLoad $logisticsLoad): JsonResponse
    {
        DB::transaction(function () use ($request, $logisticsLoad): void {
            /** @var LogisticsLoad $locked */
            $locked = LogisticsLoad::query()->lockForUpdate()->findOrFail($logisticsLoad->id);
            $snapshot = $this->loadPayload($locked->fresh($this->relations()));

            $this->recordEvent(
                $locked,
                LogisticsLoadEvent::ACTION_DELETED,
                $locked->stage,
                $locked->stage,
                ['message' => 'Carga excluída da operação.', 'snapshot' => $snapshot],
                $request
            );

            $locked->forceFill([
                'deleted_by' => $request->user()?->id,
                'updated_by' => $request->user()?->id,
            ])->save();
            $locked->delete();
        });

        return response()->json(['message' => 'Carga excluída com sucesso.']);
    }

    /** @return array<string, mixed> */
    private function attributes(array $validated): array
    {
        $nullableIds = ['driver_id', 'driver_two_id', 'tractor_id', 'trailer_id', 'cargo_type_id', 'container_type_id', 'shipowner_id', 'collection_city_id', 'loading_city_id', 'delivery_city_id', 'collection_location_type_id', 'delivery_location_type_id'];
        $payload = [];

        foreach ($nullableIds as $field) {
            if (array_key_exists($field, $validated)) {
                $payload[$field] = ! empty($validated[$field]) ? (int) $validated[$field] : null;
            }
        }

        $fields = [
            'shipper_id',
            'shipment_number',
            'load_number',
            'shipowner',
            'booking_number',
            'collection_booking_number',
            'grade_number',
            'grade_at',
            'collection_terminal',
            'collection_scheduled_at',
            'collection_at',
            'collection_appointments',
            'loading_location',
            'loading_at',
            'delivery_location',
            'delivery_at',
            'delivery_appointments',
            'plan',
            'load_mode',
            'load_status',
            'cargo_number',
            'container_number',
            'container_tare_kg',
            'container_payload_kg',
            'shipowner_seal',
            'vessel',
            'deadline',
            'country',
            'temperature',
            'sif_seal',
            'notes',
            'plate_mode',
            'third_party_tractor_plate',
            'third_party_trailer_plate',
        ];

        foreach ($fields as $field) {
            if (array_key_exists($field, $validated)) {
                $payload[$field] = $validated[$field];
            }
        }

        if (isset($payload['shipper_id'])) {
            $payload['shipper_id'] = (int) $payload['shipper_id'];
        }

        foreach (['shipment_number', 'load_number', 'shipowner', 'booking_number', 'collection_booking_number', 'grade_number', 'collection_terminal', 'loading_location', 'delivery_location', 'plan', 'load_mode', 'load_status', 'cargo_number', 'container_number', 'shipowner_seal', 'vessel', 'country', 'temperature', 'sif_seal', 'notes', 'plate_mode', 'third_party_tractor_plate', 'third_party_trailer_plate'] as $field) {
            if (array_key_exists($field, $payload)) {
                $value = trim((string) ($payload[$field] ?? ''));
                $payload[$field] = $value === '' ? null : $value;
            }
        }

        foreach ([
            'collection_appointments' => 'C',
            'delivery_appointments' => 'B',
        ] as $appointmentField => $scope) {
            if (! array_key_exists($appointmentField, $validated)) {
                continue;
            }

            $entries = collect($validated[$appointmentField] ?? [])
                ->filter(fn ($entry): bool => is_array($entry) && ! empty($entry['scheduled_at']))
                ->map(fn (array $entry): array => [
                    'scheduled_at' => (string) $entry['scheduled_at'],
                    'location_type_id' => ! empty($entry['location_type_id']) ? (int) $entry['location_type_id'] : null,
                ])
                ->sortBy('scheduled_at')
                ->values()
                ->all();
            $payload[$appointmentField] = $entries === [] ? null : $entries;
        }

        if (array_key_exists('load_entries', $validated)) {
            $entries = collect($validated['load_entries'] ?? [])
                ->filter(fn ($entry): bool => is_array($entry) && in_array($entry['status'] ?? null, ['EMPTY', 'FULL'], true))
                ->map(fn (array $entry): array => [
                    'status' => (string) $entry['status'],
                    'number' => trim((string) ($entry['number'] ?? '')) ?: null,
                ])
                ->values()
                ->all();
            $payload['load_entries'] = $entries === [] ? null : $entries;
        }

        $mode = $payload['load_mode'] ?? ($validated['load_mode'] ?? null);
        if ($mode === 'CARGO') {
            $payload['load_number'] = null;
            $payload['load_status'] = null;
            $payload['load_entries'] = null;
        } elseif ($mode === 'LOAD') {
            $payload['cargo_number'] = null;
            $firstEntry = $payload['load_entries'][0] ?? null;
            $payload['load_status'] = is_array($firstEntry) ? ($firstEntry['status'] ?? null) : null;
            $payload['load_number'] = is_array($firstEntry) ? ($firstEntry['number'] ?? null) : null;
        } elseif ($mode === null || $mode === '') {
            $payload['cargo_number'] = null;
            $payload['load_number'] = null;
            $payload['load_status'] = null;
            $payload['load_entries'] = null;
        }

        if (array_key_exists('collection_appointments', $payload)) {
            $firstCollectionAppointment = is_array($payload['collection_appointments']) ? ($payload['collection_appointments'][0] ?? null) : null;
            $payload['collection_scheduled_at'] = is_array($firstCollectionAppointment)
                ? ($firstCollectionAppointment['scheduled_at'] ?? null)
                : null;
        }

        $plateMode = strtoupper((string) ($payload['plate_mode'] ?? ($validated['plate_mode'] ?? 'FLEET')));
        $payload['plate_mode'] = $plateMode === 'THIRD_PARTY' ? 'THIRD_PARTY' : 'FLEET';
        if ($payload['plate_mode'] === 'THIRD_PARTY') {
            $payload['tractor_id'] = null;
            $payload['trailer_id'] = null;
        } else {
            $payload['third_party_tractor_plate'] = null;
            $payload['third_party_trailer_plate'] = null;
        }

        foreach (['collection_scheduled_at', 'collection_at', 'grade_at', 'loading_at', 'delivery_at', 'deadline'] as $field) {
            if (array_key_exists($field, $payload) && empty($payload[$field])) {
                $payload[$field] = null;
            }
        }

        return $payload;
    }

    /** @return array<int, string> */
    private function relations(): array
    {
        return [
            'shipper:id,name,display_color,status',
            'cargoType:id,name',
            'containerType:id,name',
            'shipownerRelation:id,name',
            'collectionCityRelation:id,name,state_id',
            'collectionCityRelation.state:id,abbreviation',
            'loadingCityRelation:id,name,state_id',
            'loadingCityRelation.state:id,abbreviation',
            'deliveryCityRelation:id,name,state_id',
            'deliveryCityRelation.state:id,abbreviation',
            'collectionLocationType:id,name,scope',
            'deliveryLocationType:id,name,scope',
            'driver:id,employee_code,full_name',
            'driverTwo:id,employee_code,full_name',
            'tractor:id,plate,fleet_number,brand,model,type',
            'trailer:id,plate,fleet_number,brand,model,type',
            'completedBy:id,name,username',
            'events.user:id,name,username',
            'statusNotes.user:id,name,username',
        ];
    }

    /** @return array<string, mixed> */
    private function loadPayload(LogisticsLoad $load): array
    {
        $loadEntries = $this->loadEntriesPayload($load);
        $loadMode = $load->load_mode;
        if ($loadMode === null && trim((string) ($load->cargo_number ?? '')) !== '') {
            $loadMode = 'CARGO';
        } elseif ($loadMode === null && $loadEntries !== []) {
            $loadMode = 'LOAD';
        }

        $viewerIsAdministrator = $this->isAdministrator(request());
        $statusNotes = $load->statusNotes
            ->filter(fn ($note): bool => $viewerIsAdministrator || (bool) $note->is_visible)
            ->map(fn ($note): array => [
                'id' => (int) $note->id,
                'observation' => (string) $note->observation,
                'is_visible' => (bool) $note->is_visible,
                'user_name' => $note->user?->name ?? $note->user?->username ?? 'Usuário',
                'created_at' => $note->created_at?->toIso8601String(),
            ])
            ->values();

        return [
            'id' => (int) $load->id,
            'reference_code' => (string) $load->reference_code,
            'shipment_number' => $load->shipment_number,
            'load_number' => $load->load_number,
            'shipowner' => $load->shipowner,
            'booking_number' => $load->booking_number,
            'collection_booking_number' => $load->collection_booking_number,
            'grade_number' => $load->grade_number,
            'grade_at' => $load->grade_at?->toIso8601String(),
            'cargo_type_id' => $load->cargo_type_id ? (int) $load->cargo_type_id : null,
            'cargo_type_name' => $load->cargoType?->name,
            'container_type_id' => $load->container_type_id ? (int) $load->container_type_id : null,
            'container_type_name' => $load->containerType?->name,
            'shipowner_id' => $load->shipowner_id ? (int) $load->shipowner_id : null,
            'shipowner_name' => $load->shipownerRelation?->name ?: $load->shipowner,
            'shipper_id' => (int) $load->shipper_id,
            'shipper_name' => (string) ($load->shipper?->name ?? '-'),
            'shipper_color' => (string) ($load->shipper?->display_color ?: '#3FA66C'),
            'driver_id' => $load->driver_id ? (int) $load->driver_id : null,
            'driver_name' => $load->driver?->full_name,
            'driver_two_id' => $load->driver_two_id ? (int) $load->driver_two_id : null,
            'driver_two_name' => $load->driverTwo?->full_name,
            'plate_mode' => $load->plate_mode === 'THIRD_PARTY' ? 'THIRD_PARTY' : 'FLEET',
            'tractor_id' => $load->tractor_id ? (int) $load->tractor_id : null,
            'tractor_plate' => $load->plate_mode === 'THIRD_PARTY' ? $load->third_party_tractor_plate : $load->tractor?->plate,
            'trailer_id' => $load->trailer_id ? (int) $load->trailer_id : null,
            'trailer_plate' => $load->plate_mode === 'THIRD_PARTY' ? $load->third_party_trailer_plate : $load->trailer?->plate,
            'third_party_tractor_plate' => $load->third_party_tractor_plate,
            'third_party_trailer_plate' => $load->third_party_trailer_plate,
            'collection_city_id' => $load->collection_city_id ? (int) $load->collection_city_id : null,
            'collection_terminal' => $load->collectionCityRelation ? $load->collectionCityRelation->name.' / '.$load->collectionCityRelation->state?->abbreviation : ($load->collection_terminal ?: $load->collection_city),
            'collection_location_type_id' => $load->collection_location_type_id ? (int) $load->collection_location_type_id : null,
            'collection_location_type_name' => $load->collectionLocationType?->name,
            'collection_scheduled_at' => $load->collection_scheduled_at?->toIso8601String(),
            'collection_at' => $load->collection_at?->toIso8601String(),
            'collection_appointments' => $this->appointmentsPayload($load->collection_appointments),
            'loading_city_id' => $load->loading_city_id ? (int) $load->loading_city_id : null,
            'loading_city_label' => $load->loadingCityRelation ? $load->loadingCityRelation->name.' / '.$load->loadingCityRelation->state?->abbreviation : ($load->loading_city ?: $load->loading_location),
            'loading_location' => $load->loading_location ?: $load->loading_city,
            'loading_at' => $load->loading_at?->toIso8601String(),
            'delivery_city_id' => $load->delivery_city_id ? (int) $load->delivery_city_id : null,
            'delivery_city_label' => $load->deliveryCityRelation ? $load->deliveryCityRelation->name.' / '.$load->deliveryCityRelation->state?->abbreviation : ($load->delivery_city ?: null),
            'delivery_location' => $load->delivery_location ?: $load->delivery_city,
            'delivery_location_type_id' => $load->delivery_location_type_id ? (int) $load->delivery_location_type_id : null,
            'delivery_location_type_name' => $load->deliveryLocationType?->name,
            'delivery_at' => $load->delivery_at?->toIso8601String(),
            'delivery_appointments' => $this->appointmentsPayload($load->delivery_appointments),
            'plan' => $load->plan,
            'load_mode' => $loadMode,
            'load_status' => $load->load_status,
            'cargo_number' => $load->cargo_number,
            'load_entries' => $loadEntries,
            'container_number' => $load->container_number,
            'container_tare_kg' => $load->container_tare_kg !== null ? (float) $load->container_tare_kg : null,
            'container_payload_kg' => $load->container_payload_kg !== null ? (float) $load->container_payload_kg : null,
            'shipowner_seal' => $load->shipowner_seal,
            'vessel' => $load->vessel,
            'deadline' => $load->deadline?->format('Y-m-d'),
            'country' => $load->country,
            'temperature' => $load->temperature,
            'sif_seal' => $load->sif_seal,
            'scheduled_at' => $load->scheduled_at?->toIso8601String(),
            'stage' => (string) $load->stage,
            'position' => (int) $load->position,
            'notes' => $load->notes,
            'completed_at' => $load->completed_at?->toIso8601String(),
            'completed_by_name' => $load->completedBy?->name ?? $load->completedBy?->username,
            'events' => $load->events->map(fn (LogisticsLoadEvent $event): array => [
                'id' => (int) $event->id,
                'action' => (string) $event->action,
                'from_stage' => $event->from_stage,
                'to_stage' => $event->to_stage,
                'details' => $event->details ?? [],
                'occurred_at' => $event->occurred_at?->toIso8601String(),
                'user_name' => $event->user?->name ?? $event->user?->username,
            ])->values(),
            'status_notes' => $statusNotes,
            'created_at' => $load->created_at?->toIso8601String(),
            'updated_at' => $load->updated_at?->toIso8601String(),
        ];
    }

    private function isAdministrator(Request $request): bool
    {
        return mb_strtolower(trim((string) ($request->user()?->role ?? ''))) === 'administrador';
    }

    /** @return array<int, array{scheduled_at: string, location_type_id: ?int, location: ?string}> */
    private function appointmentsPayload(mixed $rawEntries): array
    {
        return collect(is_array($rawEntries) ? $rawEntries : [])
            ->filter(fn ($entry): bool => is_array($entry) && ! empty($entry['scheduled_at']))
            ->map(fn (array $entry): array => [
                'scheduled_at' => (string) $entry['scheduled_at'],
                'location_type_id' => ! empty($entry['location_type_id']) ? (int) $entry['location_type_id'] : null,
                'location' => trim((string) ($entry['location'] ?? '')) ?: null,
            ])
            ->sortBy('scheduled_at')
            ->values()
            ->all();
    }

    /** @return array<int, array{status: string, number: ?string}> */
    private function loadEntriesPayload(LogisticsLoad $load): array
    {
        $entries = collect(is_array($load->load_entries) ? $load->load_entries : [])
            ->filter(fn ($entry): bool => is_array($entry) && in_array($entry['status'] ?? null, ['EMPTY', 'FULL'], true))
            ->map(fn (array $entry): array => [
                'status' => (string) $entry['status'],
                'number' => isset($entry['number']) && trim((string) $entry['number']) !== '' ? trim((string) $entry['number']) : null,
            ])
            ->values()
            ->all();

        if (
            $entries === []
            && $load->load_mode !== 'CARGO'
            && (in_array($load->load_status, ['EMPTY', 'FULL'], true) || trim((string) ($load->load_number ?? '')) !== '')
        ) {
            $entries[] = [
                'status' => in_array($load->load_status, ['EMPTY', 'FULL'], true) ? (string) $load->load_status : 'EMPTY',
                'number' => trim((string) ($load->load_number ?? '')) !== '' ? trim((string) $load->load_number) : null,
            ];
        }

        return $entries;
    }

    /** @return array<string, mixed> */
    private function vehicleOption(Vehicle $vehicle): array
    {
        return [
            'id' => (int) $vehicle->id,
            'plate' => (string) $vehicle->plate,
            'fleet_number' => $vehicle->fleet_number,
            'brand' => (string) $vehicle->brand,
            'model' => (string) $vehicle->model,
        ];
    }

    /** @param array<string, mixed> $attributes */
    private function firstOperationalDate(array $attributes): mixed
    {
        foreach (['collection_scheduled_at', 'collection_at', 'loading_at', 'delivery_at'] as $field) {
            if (! empty($attributes[$field])) {
                return $attributes[$field];
            }
        }

        return null;
    }

    private function nextActivityForStage(string $stage): string
    {
        return match ($stage) {
            LogisticsLoad::STAGE_PROGRAMMING => 'Coleta',
            LogisticsLoad::STAGE_COLLECTION => 'Carregamento',
            LogisticsLoad::STAGE_LOADING, LogisticsLoad::STAGE_DELIVERY => 'Baixa / Entrega',
            default => 'Próxima atividade',
        };
    }

    private function generateReference(): string
    {
        do {
            $reference = 'LOG-'.now()->format('ymd').'-'.strtoupper(Str::random(4));
        } while (LogisticsLoad::query()->where('reference_code', $reference)->exists());

        return $reference;
    }

    /** @param array<string, mixed> $details */
    private function recordEvent(
        LogisticsLoad $load,
        string $action,
        ?string $fromStage,
        ?string $toStage,
        array $details,
        Request $request
    ): void {
        LogisticsLoadEvent::query()->create([
            'logistics_load_id' => $load->id,
            'action' => $action,
            'from_stage' => $fromStage,
            'to_stage' => $toStage,
            'details' => $details,
            'occurred_at' => CarbonImmutable::now(),
            'user_id' => $request->user()?->id,
        ]);
    }
}
