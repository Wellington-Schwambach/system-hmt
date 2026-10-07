<?php

namespace App\Http\Controllers\Operation;

use App\Http\Controllers\Controller;
use App\Models\DriverSettlement;
use App\Models\DriverSettlementEvent;
use App\Models\DriverDeduction;
use App\Models\DriverDeductionEvent;
use App\Models\Employee;
use App\Models\Vehicle;
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
            ->with('driver:id,admission_date')
            ->get()
            ->sort(function (DriverSettlement $first, DriverSettlement $second): int {
                $firstAdmission = $first->driver?->admission_date?->format('Y-m-d') ?? '9999-12-31';
                $secondAdmission = $second->driver?->admission_date?->format('Y-m-d') ?? '9999-12-31';
                $admissionComparison = strcmp($firstAdmission, $secondAdmission);

                if ($admissionComparison !== 0) {
                    return $admissionComparison;
                }

                $driverComparison = strcasecmp($first->driver_name ?? '', $second->driver_name ?? '');
                if ($driverComparison !== 0) {
                    return $driverComparison;
                }

                return strcmp(
                    $second->start_date?->format('Y-m-d') ?? '',
                    $first->start_date?->format('Y-m-d') ?? '',
                );
            })
            ->values()
            ->map(fn (DriverSettlement $settlement): array => $this->payload($settlement));

        return response()->json(['settlements' => $settlements]);
    }

    public function drivers(): JsonResponse
    {
        $drivers = Employee::query()
            ->where('status', 'ACTIVE')
            ->whereRaw('LOWER(job_title) LIKE ?', ['%motorista%'])
            ->orderByRaw('admission_date ASC NULLS LAST')
            ->orderBy('full_name')
            ->get(['id', 'employee_code', 'full_name', 'admission_date'])
            ->map(fn (Employee $employee): array => [
                'id' => (int) $employee->id,
                'employee_code' => $employee->employee_code,
                'name' => $employee->full_name,
                'admission_date' => $employee->admission_date?->format('Y-m-d'),
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
                'snapshot' => $this->normalizeSnapshot($validated['snapshot'], $driver, false),
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
        if (! $request->filled('driver_id') && $driverSettlement->driver_id !== null) {
            $request->merge(['driver_id' => (int) $driverSettlement->driver_id]);
        }

        $validated = $this->validatePayload($request);
        $driver = $this->findDriverForUpdate((int) $validated['driver_id'], $driverSettlement);

        $updated = DB::transaction(function () use ($request, $validated, $driver, $driverSettlement): DriverSettlement {
            $before = $this->auditSnapshot($driverSettlement);
            $deductions = $this->resolveSelectedDeductions($validated['snapshot'], $driver, $driverSettlement, false);

            $driverSettlement->fill([
                'driver_id' => $driver->id,
                'driver_name' => $driver->full_name,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'snapshot' => $this->normalizeSnapshot($validated['snapshot'], $driver, true),
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
            // Os blocos internos do snapshot podem estar vazios ou nem existir em
            // acertos antigos. A normalização abaixo sempre converte esses campos
            // para arrays válidos, então não devemos bloquear a gravação quando o
            // acerto não possui viagens, vales/descontos, médias ou abastecimentos.
            'snapshot.travels' => ['sometimes', 'array'],
            'snapshot.vehicleSummaries' => ['sometimes', 'array'],
            'snapshot.entries' => ['sometimes', 'array'],
            'snapshot.entries.*.valeId' => ['nullable', 'integer'],
            'snapshot.totals' => ['sometimes', 'array'],
            'snapshot.selectedFuelRecordIds' => ['sometimes', 'nullable', 'array'],
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

    private function findDriverForUpdate(int $driverId, DriverSettlement $settlement): Employee
    {
        if ($settlement->driver_id !== null && (int) $settlement->driver_id === $driverId) {
            return Employee::query()->whereKey($driverId)->firstOrFail();
        }

        return $this->findCompanyDriver($driverId);
    }

    /** @param array<string, mixed> $snapshot
     *  @return \Illuminate\Support\Collection<int, DriverDeduction>
     */
    private function resolveSelectedDeductions(
        array $snapshot,
        Employee $driver,
        ?DriverSettlement $settlement,
        bool $strict = true,
    )
    {
        $ids = collect($snapshot['entries'] ?? [])
            ->filter(fn ($entry): bool => is_array($entry))
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

        if ($strict && $deductions->count() !== $ids->count()) {
            abort(422, 'Um ou mais descontos selecionados não estão disponíveis ou não pertencem ao motorista deste acerto.');
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
    private function normalizeSnapshot(array $snapshot, Employee $driver, bool $preserveBonusSnapshot): array
    {
        $snapshot['driverId'] = (int) $driver->id;
        $snapshot['driver'] = $driver->full_name;
        return $this->sanitizeSnapshotForBusinessRules($snapshot, $preserveBonusSnapshot);
    }

    /** @param array<string, mixed> $snapshot */
    private function sanitizeSnapshotForBusinessRules(array $snapshot, bool $preserveBonusSnapshot): array
    {
        $entries = collect($snapshot['entries'] ?? [])
            ->filter(fn ($entry): bool => is_array($entry))
            ->values();

        $travels = collect($snapshot['travels'] ?? [])
            ->filter(fn ($travel): bool => is_array($travel))
            ->map(fn (array $travel): ?array => $this->sanitizeSettlementTravel($travel))
            ->filter()
            ->values();

        $snapshot['entries'] = $entries->all();
        $snapshot['travels'] = $travels->all();
        $vehicleSummaries = array_values(array_filter(
            is_array($snapshot['vehicleSummaries'] ?? null) ? $snapshot['vehicleSummaries'] : [],
            fn ($summary): bool => is_array($summary),
        ));
        $snapshot['vehicleSummaries'] = $vehicleSummaries;
        $snapshot['selectedFuelRecordIds'] = array_values(array_map(
            'intval',
            array_filter(
                is_array($snapshot['selectedFuelRecordIds'] ?? null) ? $snapshot['selectedFuelRecordIds'] : [],
                fn ($id): bool => is_numeric($id),
            ),
        ));

        $totals = is_array($snapshot['totals'] ?? null) ? $snapshot['totals'] : [];
        $totalOriginalNetFreight = round((float) $travels->sum(fn (array $travel): float => (float) ($travel['originalNetFreight'] ?? $travel['netFreight'] ?? 0)), 2);
        $totalNetFreight = round((float) $travels->sum(fn (array $travel): float => (float) ($travel['settlementNetFreight'] ?? $travel['netFreight'] ?? 0)), 2);
        $hasVehicleBonusSnapshot = collect($vehicleSummaries)
            ->contains(fn ($summary): bool => is_array($summary) && (int) ($summary['bonusCalculationVersion'] ?? 0) >= 1);

        if ($preserveBonusSnapshot && $hasVehicleBonusSnapshot) {
            $vehicleSummaries = $this->sanitizeVehicleBonusSnapshot($vehicleSummaries, $travels->all());
            $bonusValue = round((float) collect($vehicleSummaries)->sum('bonusValue'), 2);
            $bonusPercent = $totalNetFreight > 0
                ? round(($bonusValue / $totalNetFreight) * 100, 6)
                : 0.0;
        } elseif ($preserveBonusSnapshot) {
            // Acertos antigos não possuíam o detalhamento por placa. Ao editar um
            // registro legado, preservamos o percentual já gravado no snapshot.
            $bonusPercent = max(0.0, min(100.0, (float) ($totals['bonusPercent'] ?? 0)));
            $bonusValue = round($totalNetFreight * ($bonusPercent / 100), 2);
        } else {
            $vehicleSummaries = $this->applyCurrentVehicleBonusRules(
                $vehicleSummaries,
                $travels->all(),
                (string) ($snapshot['endDate'] ?? ''),
            );
            $bonusValue = round((float) collect($vehicleSummaries)->sum('bonusValue'), 2);
            $bonusPercent = $totalNetFreight > 0
                ? round(($bonusValue / $totalNetFreight) * 100, 6)
                : 0.0;
        }

        $snapshot['vehicleSummaries'] = $vehicleSummaries;
        $baseSalary = (float) ($totals['baseSalary'] ?? 0);
        $otherEarnings = (float) ($totals['otherEarnings'] ?? 0);
        $advances = round((float) $entries->where('type', DriverDeduction::CATEGORY_ADVANCE)->sum('value'), 2);
        $fines = round((float) $entries->where('type', DriverDeduction::CATEGORY_FINE)->sum('value'), 2);
        $loans = round((float) $entries->where('type', DriverDeduction::CATEGORY_LOAN)->sum('value'), 2);
        $otherDiscounts = round((float) $entries->where('type', DriverDeduction::CATEGORY_OTHER)->sum('value'), 2);
        $neutralExpenses = round((float) $entries->where('type', 'NEUTRAL_EXPENSE')->sum('value'), 2);
        $totalEarnings = round($baseSalary + $bonusValue + $otherEarnings, 2);
        $totalDiscounts = round($advances + $fines + $loans + $otherDiscounts, 2);

        $snapshot['totals'] = [
            ...$totals,
            'totalOriginalNetFreight' => $totalOriginalNetFreight,
            'totalNetFreight' => $totalNetFreight,
            'bonusPercent' => $bonusPercent,
            'bonusValue' => $bonusValue,
            'baseSalary' => $baseSalary,
            'dailyAllowance' => 0.0,
            'otherEarnings' => $otherEarnings,
            'totalEarnings' => $totalEarnings,
            'advances' => $advances,
            'fines' => $fines,
            'loans' => $loans,
            'otherDiscounts' => $otherDiscounts,
            'neutralExpenses' => $neutralExpenses,
            'totalDiscounts' => $totalDiscounts,
            'totalPositive' => $totalEarnings,
            'totalNegative' => $totalDiscounts,
            'totalReceivable' => round($totalEarnings - $totalDiscounts, 2),
        ];

        return $snapshot;
    }

    /** @param array<int, array<string, mixed>> $summaries
     *  @param array<int, array<string, mixed>> $travels
     *  @return array<int, array<string, mixed>>
     */
    private function applyCurrentVehicleBonusRules(array $summaries, array $travels, string $endDate): array
    {
        $plates = collect($summaries)
            ->pluck('plate')
            ->filter(fn ($plate): bool => is_string($plate) && trim($plate) !== '')
            ->map(fn (string $plate): string => strtoupper(trim($plate)))
            ->unique()
            ->values();

        $vehicles = Vehicle::query()
            ->with('averageBonusProfile.rules')
            ->whereIn('plate', $plates)
            ->get()
            ->keyBy(fn (Vehicle $vehicle): string => strtoupper(trim($vehicle->plate)));

        $freightByGroup = $this->settlementFreightByAverageGroup($travels);

        return collect($summaries)->map(function (array $summary) use ($vehicles, $freightByGroup, $endDate): array {
            $plate = strtoupper(trim((string) ($summary['plate'] ?? '')));
            /** @var Vehicle|null $vehicle */
            $vehicle = $vehicles->get($plate);
            $average = is_numeric($summary['averageKmPerLiter'] ?? null)
                ? (float) $summary['averageKmPerLiter']
                : null;
            $groupKey = (string) ($summary['groupKey'] ?? '');
            $baseFreight = round((float) ($freightByGroup[$groupKey] ?? 0), 2);
            $validFrom = $vehicle?->average_bonus_valid_from?->format('Y-m-d');
            $withinValidity = $validFrom === null || $endDate === '' || $validFrom <= $endDate;
            $enabled = (bool) ($vehicle?->average_bonus_enabled && $withinValidity);
            $profile = $vehicle?->averageBonusProfile;
            $isDisengagement = (bool) ($vehicle?->average_bonus_disengagement ?? false);
            $extraPercent = $enabled ? round((float) ($vehicle?->average_bonus_extra_percent ?? 0), 2) : 0.0;
            $matchedRule = null;
            $basePercent = 0.0;

            if ($enabled && $isDisengagement) {
                // Desengate permanece em 6,5%, sem crescimento por média.
                $basePercent = 6.5;
            } elseif ($enabled && $average !== null) {
                $profileRules = $profile?->rules
                    ? $profile->rules->map(fn ($rule): array => [
                        'minimum_average' => (float) $rule->minimum_average,
                        'percent' => (float) $rule->percent,
                    ])->all()
                    : [];

                $legacyRules = collect($vehicle?->average_bonus_rules ?? [])
                    ->filter(fn ($rule): bool => is_array($rule))
                    ->values()
                    ->all();
                $rules = count($profileRules) > 0 ? $profileRules : $legacyRules;

                $matchedRule = collect($rules)
                    ->filter(fn ($rule): bool => is_array($rule) && is_numeric($rule['minimum_average'] ?? null))
                    ->sortByDesc(fn (array $rule): float => (float) $rule['minimum_average'])
                    ->first(fn (array $rule): bool => $average >= (float) $rule['minimum_average']);

                $matchedPercent = is_array($matchedRule) && is_numeric($matchedRule['percent'] ?? null)
                    ? (float) $matchedRule['percent']
                    : 0.0;

                // Nas tabelas atuais, fora do desengate e após experiência a bonificação inicia em 7%.
                $basePercent = $profile !== null ? max(7.0, $matchedPercent) : $matchedPercent;
            }

            $percent = $enabled && ($isDisengagement || $average !== null)
                ? round($basePercent + $extraPercent, 2)
                : 0.0;
            $bonusValue = round($baseFreight * ($percent / 100), 2);

            return [
                ...$summary,
                'bonusCalculationVersion' => 2,
                'bonusEnabled' => $enabled,
                'bonusPercent' => $percent,
                'bonusBasePercent' => $basePercent,
                'bonusExtraPercent' => $extraPercent,
                'bonusDisengagement' => $isDisengagement,
                'bonusProfileCode' => $profile?->code,
                'bonusProfileName' => $profile?->name,
                'bonusRuleMinimumAverage' => is_array($matchedRule) && is_numeric($matchedRule['minimum_average'] ?? null)
                    ? (float) $matchedRule['minimum_average']
                    : null,
                'bonusBaseFreight' => $baseFreight,
                'bonusValue' => $bonusValue,
            ];
        })->values()->all();
    }

    /** @param array<int, array<string, mixed>> $summaries
     *  @param array<int, array<string, mixed>> $travels
     *  @return array<int, array<string, mixed>>
     */
    private function sanitizeVehicleBonusSnapshot(array $summaries, array $travels): array
    {
        $freightByGroup = $this->settlementFreightByAverageGroup($travels);

        return collect($summaries)->map(function (array $summary) use ($freightByGroup): array {
            $groupKey = (string) ($summary['groupKey'] ?? '');
            $baseFreight = round((float) ($freightByGroup[$groupKey] ?? 0), 2);
            $percent = is_numeric($summary['bonusPercent'] ?? null)
                ? max(0.0, min(20.0, (float) $summary['bonusPercent']))
                : 0.0;
            $version = max(1, (int) ($summary['bonusCalculationVersion'] ?? 1));

            return [
                ...$summary,
                'bonusCalculationVersion' => $version,
                'bonusEnabled' => (bool) ($summary['bonusEnabled'] ?? $percent > 0),
                'bonusPercent' => $percent,
                'bonusBasePercent' => is_numeric($summary['bonusBasePercent'] ?? null)
                    ? (float) $summary['bonusBasePercent']
                    : $percent,
                'bonusExtraPercent' => is_numeric($summary['bonusExtraPercent'] ?? null)
                    ? (float) $summary['bonusExtraPercent']
                    : 0.0,
                'bonusDisengagement' => (bool) ($summary['bonusDisengagement'] ?? false),
                'bonusProfileCode' => is_string($summary['bonusProfileCode'] ?? null)
                    ? $summary['bonusProfileCode']
                    : null,
                'bonusProfileName' => is_string($summary['bonusProfileName'] ?? null)
                    ? $summary['bonusProfileName']
                    : null,
                'bonusRuleMinimumAverage' => is_numeric($summary['bonusRuleMinimumAverage'] ?? null)
                    ? (float) $summary['bonusRuleMinimumAverage']
                    : null,
                'bonusBaseFreight' => $baseFreight,
                'bonusValue' => round($baseFreight * ($percent / 100), 2),
            ];
        })->values()->all();
    }

    /** @param array<int, array<string, mixed>> $travels
     *  @return array<string, float>
     */
    private function settlementFreightByAverageGroup(array $travels): array
    {
        $result = [];

        foreach ($travels as $travel) {
            if (! is_array($travel)) {
                continue;
            }

            $groupKey = trim((string) ($travel['averageGroupKey'] ?? ''));
            if ($groupKey === '') {
                continue;
            }

            $value = (float) ($travel['settlementNetFreight'] ?? $travel['netFreight'] ?? 0);
            $result[$groupKey] = ($result[$groupKey] ?? 0.0) + $value;
        }

        return $result;
    }

    /** @param array<string, mixed> $travel
     *  @return array<string, mixed>|null
     */
    private function sanitizeSettlementTravel(array $travel): ?array
    {
        $ctes = collect(is_array($travel['ctes'] ?? null) ? $travel['ctes'] : [])
            ->filter(fn ($cte): bool => is_array($cte));

        if ($ctes->isEmpty()) {
            return ($travel['cteType'] ?? null) === 'DAILY' ? null : $travel;
        }

        $eligibleCtes = $ctes
            ->reject(fn (array $cte): bool => ($cte['cteType'] ?? $cte['cte_type'] ?? null) === 'DAILY')
            ->values();

        if ($eligibleCtes->isEmpty()) {
            return null;
        }

        if ($eligibleCtes->count() === $ctes->count()) {
            return $travel;
        }

        $eligibleOriginal = round((float) $eligibleCtes->sum(fn (array $cte): float => (float) ($cte['netFreight'] ?? $cte['net_freight'] ?? 0)), 2);
        $original = (float) ($travel['originalNetFreight'] ?? $travel['netFreight'] ?? 0);
        $settlement = (float) ($travel['settlementNetFreight'] ?? $travel['netFreight'] ?? 0);
        $shareRatio = $original > 0 ? $settlement / $original : 1.0;
        $eligibleSettlement = round($eligibleOriginal * $shareRatio, 2);
        $firstCte = $eligibleCtes->first();

        $travel['ctes'] = $eligibleCtes->all();
        $travel['cteType'] = $firstCte['cteType'] ?? $firstCte['cte_type'] ?? 'NORMAL';
        $travel['cteNumber'] = $eligibleCtes
            ->map(fn (array $cte): string => (string) ($cte['cteNumber'] ?? $cte['cte_number'] ?? ''))
            ->filter()
            ->implode(' / ');
        $travel['cteSeries'] = $eligibleCtes
            ->map(fn (array $cte): string => (string) ($cte['cteSeries'] ?? $cte['cte_series'] ?? ''))
            ->filter()
            ->implode(' / ');
        $travel['netFreight'] = $eligibleOriginal;
        $travel['originalNetFreight'] = $eligibleOriginal;
        $travel['settlementNetFreight'] = $eligibleSettlement;
        $travel['settlementSharePercent'] = $eligibleOriginal > 0
            ? ($eligibleSettlement / $eligibleOriginal) * 100
            : 100;

        return $travel;
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
        $snapshot = $this->sanitizeSnapshotForBusinessRules($snapshot, true);
        $snapshot['id'] = (string) $settlement->id;
        $snapshot['driverId'] = $settlement->driver_id ? (int) $settlement->driver_id : null;
        $snapshot['driver'] = $settlement->driver_name;
        $snapshot['driverAdmissionDate'] = $settlement->driver?->admission_date?->format('Y-m-d');
        $snapshot['startDate'] = $settlement->start_date?->format('Y-m-d');
        $snapshot['endDate'] = $settlement->end_date?->format('Y-m-d');
        $snapshot['savedAt'] = $settlement->updated_at?->toIso8601String();
        return $snapshot;
    }
}
