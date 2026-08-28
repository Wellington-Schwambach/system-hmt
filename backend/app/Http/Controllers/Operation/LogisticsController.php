<?php

namespace App\Http\Controllers\Operation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Operation\MoveLogisticsLoadRequest;
use App\Http\Requests\Operation\SaveLogisticsLoadRequest;
use App\Models\Employee;
use App\Models\LogisticsLoad;
use App\Models\LogisticsLoadEvent;
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
            WHEN stage = 'PROGRAMMING' AND collection_at IS NULL AND tractor_id IS NULL THEN COALESCE(loading_at, scheduled_at)
            WHEN stage = 'PROGRAMMING' THEN COALESCE(collection_at, scheduled_at)
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
                ->orWhere('shipowner', 'ILIKE', "%{$search}%")
                ->orWhere('booking_number', 'ILIKE', "%{$search}%")
                ->orWhere('collection_terminal', 'ILIKE', "%{$search}%")
                ->orWhere('loading_location', 'ILIKE', "%{$search}%")
                ->orWhere('delivery_location', 'ILIKE', "%{$search}%")
                ->orWhereHas('shipper', fn (Builder $shipper) => $shipper->where('name', 'ILIKE', "%{$search}%"))
                ->orWhereHas('tractor', fn (Builder $tractor) => $tractor->where('plate', 'ILIKE', "%{$search}%")));
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

        return response()->json([
            'shippers' => $shippers,
            'drivers' => $drivers,
            'tractors' => $tractors,
            'trailers' => $trailers,
            'active_sets' => $activeSets,
        ]);
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

    /** @return array<string, mixed> */
    private function attributes(array $validated): array
    {
        $nullableIds = ['driver_id', 'driver_two_id', 'tractor_id', 'trailer_id'];
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
            'collection_terminal',
            'collection_at',
            'loading_location',
            'loading_at',
            'delivery_location',
            'delivery_at',
            'notes',
        ];

        foreach ($fields as $field) {
            if (array_key_exists($field, $validated)) {
                $payload[$field] = $validated[$field];
            }
        }

        if (isset($payload['shipper_id'])) {
            $payload['shipper_id'] = (int) $payload['shipper_id'];
        }

        foreach (['shipment_number', 'load_number', 'shipowner', 'booking_number', 'collection_terminal', 'loading_location', 'delivery_location', 'notes'] as $field) {
            if (array_key_exists($field, $payload)) {
                $value = trim((string) ($payload[$field] ?? ''));
                $payload[$field] = $value === '' ? null : $value;
            }
        }

        foreach (['collection_at', 'loading_at', 'delivery_at'] as $field) {
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
            'driver:id,employee_code,full_name',
            'driverTwo:id,employee_code,full_name',
            'tractor:id,plate,fleet_number,brand,model,type',
            'trailer:id,plate,fleet_number,brand,model,type',
            'completedBy:id,name,username',
            'events.user:id,name,username',
        ];
    }

    /** @return array<string, mixed> */
    private function loadPayload(LogisticsLoad $load): array
    {
        return [
            'id' => (int) $load->id,
            'reference_code' => (string) $load->reference_code,
            'shipment_number' => $load->shipment_number,
            'load_number' => $load->load_number,
            'shipowner' => $load->shipowner,
            'booking_number' => $load->booking_number,
            'shipper_id' => (int) $load->shipper_id,
            'shipper_name' => (string) ($load->shipper?->name ?? '-'),
            'shipper_color' => (string) ($load->shipper?->display_color ?: '#3FA66C'),
            'driver_id' => $load->driver_id ? (int) $load->driver_id : null,
            'driver_name' => $load->driver?->full_name,
            'driver_two_id' => $load->driver_two_id ? (int) $load->driver_two_id : null,
            'driver_two_name' => $load->driverTwo?->full_name,
            'tractor_id' => $load->tractor_id ? (int) $load->tractor_id : null,
            'tractor_plate' => $load->tractor?->plate,
            'trailer_id' => $load->trailer_id ? (int) $load->trailer_id : null,
            'trailer_plate' => $load->trailer?->plate,
            'collection_terminal' => $load->collection_terminal ?: $load->collection_city,
            'collection_at' => $load->collection_at?->toIso8601String(),
            'loading_location' => $load->loading_location ?: $load->loading_city,
            'loading_at' => $load->loading_at?->toIso8601String(),
            'delivery_location' => $load->delivery_location ?: $load->delivery_city,
            'delivery_at' => $load->delivery_at?->toIso8601String(),
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
            'created_at' => $load->created_at?->toIso8601String(),
            'updated_at' => $load->updated_at?->toIso8601String(),
        ];
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
        foreach (['collection_at', 'loading_at', 'delivery_at'] as $field) {
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
