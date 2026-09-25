<?php

namespace App\Http\Controllers\Operation;

use App\Http\Controllers\Controller;
use App\Models\DriverDeduction;
use App\Models\DriverDeductionEvent;
use App\Models\Employee;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class DriverDeductionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DriverDeduction::query()->with(['employee:id,employee_code,full_name,job_title', 'settlement:id,start_date,end_date']);

        if ($request->filled('employee_id')) {
            $query->where('employee_id', (int) $request->input('employee_id'));
        }
        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }
        if ($request->filled('date_from')) {
            $query->whereDate('entry_date', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('entry_date', '<=', $request->input('date_to'));
        }

        $records = $query
            ->orderBy('entry_date')
            ->orderBy('employee_id')
            ->orderBy('installment_number')
            ->orderBy('id')
            ->get()
            ->map(fn (DriverDeduction $deduction): array => $this->payload($deduction));

        return response()->json(['records' => $records]);
    }

    public function options(): JsonResponse
    {
        $employees = Employee::query()
            ->where('status', 'ACTIVE')
            ->whereRaw('LOWER(job_title) LIKE ?', ['%motorista%'])
            ->orderBy('full_name')
            ->get(['id', 'employee_code', 'full_name', 'job_title'])
            ->map(fn (Employee $employee): array => [
                'id' => (int) $employee->id,
                'code' => $employee->employee_code,
                'name' => $employee->full_name,
                'jobTitle' => $employee->job_title,
                'isDriver' => true,
            ]);

        return response()->json(['employees' => $employees]);
    }

    public function pending(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'driver_id' => ['required', 'integer', Rule::exists('employees', 'id')],
            'start_date' => ['required', 'date_format:Y-m-d'],
            'end_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:start_date'],
        ]);

        $records = DriverDeduction::query()
            ->where('employee_id', (int) $validated['driver_id'])
            ->where('status', DriverDeduction::STATUS_PENDING)
            ->whereNull('driver_settlement_id')
            ->whereBetween('entry_date', [$validated['start_date'], $validated['end_date']])
            ->orderBy('entry_date')
            ->orderBy('installment_number')
            ->orderBy('id')
            ->get()
            ->map(fn (DriverDeduction $deduction): array => $this->payload($deduction));

        return response()->json(['records' => $records]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatePayload($request, true);
        $installments = (int) $validated['installments'];
        $group = (string) Str::uuid();
        $discountStart = CarbonImmutable::createFromFormat('Y-m', $validated['discount_start_month'])->startOfMonth();
        $withdrawalDate = ! empty($validated['withdrawal_date'])
            ? CarbonImmutable::createFromFormat('Y-m-d', $validated['withdrawal_date'])->startOfDay()
            : null;
        $category = $validated['category'];
        $isLoan = $category === DriverDeduction::CATEGORY_LOAN;
        $amountCents = (int) round(((float) $validated['amount']) * 100);

        if (! $isLoan && $amountCents < $installments) {
            throw ValidationException::withMessages([
                'installments' => ['O valor total precisa permitir pelo menos R$ 0,01 por parcela.'],
            ]);
        }

        $baseCents = $isLoan ? $amountCents : intdiv($amountCents, $installments);
        $remainder = $isLoan ? 0 : $amountCents % $installments;

        $records = DB::transaction(function () use (
            $request,
            $validated,
            $installments,
            $group,
            $discountStart,
            $withdrawalDate,
            $category,
            $isLoan,
            $baseCents,
            $remainder,
        ): array {
            $created = [];

            for ($index = 0; $index < $installments; $index++) {
                $installmentCents = $isLoan ? $baseCents : $baseCents + ($index < $remainder ? 1 : 0);
                $deduction = DriverDeduction::query()->create([
                    'employee_id' => $validated['employee_id'],
                    'category' => $category,
                    'entry_date' => $discountStart->addMonthsNoOverflow($index)->format('Y-m-d'),
                    'withdrawal_date' => $withdrawalDate?->format('Y-m-d'),
                    'description' => $validated['description'] ?? null,
                    'fine_plate' => $category === DriverDeduction::CATEGORY_FINE ? strtoupper((string) $validated['fine_plate']) : null,
                    'fine_location' => $category === DriverDeduction::CATEGORY_FINE ? $validated['fine_location'] : null,
                    'fine_number' => $category === DriverDeduction::CATEGORY_FINE ? $validated['fine_number'] : null,
                    'amount' => $installmentCents / 100,
                    'installment_group' => $group,
                    'installment_number' => $index + 1,
                    'installments_total' => $installments,
                    'status' => DriverDeduction::STATUS_PENDING,
                    'invoiced' => false,
                    'created_by' => $request->user()?->id,
                    'updated_by' => $request->user()?->id,
                ]);

                $this->recordEvent(
                    $deduction,
                    DriverDeductionEvent::ACTION_CREATED,
                    null,
                    $this->auditSnapshot($deduction),
                    $request,
                );
                $created[] = $deduction->load('employee', 'settlement');
            }

            return $created;
        });

        return response()->json([
            'message' => $installments > 1
                ? sprintf('%s gravado em %d parcelas.', $this->categoryLabel($category), $installments)
                : sprintf('%s gravado com sucesso.', $this->categoryLabel($category)),
            'records' => collect($records)->map(fn (DriverDeduction $deduction): array => $this->payload($deduction))->values(),
        ], 201);
    }

    public function update(Request $request, DriverDeduction $driverDeduction): JsonResponse
    {
        $this->ensureEditable($driverDeduction);
        $validated = $this->validatePayload($request, false);

        $updated = DB::transaction(function () use ($request, $validated, $driverDeduction): DriverDeduction {
            $groupRecords = $driverDeduction->installment_group
                ? DriverDeduction::query()->where('installment_group', $driverDeduction->installment_group)->orderBy('installment_number')->get()
                : collect([$driverDeduction]);

            foreach ($groupRecords as $record) {
                $this->ensureEditable($record);
            }

            $discountStart = CarbonImmutable::createFromFormat('Y-m', $validated['discount_start_month'])->startOfMonth();
            $withdrawalDate = ! empty($validated['withdrawal_date']) ? $validated['withdrawal_date'] : null;
            $category = $validated['category'];
            $requestedAmount = (float) $validated['amount'];

            foreach ($groupRecords as $record) {
                $before = $this->auditSnapshot($record);
                $record->forceFill([
                    'employee_id' => $validated['employee_id'],
                    'category' => $category,
                    'entry_date' => $discountStart->addMonthsNoOverflow(max(0, ((int) $record->installment_number) - 1))->format('Y-m-d'),
                    'withdrawal_date' => $withdrawalDate,
                    'description' => $validated['description'] ?? null,
                    'fine_plate' => $category === DriverDeduction::CATEGORY_FINE ? strtoupper((string) $validated['fine_plate']) : null,
                    'fine_location' => $category === DriverDeduction::CATEGORY_FINE ? $validated['fine_location'] : null,
                    'fine_number' => $category === DriverDeduction::CATEGORY_FINE ? $validated['fine_number'] : null,
                    'amount' => $category === DriverDeduction::CATEGORY_LOAN || (int) $record->id === (int) $driverDeduction->id
                        ? $requestedAmount
                        : $record->amount,
                    'updated_by' => $request->user()?->id,
                ])->save();
                $record->refresh();
                $this->recordEvent($record, DriverDeductionEvent::ACTION_UPDATED, $before, $this->auditSnapshot($record), $request);
            }

            return $driverDeduction->fresh(['employee', 'settlement']);
        });

        return response()->json([
            'message' => 'Lançamento atualizado com sucesso.',
            'record' => $this->payload($updated),
        ]);
    }

    public function invoice(Request $request, DriverDeduction $driverDeduction): JsonResponse
    {
        if ($driverDeduction->category !== DriverDeduction::CATEGORY_ADVANCE) {
            throw ValidationException::withMessages([
                'record' => 'Somente vales podem ser faturados.',
            ]);
        }

        if ($driverDeduction->invoiced) {
            return response()->json([
                'message' => 'Esta parcela já está faturada.',
                'record' => $this->payload($driverDeduction->load('employee', 'settlement')),
            ]);
        }

        $updated = DB::transaction(function () use ($request, $driverDeduction): DriverDeduction {
            $before = $this->auditSnapshot($driverDeduction);
            $driverDeduction->forceFill([
                'invoiced' => true,
                'invoiced_at' => now(),
                'invoiced_by' => $request->user()?->id,
                'updated_by' => $request->user()?->id,
            ])->save();
            $driverDeduction->refresh();
            $this->recordEvent($driverDeduction, DriverDeductionEvent::ACTION_INVOICED, $before, $this->auditSnapshot($driverDeduction), $request);
            return $driverDeduction;
        });

        return response()->json([
            'message' => 'Parcela faturada com sucesso.',
            'record' => $this->payload($updated->load('employee', 'settlement')),
        ]);
    }

    public function destroy(Request $request, DriverDeduction $driverDeduction): Response
    {
        $this->ensureEditable($driverDeduction);

        DB::transaction(function () use ($request, $driverDeduction): void {
            $before = $this->auditSnapshot($driverDeduction);
            $driverDeduction->forceFill(['deleted_by' => $request->user()?->id])->save();
            $this->recordEvent($driverDeduction, DriverDeductionEvent::ACTION_DELETED, $before, null, $request);
            $driverDeduction->delete();
        });

        return response()->noContent();
    }

    public function history(): JsonResponse
    {
        $events = DriverDeductionEvent::query()
            ->with('user:id,name,username')
            ->latest('occurred_at')
            ->latest('id')
            ->limit(500)
            ->get()
            ->map(fn (DriverDeductionEvent $event): array => [
                'id' => (int) $event->id,
                'recordId' => (int) $event->driver_deduction_id,
                'action' => $event->action,
                'before' => $event->before_data,
                'after' => $event->after_data,
                'userName' => $event->user?->name ?? $event->user?->username,
                'occurredAt' => $event->occurred_at?->toIso8601String(),
            ]);

        return response()->json(['events' => $events]);
    }

    /** @return array<string, mixed> */
    private function validatePayload(Request $request, bool $creating): array
    {
        $category = (string) $request->input('category');
        $rules = [
            'employee_id' => [
                'required',
                'integer',
                Rule::exists('employees', 'id')->where(fn ($query) => $query
                    ->where('status', 'ACTIVE')
                    ->whereRaw('LOWER(job_title) LIKE ?', ['%motorista%'])),
            ],
            'category' => ['required', Rule::in([
                DriverDeduction::CATEGORY_ADVANCE,
                DriverDeduction::CATEGORY_FINE,
                DriverDeduction::CATEGORY_LOAN,
                DriverDeduction::CATEGORY_OTHER,
            ])],
            'discount_start_month' => ['required', 'date_format:Y-m'],
            'description' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:9999999999.99'],
            'withdrawal_date' => $category === DriverDeduction::CATEGORY_LOAN
                ? ['nullable', 'date_format:Y-m-d']
                : ['required', 'date_format:Y-m-d'],
            'fine_plate' => $category === DriverDeduction::CATEGORY_FINE
                ? ['required', 'string', 'max:20']
                : ['nullable', 'string', 'max:20'],
            'fine_location' => $category === DriverDeduction::CATEGORY_FINE
                ? ['required', 'string', 'max:255']
                : ['nullable', 'string', 'max:255'],
            'fine_number' => $category === DriverDeduction::CATEGORY_FINE
                ? ['required', 'string', 'max:100']
                : ['nullable', 'string', 'max:100'],
        ];

        if ($creating) {
            $rules['installments'] = ['required', 'integer', 'between:1,60'];
        }

        return $request->validate($rules);
    }

    private function ensureEditable(DriverDeduction $deduction): void
    {
        if ($deduction->driver_settlement_id !== null || $deduction->status !== DriverDeduction::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'record' => 'Esta parcela já foi utilizada em um acerto e não pode ser alterada ou excluída.',
            ]);
        }

        if ($deduction->invoiced) {
            throw ValidationException::withMessages([
                'record' => 'Esta parcela já foi faturada e não pode ser alterada ou excluída.',
            ]);
        }
    }

    private function categoryLabel(string $category): string
    {
        return match ($category) {
            DriverDeduction::CATEGORY_ADVANCE => 'Vale',
            DriverDeduction::CATEGORY_FINE => 'Multa',
            DriverDeduction::CATEGORY_LOAN => 'Empréstimo',
            default => 'Desconto',
        };
    }

    /** @return array<string, mixed> */
    private function auditSnapshot(DriverDeduction $deduction): array
    {
        return [
            'id' => (int) $deduction->id,
            'employee_id' => (int) $deduction->employee_id,
            'category' => $deduction->category,
            'entry_date' => $deduction->entry_date?->format('Y-m-d'),
            'withdrawal_date' => $deduction->withdrawal_date?->format('Y-m-d'),
            'description' => $deduction->description,
            'fine_plate' => $deduction->fine_plate,
            'fine_location' => $deduction->fine_location,
            'fine_number' => $deduction->fine_number,
            'amount' => (float) $deduction->amount,
            'installment_group' => $deduction->installment_group,
            'installment_number' => (int) ($deduction->installment_number ?? 1),
            'installments_total' => (int) ($deduction->installments_total ?? 1),
            'status' => $deduction->status,
            'driver_settlement_id' => $deduction->driver_settlement_id ? (int) $deduction->driver_settlement_id : null,
            'invoiced' => (bool) $deduction->invoiced,
            'invoiced_at' => $deduction->invoiced_at?->toIso8601String(),
        ];
    }

    private function recordEvent(DriverDeduction $deduction, string $action, ?array $before, ?array $after, Request $request): void
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

    /** @return array<string, mixed> */
    private function payload(DriverDeduction $deduction): array
    {
        $deduction->loadMissing(['employee:id,employee_code,full_name,job_title', 'settlement:id,start_date,end_date']);
        return [
            'id' => (int) $deduction->id,
            'employeeId' => (int) $deduction->employee_id,
            'employeeCode' => $deduction->employee?->employee_code,
            'employeeName' => $deduction->employee?->full_name ?? 'Motorista removido',
            'jobTitle' => $deduction->employee?->job_title,
            'category' => $deduction->category,
            'date' => $deduction->entry_date?->format('Y-m-d'),
            'discountMonth' => $deduction->entry_date?->format('Y-m'),
            'withdrawalDate' => $deduction->withdrawal_date?->format('Y-m-d'),
            'description' => $deduction->description ?? '',
            'finePlate' => $deduction->fine_plate,
            'fineLocation' => $deduction->fine_location,
            'fineNumber' => $deduction->fine_number,
            'amount' => (float) $deduction->amount,
            'installmentGroup' => $deduction->installment_group,
            'installmentNumber' => (int) ($deduction->installment_number ?? 1),
            'installmentsTotal' => (int) ($deduction->installments_total ?? 1),
            'status' => $deduction->status,
            'settlementId' => $deduction->driver_settlement_id ? (int) $deduction->driver_settlement_id : null,
            'settlementStartDate' => $deduction->settlement?->start_date?->format('Y-m-d'),
            'settlementEndDate' => $deduction->settlement?->end_date?->format('Y-m-d'),
            'invoiced' => (bool) $deduction->invoiced,
            'invoicedAt' => $deduction->invoiced_at?->toIso8601String(),
            'canEdit' => $deduction->driver_settlement_id === null
                && $deduction->status === DriverDeduction::STATUS_PENDING
                && ! $deduction->invoiced,
            'createdAt' => $deduction->created_at?->toIso8601String(),
            'updatedAt' => $deduction->updated_at?->toIso8601String(),
        ];
    }
}
