<?php

namespace App\Http\Controllers\Operation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Operation\DetachVehicleSetRequest;
use App\Http\Requests\Operation\StoreVehicleSetRequest;
use App\Http\Requests\Operation\UpdateVehicleSetDriverRequest;
use App\Models\Employee;
use App\Models\Vehicle;
use App\Models\VehicleSet;
use App\Models\VehicleSetEvent;
use Carbon\CarbonImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VehicleSetController extends Controller
{
    public function index(): JsonResponse
    {
        $sets = VehicleSet::query()
            ->with(['tractor', 'trailer', 'driver', 'driverTwo'])
            ->where('status', VehicleSet::STATUS_ACTIVE)
            ->orderByDesc('coupled_at')
            ->get()
            ->map(fn (VehicleSet $vehicleSet): array => $this->setPayload($vehicleSet));

        $history = VehicleSetEvent::query()
            ->with('user:id,name,username')
            ->latest('occurred_at')
            ->latest('id')
            ->get()
            ->map(fn (VehicleSetEvent $event): array => $this->eventPayload($event));

        return response()->json([
            'sets' => $sets,
            'history' => $history,
        ]);
    }

    public function options(): JsonResponse
    {
        $activeSetRows = VehicleSet::query()
            ->where('status', VehicleSet::STATUS_ACTIVE)
            ->get(['tractor_id', 'trailer_id', 'driver_id', 'driver_two_id']);

        $usedTractors = $activeSetRows->pluck('tractor_id')->filter()->map(fn ($id): int => (int) $id)->all();
        $usedTrailers = $activeSetRows->pluck('trailer_id')->filter()->map(fn ($id): int => (int) $id)->all();
        $usedDrivers = $activeSetRows
            ->flatMap(fn (VehicleSet $set) => [$set->driver_id, $set->driver_two_id])
            ->filter()
            ->map(fn ($id): int => (int) $id)
            ->unique()
            ->values()
            ->all();

        $tractors = Vehicle::query()
            ->where('type', 'TRACTOR')
            ->where('status', 'ACTIVE')
            ->orderBy('plate')
            ->get()
            ->map(fn (Vehicle $vehicle): array => $this->vehicleOption($vehicle, ! in_array($vehicle->id, $usedTractors, true)));

        $trailers = Vehicle::query()
            ->where('type', 'TRAILER')
            ->where('status', 'ACTIVE')
            ->orderBy('plate')
            ->get()
            ->map(fn (Vehicle $vehicle): array => $this->vehicleOption($vehicle, ! in_array($vehicle->id, $usedTrailers, true)));

        $drivers = Employee::query()
            ->where('status', 'ACTIVE')
            ->whereRaw('LOWER(job_title) LIKE ?', ['%motorista%'])
            ->orderBy('full_name')
            ->get()
            ->map(fn (Employee $employee): array => [
                'id' => $employee->id,
                'employee_code' => $employee->employee_code,
                'name' => $employee->full_name,
                'cpf' => $employee->cpf,
                'cnh_number' => $employee->cnh_number,
                'cnh_category' => $employee->cnh_category,
                'cnh_expiry_date' => $employee->cnh_expiry_date?->format('Y-m-d'),
                'available' => ! in_array($employee->id, $usedDrivers, true),
            ]);

        return response()->json([
            'tractors' => $tractors,
            'trailers' => $trailers,
            'drivers' => $drivers,
        ]);
    }

    public function store(StoreVehicleSetRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            $vehicleSet = DB::transaction(function () use ($request, $validated): VehicleSet {
                $tractor = Vehicle::query()->findOrFail((int) $validated['tractor_id']);
                $trailer = Vehicle::query()->findOrFail((int) $validated['trailer_id']);
                $driver = Employee::query()->findOrFail((int) $validated['driver_id']);
                $driverTwo = ! empty($validated['driver_two_id'])
                    ? Employee::query()->findOrFail((int) $validated['driver_two_id'])
                    : null;

                $this->ensureDriverIsMotorist($driver);
                if ($driverTwo !== null) {
                    $this->ensureDriverIsMotorist($driverTwo, 'driver_two_id');
                    if ($driverTwo->id === $driver->id) {
                        throw ValidationException::withMessages([
                            'driver_two_id' => ['O segundo motorista deve ser diferente do primeiro.'],
                        ]);
                    }
                }

                $this->ensureAvailable('tractor_id', $tractor->id, 'Este cavalo já está vinculado a outro conjunto ativo.');
                $this->ensureAvailable('trailer_id', $trailer->id, 'Esta carreta já está vinculada a outro conjunto ativo.');
                $this->ensureDriverAvailable($driver->id, 'driver_id');
                if ($driverTwo !== null) {
                    $this->ensureDriverAvailable($driverTwo->id, 'driver_two_id');
                }

                $coupledAt = CarbonImmutable::parse((string) $validated['coupled_at']);
                $driverAssignedAt = CarbonImmutable::parse((string) $validated['driver_assigned_at']);
                $driverTwoAssignedAt = $driverTwo !== null
                    ? CarbonImmutable::parse((string) $validated['driver_two_assigned_at'])
                    : null;

                $vehicleSet = VehicleSet::query()->create([
                    'tractor_id' => $tractor->id,
                    'trailer_id' => $trailer->id,
                    'driver_id' => $driver->id,
                    'driver_two_id' => $driverTwo?->id,
                    'tractor_plate' => $tractor->plate,
                    'tractor_label' => $this->vehicleLabel($tractor),
                    'trailer_plate' => $trailer->plate,
                    'trailer_label' => $this->vehicleLabel($trailer),
                    'driver_name' => $driver->full_name,
                    'driver_two_name' => $driverTwo?->full_name,
                    'coupled_at' => $coupledAt,
                    'driver_assigned_at' => $driverAssignedAt,
                    'driver_two_assigned_at' => $driverTwoAssignedAt,
                    'status' => VehicleSet::STATUS_ACTIVE,
                    'created_by' => $request->user()?->id,
                    'updated_by' => $request->user()?->id,
                ]);

                $this->recordEvent(
                    $vehicleSet,
                    VehicleSetEvent::ACTION_COUPLED,
                    $coupledAt,
                    $request,
                    $driver,
                    ['message' => 'Cavalo e carreta foram atrelados para formar o conjunto.']
                );

                $this->recordEvent(
                    $vehicleSet,
                    VehicleSetEvent::ACTION_DRIVER_ASSIGNED,
                    $driverAssignedAt,
                    $request,
                    $driver,
                    ['message' => 'Motorista principal vinculado ao conjunto.', 'driver_slot' => 'PRIMARY']
                );

                if ($driverTwo !== null && $driverTwoAssignedAt !== null) {
                    $this->recordEvent(
                        $vehicleSet,
                        VehicleSetEvent::ACTION_DRIVER_ASSIGNED,
                        $driverTwoAssignedAt,
                        $request,
                        $driverTwo,
                        ['message' => 'Segundo motorista vinculado ao conjunto.', 'driver_slot' => 'SECONDARY']
                    );
                }

                return $vehicleSet->fresh()->load(['tractor', 'trailer', 'driver', 'driverTwo']);
            });
        } catch (QueryException $exception) {
            if ($exception->getCode() === '23505') {
                throw ValidationException::withMessages([
                    'conjunto' => ['Um dos itens selecionados acabou de ser utilizado em outro conjunto. Atualize as opções e tente novamente.'],
                ]);
            }

            throw $exception;
        }

        return response()->json([
            'message' => isset($validated['driver_two_id']) && $validated['driver_two_id']
                ? 'Conjunto montado e dois motoristas vinculados com sucesso.'
                : 'Conjunto montado e motorista vinculado com sucesso.',
            'set' => $this->setPayload($vehicleSet),
        ], 201);
    }

    public function updateDriver(
        UpdateVehicleSetDriverRequest $request,
        VehicleSet $vehicleSet
    ): JsonResponse {
        $this->ensureActive($vehicleSet);
        $validated = $request->validated();
        $slot = (string) ($validated['slot'] ?? 'PRIMARY');
        $newDriver = Employee::query()->findOrFail((int) $validated['driver_id']);
        $field = $slot === 'SECONDARY' ? 'driver_two_id' : 'driver_id';
        $this->ensureDriverIsMotorist($newDriver, $field);

        $assignedAt = CarbonImmutable::parse((string) $validated['assigned_at']);
        if ($assignedAt->lt($vehicleSet->coupled_at)) {
            throw ValidationException::withMessages([
                'assigned_at' => ['A alteração do motorista não pode ocorrer antes do atrelamento do conjunto.'],
            ]);
        }

        if ($slot === 'SECONDARY' && (int) $vehicleSet->driver_id === $newDriver->id) {
            throw ValidationException::withMessages([
                'driver_id' => ['O segundo motorista deve ser diferente do motorista principal.'],
            ]);
        }

        if ($slot === 'PRIMARY' && (int) $vehicleSet->driver_two_id === $newDriver->id) {
            throw ValidationException::withMessages([
                'driver_id' => ['O motorista principal deve ser diferente do segundo motorista.'],
            ]);
        }

        $currentDriverId = $slot === 'SECONDARY' ? $vehicleSet->driver_two_id : $vehicleSet->driver_id;
        if ((int) $currentDriverId === $newDriver->id) {
            throw ValidationException::withMessages([
                'driver_id' => ['Este motorista já está vinculado nesta posição do conjunto.'],
            ]);
        }

        $this->ensureDriverAvailable($newDriver->id, $field, $vehicleSet->id);

        $oldDriverName = $slot === 'SECONDARY' ? $vehicleSet->driver_two_name : $vehicleSet->driver_name;
        $action = $oldDriverName === null
            ? VehicleSetEvent::ACTION_DRIVER_ASSIGNED
            : VehicleSetEvent::ACTION_DRIVER_CHANGED;

        DB::transaction(function () use ($request, $vehicleSet, $newDriver, $assignedAt, $oldDriverName, $slot, $action): void {
            $fields = $slot === 'SECONDARY'
                ? [
                    'driver_two_id' => $newDriver->id,
                    'driver_two_name' => $newDriver->full_name,
                    'driver_two_assigned_at' => $assignedAt,
                    'updated_by' => $request->user()?->id,
                ]
                : [
                    'driver_id' => $newDriver->id,
                    'driver_name' => $newDriver->full_name,
                    'driver_assigned_at' => $assignedAt,
                    'updated_by' => $request->user()?->id,
                ];

            $vehicleSet->fill($fields)->save();

            $this->recordEvent(
                $vehicleSet,
                $action,
                $assignedAt,
                $request,
                $newDriver,
                [
                    'message' => $oldDriverName === null
                        ? 'Segundo motorista vinculado ao conjunto.'
                        : ($slot === 'SECONDARY' ? 'Segundo motorista do conjunto foi alterado.' : 'Motorista principal do conjunto foi alterado.'),
                    'driver_slot' => $slot,
                    'previous_driver' => $oldDriverName,
                    'new_driver' => $newDriver->full_name,
                ]
            );
        });

        return response()->json([
            'message' => $oldDriverName === null
                ? 'Segundo motorista vinculado com sucesso.'
                : ($slot === 'SECONDARY' ? 'Segundo motorista alterado com sucesso.' : 'Motorista principal alterado com sucesso.'),
            'set' => $this->setPayload($vehicleSet->fresh()->load(['tractor', 'trailer', 'driver', 'driverTwo'])),
        ]);
    }

    public function detach(
        DetachVehicleSetRequest $request,
        VehicleSet $vehicleSet
    ): JsonResponse {
        $this->ensureActive($vehicleSet);
        $detachedAt = CarbonImmutable::parse((string) $request->validated('detached_at'));

        if ($detachedAt->lt($vehicleSet->coupled_at)) {
            throw ValidationException::withMessages([
                'detached_at' => ['O desatrelamento não pode ocorrer antes da montagem do conjunto.'],
            ]);
        }

        DB::transaction(function () use ($request, $vehicleSet, $detachedAt): void {
            $vehicleSet->fill([
                'status' => VehicleSet::STATUS_DETACHED,
                'detached_at' => $detachedAt,
                'updated_by' => $request->user()?->id,
            ])->save();

            $driverNames = implode(' / ', array_filter([
                $vehicleSet->driver_name,
                $vehicleSet->driver_two_name,
            ]));

            $this->recordEvent(
                $vehicleSet,
                VehicleSetEvent::ACTION_DETACHED,
                $detachedAt,
                $request,
                null,
                [
                    'message' => 'Conjunto desatrelado e recursos liberados para novos vínculos.',
                    'driver_names' => $driverNames,
                ]
            );
        });

        return response()->json([
            'message' => 'Conjunto desatrelado com sucesso. Cavalo, carreta e motoristas estão disponíveis novamente.',
        ]);
    }

    private function ensureAvailable(string $column, int $id, string $message, ?int $ignoreSetId = null): void
    {
        $exists = VehicleSet::query()
            ->where('status', VehicleSet::STATUS_ACTIVE)
            ->where($column, $id)
            ->when($ignoreSetId !== null, fn ($query) => $query->where('id', '!=', $ignoreSetId))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([$column => [$message]]);
        }
    }

    private function ensureDriverAvailable(int $driverId, string $field = 'driver_id', ?int $ignoreSetId = null): void
    {
        $exists = VehicleSet::query()
            ->where('status', VehicleSet::STATUS_ACTIVE)
            ->where(function ($query) use ($driverId): void {
                $query->where('driver_id', $driverId)
                    ->orWhere('driver_two_id', $driverId);
            })
            ->when($ignoreSetId !== null, fn ($query) => $query->where('id', '!=', $ignoreSetId))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                $field => ['Este motorista já está vinculado a outro conjunto ativo.'],
            ]);
        }
    }

    private function ensureActive(VehicleSet $vehicleSet): void
    {
        if ($vehicleSet->status !== VehicleSet::STATUS_ACTIVE) {
            throw ValidationException::withMessages([
                'conjunto' => ['Este conjunto já foi desatrelado e não pode mais ser alterado.'],
            ]);
        }
    }

    private function ensureDriverIsMotorist(Employee $driver, string $field = 'driver_id'): void
    {
        if (! str_contains(mb_strtolower((string) $driver->job_title), 'motorista')) {
            throw ValidationException::withMessages([
                $field => ['O colaborador selecionado não está cadastrado como motorista.'],
            ]);
        }
    }

    private function recordEvent(
        VehicleSet $vehicleSet,
        string $action,
        CarbonImmutable $occurredAt,
        Request $request,
        ?Employee $driver,
        array $details
    ): void {
        VehicleSetEvent::query()->create([
            'vehicle_set_id' => $vehicleSet->id,
            'action' => $action,
            'tractor_id' => $vehicleSet->tractor_id,
            'trailer_id' => $vehicleSet->trailer_id,
            'driver_id' => $driver?->id,
            'tractor_plate' => $vehicleSet->tractor_plate,
            'trailer_plate' => $vehicleSet->trailer_plate,
            'driver_name' => $driver?->full_name ?? ($details['driver_names'] ?? $vehicleSet->driver_name),
            'occurred_at' => $occurredAt,
            'details' => $details,
            'user_id' => $request->user()?->id,
        ]);
    }

    private function vehicleLabel(Vehicle $vehicle): string
    {
        $description = trim(implode(' ', array_filter([$vehicle->brand, $vehicle->model])));
        return $description === '' ? $vehicle->plate : $vehicle->plate.' - '.$description;
    }

    /** @return array<string, mixed> */
    private function vehicleOption(Vehicle $vehicle, bool $available): array
    {
        return [
            'id' => $vehicle->id,
            'plate' => $vehicle->plate,
            'fleet_number' => $vehicle->fleet_number,
            'type' => $vehicle->type,
            'brand' => $vehicle->brand,
            'model' => $vehicle->model,
            'manufacture_year' => $vehicle->manufacture_year,
            'model_year' => $vehicle->model_year,
            'current_km' => $vehicle->current_km,
            'renavam' => $vehicle->renavam,
            'chassis' => $vehicle->chassis,
            'tare_kg' => $vehicle->tare_kg,
            'load_capacity_kg' => $vehicle->load_capacity_kg,
            'available' => $available,
        ];
    }

    /** @return array<string, mixed> */
    private function driverOption(Employee $employee, bool $available): array
    {
        return [
            'id' => $employee->id,
            'employee_code' => $employee->employee_code,
            'name' => $employee->full_name,
            'cpf' => $employee->cpf,
            'cnh_number' => $employee->cnh_number,
            'cnh_category' => $employee->cnh_category,
            'cnh_expiry_date' => $employee->cnh_expiry_date?->format('Y-m-d'),
            'available' => $available,
        ];
    }

    /** @return array<string, mixed> */
    private function setPayload(VehicleSet $vehicleSet): array
    {
        return [
            'id' => $vehicleSet->id,
            'status' => $vehicleSet->status,
            'tractor_id' => $vehicleSet->tractor_id,
            'trailer_id' => $vehicleSet->trailer_id,
            'driver_id' => $vehicleSet->driver_id,
            'driver_two_id' => $vehicleSet->driver_two_id,
            'tractor_plate' => $vehicleSet->tractor_plate,
            'tractor_label' => $vehicleSet->tractor_label,
            'trailer_plate' => $vehicleSet->trailer_plate,
            'trailer_label' => $vehicleSet->trailer_label,
            'driver_name' => $vehicleSet->driver_name,
            'driver_two_name' => $vehicleSet->driver_two_name,
            'coupled_at' => $vehicleSet->coupled_at?->toIso8601String(),
            'driver_assigned_at' => $vehicleSet->driver_assigned_at?->toIso8601String(),
            'driver_two_assigned_at' => $vehicleSet->driver_two_assigned_at?->toIso8601String(),
            'detached_at' => $vehicleSet->detached_at?->toIso8601String(),
            'tractor' => $vehicleSet->tractor === null ? null : $this->vehicleOption($vehicleSet->tractor, true),
            'trailer' => $vehicleSet->trailer === null ? null : $this->vehicleOption($vehicleSet->trailer, true),
            'driver' => $vehicleSet->driver === null ? null : $this->driverOption($vehicleSet->driver, true),
            'driver_two' => $vehicleSet->driverTwo === null ? null : $this->driverOption($vehicleSet->driverTwo, true),
        ];
    }

    /** @return array<string, mixed> */
    private function eventPayload(VehicleSetEvent $event): array
    {
        return [
            'id' => $event->id,
            'vehicle_set_id' => $event->vehicle_set_id,
            'action' => $event->action,
            'tractor_plate' => $event->tractor_plate,
            'trailer_plate' => $event->trailer_plate,
            'driver_name' => $event->driver_name,
            'occurred_at' => $event->occurred_at?->toIso8601String(),
            'user_name' => $event->user?->name,
            'details' => $event->details ?? [],
        ];
    }
}
