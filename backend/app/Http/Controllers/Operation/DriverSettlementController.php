<?php

namespace App\Http\Controllers\Operation;

use App\Http\Controllers\Controller;
use App\Models\DriverSettlement;
use App\Models\DriverSettlementEvent;
use App\Models\DriverDeduction;
use App\Models\DriverDeductionEvent;
use App\Models\Employee;
use App\Models\VehicleSetEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class DriverSettlementController extends Controller
{
    public function index(): JsonResponse
    {
        $settlements = DriverSettlement::query()
            ->latest('updated_at')
            ->latest('id')
            ->get()
            ->map(fn (DriverSettlement $settlement): array => $this->payload($settlement));

        return response()->json(['settlements' => $settlements]);
    }

    public function drivers(): JsonResponse
    {
        $drivers = Employee::query()
            ->where('status', 'ACTIVE')
            ->whereRaw('LOWER(job_title) LIKE ?', ['%motorista%'])
            ->orderBy('full_name')
            ->get(['id', 'employee_code', 'full_name'])
            ->map(fn (Employee $employee): array => [
                'id' => (int) $employee->id,
                'employee_code' => $employee->employee_code,
                'name' => $employee->full_name,
            ]);

        return response()->json(['drivers' => $drivers]);
    }

    public function crewHistory(): JsonResponse
    {
        $events = VehicleSetEvent::query()
            ->whereIn('action', [
                VehicleSetEvent::ACTION_COUPLED,
                VehicleSetEvent::ACTION_DRIVER_ASSIGNED,
                VehicleSetEvent::ACTION_DRIVER_CHANGED,
                VehicleSetEvent::ACTION_DRIVER_RELEASED,
                VehicleSetEvent::ACTION_DETACHED,
            ])
            ->orderBy('occurred_at')
            ->orderBy('id')
            ->get([
                'id',
                'vehicle_set_id',
                'action',
                'tractor_plate',
                'driver_id',
                'driver_name',
                'occurred_at',
                'details',
            ])
            ->map(fn (VehicleSetEvent $event): array => [
                'id' => (int) $event->id,
                'vehicle_set_id' => (int) $event->vehicle_set_id,
                'action' => $event->action,
                'tractor_plate' => $event->tractor_plate,
                'driver_id' => $event->driver_id !== null ? (int) $event->driver_id : null,
                'driver_name' => $event->driver_name,
                'occurred_at' => $event->occurred_at?->toIso8601String(),
                'details' => $event->details ?? [],
            ]);

        return response()->json(['events' => $events]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatePayload($request);
        $driver = $this->findCompanyDriver((int) $validated['driver_id']);

        $settlement = DB::transaction(function () use ($request, $validated, $driver): DriverSettlement {
            $deductions = $this->resolveSelectedDeductions($validated['snapshot'], $driver, null);
            $settlement = DriverSettlement::query()->create([
                'driver_id' => $driver->id,
                'driver_name' => $driver->full_name,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'snapshot' => $this->normalizeSnapshot($validated['snapshot'], $driver),
                'created_by' => $request->user()?->id,
                'updated_by' => $request->user()?->id,
            ]);

            $this->syncSelectedDeductions($settlement, $deductions, $request);

            $this->recordEvent($settlement, DriverSettlementEvent::ACTION_CREATED, null, $this->auditSnapshot($settlement), $request);
            return $settlement;
        });

        return response()->json([
            'message' => 'Acerto gravado com sucesso.',
            'settlement' => $this->payload($settlement),
        ], 201);
    }

    public function update(Request $request, DriverSettlement $driverSettlement): JsonResponse
    {
        $validated = $this->validatePayload($request);
        $driver = $this->findCompanyDriver((int) $validated['driver_id']);

        $updated = DB::transaction(function () use ($request, $validated, $driver, $driverSettlement): DriverSettlement {
            $before = $this->auditSnapshot($driverSettlement);
            $deductions = $this->resolveSelectedDeductions($validated['snapshot'], $driver, $driverSettlement);

            $driverSettlement->fill([
                'driver_id' => $driver->id,
                'driver_name' => $driver->full_name,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'snapshot' => $this->normalizeSnapshot($validated['snapshot'], $driver),
                'updated_by' => $request->user()?->id,
            ])->save();

            $driverSettlement->refresh();
            $this->syncSelectedDeductions($driverSettlement, $deductions, $request);
            $this->recordEvent($driverSettlement, DriverSettlementEvent::ACTION_UPDATED, $before, $this->auditSnapshot($driverSettlement), $request);
            return $driverSettlement;
        });

        return response()->json([
            'message' => 'Acerto atualizado com sucesso.',
            'settlement' => $this->payload($updated),
        ]);
    }

    public function destroy(Request $request, DriverSettlement $driverSettlement): Response
    {
        DB::transaction(function () use ($request, $driverSettlement): void {
            $before = $this->auditSnapshot($driverSettlement);
            $this->releaseSettlementDeductions($driverSettlement, $request);
            $driverSettlement->forceFill(['deleted_by' => $request->user()?->id])->save();
            $driverSettlement->delete();
            $this->recordEvent($driverSettlement, DriverSettlementEvent::ACTION_DELETED, $before, null, $request);
        });

        return response()->noContent();
    }

    public function history(): JsonResponse
    {
        $events = DriverSettlementEvent::query()
            ->with('user:id,name,username')
            ->latest('occurred_at')
            ->latest('id')
            ->limit(500)
            ->get()
            ->map(fn (DriverSettlementEvent $event): array => [
                'id' => (int) $event->id,
                'settlement_id' => (int) $event->driver_settlement_id,
                'action' => $event->action,
                'before' => $event->before_data,
                'after' => $event->after_data,
                'user_name' => $event->user?->name ?? $event->user?->username,
                'occurred_at' => $event->occurred_at?->toIso8601String(),
            ]);

        return response()->json(['events' => $events]);
    }

    /** @return array<string, mixed> */
    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'driver_id' => ['required', 'integer', Rule::exists('employees', 'id')],
            'start_date' => ['required', 'date_format:Y-m-d'],
            'end_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'snapshot' => ['required', 'array'],
            'snapshot.travels' => ['required', 'array'],
            'snapshot.vehicleSummaries' => ['required', 'array'],
            'snapshot.entries' => ['required', 'array'],
            'snapshot.entries.*.valeId' => ['nullable', 'integer'],
            'snapshot.totals' => ['required', 'array'],
            'snapshot.selectedFuelRecordIds' => ['nullable', 'array'],
            'snapshot.selectedFuelRecordIds.*' => ['integer'],
        ]);
    }

    private function findCompanyDriver(int $driverId): Employee
    {
        return Employee::query()
            ->whereKey($driverId)
            ->where('status', 'ACTIVE')
            ->whereRaw('LOWER(job_title) LIKE ?', ['%motorista%'])
            ->firstOrFail();
    }

    /** @param array<string, mixed> $snapshot
     *  @return \Illuminate\Support\Collection<int, DriverDeduction>
     */
    private function resolveSelectedDeductions(array $snapshot, Employee $driver, ?DriverSettlement $settlement)
    {
        $ids = collect($snapshot['entries'] ?? [])
            ->pluck('valeId')
            ->filter(fn ($id): bool => is_numeric($id))
            ->map(fn ($id): int => (int) $id)
            ->unique()
            ->values();

        if ($ids->isEmpty()) {
            return collect();
        }

        $deductions = DriverDeduction::query()
            ->whereIn('id', $ids)
            ->where('employee_id', $driver->id)
            ->where(function ($query) use ($settlement): void {
                $query->where(function ($pending): void {
                    $pending->where('status', DriverDeduction::STATUS_PENDING)
                        ->whereNull('driver_settlement_id');
                });

                if ($settlement) {
                    $query->orWhere('driver_settlement_id', $settlement->id);
                }
            })
            ->get();

        if ($deductions->count() !== $ids->count()) {
            abort(422, 'Um ou mais vales selecionados não estão pendentes ou não pertencem ao motorista deste acerto.');
        }

        return $deductions;
    }

    /** @param \Illuminate\Support\Collection<int, DriverDeduction> $selected */
    private function syncSelectedDeductions(DriverSettlement $settlement, $selected, Request $request): void
    {
        $selectedIds = $selected->pluck('id')->map(fn ($id): int => (int) $id)->all();

        $currentlyLinked = DriverDeduction::query()
            ->where('driver_settlement_id', $settlement->id)
            ->get();

        foreach ($currentlyLinked as $deduction) {
            if (in_array((int) $deduction->id, $selectedIds, true)) {
                continue;
            }

            $before = $this->deductionAuditSnapshot($deduction);
            $deduction->forceFill([
                'status' => DriverDeduction::STATUS_PENDING,
                'driver_settlement_id' => null,
                'updated_by' => $request->user()?->id,
            ])->save();
            $this->recordDeductionEvent($deduction, DriverDeductionEvent::ACTION_REOPENED, $before, $this->deductionAuditSnapshot($deduction), $request);
        }

        foreach ($selected as $deduction) {
            if ((int) $deduction->driver_settlement_id === (int) $settlement->id && $deduction->status === DriverDeduction::STATUS_SETTLED) {
                continue;
            }

            $before = $this->deductionAuditSnapshot($deduction);
            $deduction->forceFill([
                'status' => DriverDeduction::STATUS_SETTLED,
                'driver_settlement_id' => $settlement->id,
                'updated_by' => $request->user()?->id,
            ])->save();
            $this->recordDeductionEvent($deduction, DriverDeductionEvent::ACTION_SETTLED, $before, $this->deductionAuditSnapshot($deduction), $request);
        }
    }

    private function releaseSettlementDeductions(DriverSettlement $settlement, Request $request): void
    {
        $deductions = DriverDeduction::query()
            ->where('driver_settlement_id', $settlement->id)
            ->get();

        foreach ($deductions as $deduction) {
            $before = $this->deductionAuditSnapshot($deduction);
            $deduction->forceFill([
                'status' => DriverDeduction::STATUS_PENDING,
                'driver_settlement_id' => null,
                'updated_by' => $request->user()?->id,
            ])->save();
            $this->recordDeductionEvent($deduction, DriverDeductionEvent::ACTION_REOPENED, $before, $this->deductionAuditSnapshot($deduction), $request);
        }
    }

    /** @return array<string, mixed> */
    private function deductionAuditSnapshot(DriverDeduction $deduction): array
    {
        return [
            'id' => (int) $deduction->id,
            'employee_id' => (int) $deduction->employee_id,
            'category' => $deduction->category,
            'entry_date' => $deduction->entry_date?->format('Y-m-d'),
            'description' => $deduction->description,
            'amount' => (float) $deduction->amount,
            'status' => $deduction->status,
            'driver_settlement_id' => $deduction->driver_settlement_id ? (int) $deduction->driver_settlement_id : null,
        ];
    }

    private function recordDeductionEvent(DriverDeduction $deduction, string $action, ?array $before, ?array $after, Request $request): void
    {
        DriverDeductionEvent::query()->create([
            'driver_deduction_id' => $deduction->id,
            'action' => $action,
            'before_data' => $before,
            'after_data' => $after,
            'user_id' => $request->user()?->id,
            'occurred_at' => now(),
        ]);
    }

    /** @param array<string, mixed> $snapshot */
    private function normalizeSnapshot(array $snapshot, Employee $driver): array
    {
        $snapshot['driverId'] = (int) $driver->id;
        $snapshot['driver'] = $driver->full_name;
        return $snapshot;
    }

    /** @return array<string, mixed> */
    private function auditSnapshot(DriverSettlement $settlement): array
    {
        return [
            'id' => (int) $settlement->id,
            'driver_id' => $settlement->driver_id ? (int) $settlement->driver_id : null,
            'driver' => $settlement->driver_name,
            'start_date' => $settlement->start_date?->format('Y-m-d'),
            'end_date' => $settlement->end_date?->format('Y-m-d'),
            'snapshot' => $settlement->snapshot,
        ];
    }

    private function recordEvent(DriverSettlement $settlement, string $action, ?array $before, ?array $after, Request $request): void
    {
        DriverSettlementEvent::query()->create([
            'driver_settlement_id' => $settlement->id,
            'action' => $action,
            'before_data' => $before,
            'after_data' => $after,
            'user_id' => $request->user()?->id,
            'occurred_at' => now(),
        ]);
    }

    /** @return array<string, mixed> */
    private function payload(DriverSettlement $settlement): array
    {
        $snapshot = is_array($settlement->snapshot) ? $settlement->snapshot : [];
        $snapshot['id'] = (string) $settlement->id;
        $snapshot['driverId'] = $settlement->driver_id ? (int) $settlement->driver_id : null;
        $snapshot['driver'] = $settlement->driver_name;
        $snapshot['startDate'] = $settlement->start_date?->format('Y-m-d');
        $snapshot['endDate'] = $settlement->end_date?->format('Y-m-d');
        $snapshot['savedAt'] = $settlement->updated_at?->toIso8601String();
        return $snapshot;
    }
}
