<?php

namespace App\Http\Controllers\Operation;

use App\Http\Controllers\Controller;
use App\Models\DriverDeduction;
use App\Models\BrazilCity;
use App\Models\DriverDeductionEvent;
use App\Models\Employee;
use App\Models\Vehicle;
use Carbon\CarbonImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class DriverDeductionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureDatabaseReady();
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

        $vehiclePlates = Vehicle::query()
            ->whereNotNull('plate')
            ->where('plate', '<>', '')
            ->orderBy('plate')
            ->pluck('plate')
            ->map(fn (string $plate): string => strtoupper(trim($plate)))
            ->filter()
            ->unique()
            ->values();

        $cities = BrazilCity::query()
            ->with('state:id,abbreviation')
            ->orderBy('name')
            ->get(['id', 'state_id', 'name'])
            ->map(fn (BrazilCity $city): array => [
                'id' => (int) $city->id,
                'name' => $city->name,
                'state_abbreviation' => $city->state?->abbreviation ?? '',
            ]);

        return response()->json([
            'employees' => $employees,
            'vehicle_plates' => $vehiclePlates,
            'cities' => $cities,
        ]);
    }

    public function pending(Request $request): JsonResponse
    {
        $this->ensureDatabaseReady();
        $validated = $request->validate([
            'driver_id' => ['required', 'integer', Rule::exists('employees', 'id')],
            'start_date' => ['required', 'date_format:Y-m-d'],
            'end_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'settlement_id' => ['nullable', 'integer', Rule::exists('driver_settlements', 'id')],
        ]);

        $settlementId = isset($validated['settlement_id']) ? (int) $validated['settlement_id'] : null;

        $records = DriverDeduction::query()
            ->where('employee_id', (int) $validated['driver_id'])
            ->whereBetween('entry_date', [$validated['start_date'], $validated['end_date']])
            ->where(function ($query) use ($settlementId): void {
                $query->where(function ($pending): void {
                    $pending->where('status', DriverDeduction::STATUS_PENDING)
                        ->whereNull('driver_settlement_id');
                });

                if ($settlementId !== null) {
                    $query->orWhere('driver_settlement_id', $settlementId);
                }
            })
            ->orderBy('entry_date')
            ->orderBy('installment_number')
            ->orderBy('id')
            ->get()
            ->map(fn (DriverDeduction $deduction): array => $this->payload($deduction));

        return response()->json(['records' => $records]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureDatabaseReady();
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

        try {
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
                    'fine_infraction_code' => $category === DriverDeduction::CATEGORY_FINE ? ($validated['fine_infraction_code'] ?? null) : null,
                    'fine_infraction_at' => $category === DriverDeduction::CATEGORY_FINE ? $validated['fine_infraction_at'] : null,
                    'fine_original_amount' => $category === DriverDeduction::CATEGORY_FINE ? $validated['fine_original_amount'] : null,
                    'fine_charge_amount' => $category === DriverDeduction::CATEGORY_FINE ? $validated['amount'] : null,
                    'fine_observation' => $category === DriverDeduction::CATEGORY_FINE ? ($validated['fine_observation'] ?? null) : null,
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
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (QueryException $exception) {
            $this->throwDatabaseFailure($exception, 'gravar');
        } catch (Throwable $exception) {
            $this->throwUnexpectedFailure($exception, 'gravar');
        }

        return response()->json([
            'message' => $installments > 1
                ? sprintf('%s gravado em %d parcelas.', $this->categoryLabel($category), $installments)
                : sprintf('%s gravado com sucesso.', $this->categoryLabel($category)),
            'records' => collect($records)->map(fn (DriverDeduction $deduction): array => $this->payload($deduction))->values(),
        ], 201);
    }

    public function update(Request $request, DriverDeduction $driverDeduction): JsonResponse
    {
        $this->ensureDatabaseReady();
        $validated = $this->validatePayload($request, false);
        $allowedSettlementId = isset($validated['settlement_id']) ? (int) $validated['settlement_id'] : null;
        $this->ensureEditable($driverDeduction, $allowedSettlementId);

        if ($validated['category'] !== $driverDeduction->category) {
            throw ValidationException::withMessages([
                'category' => ['O tipo do lançamento não pode ser alterado durante a edição.'],
            ]);
        }

        try {
            $updated = DB::transaction(function () use ($request, $validated, $driverDeduction, $allowedSettlementId): DriverDeduction {
                $groupRecords = $driverDeduction->installment_group
                    ? DriverDeduction::query()
                        ->where('installment_group', $driverDeduction->installment_group)
                        ->orderBy('installment_number')
                        ->get()
                    : collect([$driverDeduction]);

                foreach ($groupRecords as $record) {
                    $this->ensureEditable($record, $allowedSettlementId);
                }

                $discountStart = CarbonImmutable::createFromFormat('Y-m', $validated['discount_start_month'])->startOfMonth();
                $withdrawalDate = ! empty($validated['withdrawal_date']) ? $validated['withdrawal_date'] : null;
                $category = $validated['category'];
                $requestedAmount = (float) $validated['amount'];

                if ($category === DriverDeduction::CATEGORY_LOAN) {
                    $desiredInstallments = (int) $validated['installments'];
                    $groupId = $driverDeduction->installment_group ?: (string) Str::uuid();
                    $existingByNumber = $groupRecords->keyBy(fn (DriverDeduction $record): int => (int) $record->installment_number);

                    foreach ($groupRecords as $record) {
                        if ((int) $record->installment_number > $desiredInstallments && $record->driver_settlement_id !== null) {
                            throw ValidationException::withMessages([
                                'installments' => ['Não é possível reduzir as parcelas porque uma das parcelas removidas já pertence a um Acerto.'],
                            ]);
                        }
                    }

                    $resultRecords = collect();
                    for ($number = 1; $number <= $desiredInstallments; $number++) {
                        /** @var DriverDeduction|null $record */
                        $record = $existingByNumber->get($number);
                        $values = [
                            'employee_id' => $validated['employee_id'],
                            'category' => DriverDeduction::CATEGORY_LOAN,
                            'entry_date' => $discountStart->addMonthsNoOverflow($number - 1)->format('Y-m-d'),
                            'withdrawal_date' => null,
                            'description' => $validated['description'] ?? null,
                            'fine_plate' => null,
                            'fine_location' => null,
                            'fine_number' => null,
                            'fine_infraction_code' => null,
                            'fine_infraction_at' => null,
                            'fine_original_amount' => null,
                            'fine_charge_amount' => null,
                            'fine_observation' => null,
                            'amount' => $requestedAmount,
                            'installment_group' => $groupId,
                            'installment_number' => $number,
                            'installments_total' => $desiredInstallments,
                            'updated_by' => $request->user()?->id,
                        ];

                        if ($record) {
                            $before = $this->auditSnapshot($record);
                            $record->forceFill($values)->save();
                            $record->refresh();
                            $this->recordEvent($record, DriverDeductionEvent::ACTION_UPDATED, $before, $this->auditSnapshot($record), $request);
                        } else {
                            $record = DriverDeduction::query()->create([
                                ...$values,
                                'status' => DriverDeduction::STATUS_PENDING,
                                'driver_settlement_id' => null,
                                'invoiced' => false,
                                'created_by' => $request->user()?->id,
                            ]);
                            $this->recordEvent($record, DriverDeductionEvent::ACTION_CREATED, null, $this->auditSnapshot($record), $request);
                        }

                        $resultRecords->push($record);
                    }

                    foreach ($groupRecords as $record) {
                        if ((int) $record->installment_number <= $desiredInstallments) {
                            continue;
                        }
                        $before = $this->auditSnapshot($record);
                        $record->forceFill(['deleted_by' => $request->user()?->id])->save();
                        $this->recordEvent($record, DriverDeductionEvent::ACTION_DELETED, $before, null, $request);
                        $record->delete();
                    }

                    $targetNumber = min((int) $driverDeduction->installment_number, $desiredInstallments);
                    /** @var DriverDeduction $target */
                    $target = $resultRecords->first(fn (DriverDeduction $record): bool => (int) $record->installment_number === $targetNumber)
                        ?? $resultRecords->first();

                    return $target->fresh(['employee', 'settlement']);
                }

                $fineChargeCents = (int) round($requestedAmount * 100);
                $fineInstallments = max(1, $groupRecords->count());
                $fineBaseCents = intdiv($fineChargeCents, $fineInstallments);
                $fineRemainder = $fineChargeCents % $fineInstallments;

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
                        'fine_infraction_code' => $category === DriverDeduction::CATEGORY_FINE ? ($validated['fine_infraction_code'] ?? null) : null,
                        'fine_infraction_at' => $category === DriverDeduction::CATEGORY_FINE ? $validated['fine_infraction_at'] : null,
                        'fine_original_amount' => $category === DriverDeduction::CATEGORY_FINE ? $validated['fine_original_amount'] : null,
                        'fine_charge_amount' => $category === DriverDeduction::CATEGORY_FINE ? $requestedAmount : null,
                        'fine_observation' => $category === DriverDeduction::CATEGORY_FINE ? ($validated['fine_observation'] ?? null) : null,
                        'amount' => $category === DriverDeduction::CATEGORY_FINE
                            ? ($fineBaseCents + ((((int) $record->installment_number) - 1) < $fineRemainder ? 1 : 0)) / 100
                            : ((int) $record->id === (int) $driverDeduction->id ? $requestedAmount : $record->amount),
                        'updated_by' => $request->user()?->id,
                    ])->save();
                    $record->refresh();
                    $this->recordEvent($record, DriverDeductionEvent::ACTION_UPDATED, $before, $this->auditSnapshot($record), $request);
                }


                return $driverDeduction->fresh(['employee', 'settlement']);
            });
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (QueryException $exception) {
            $this->throwDatabaseFailure($exception, 'editar');
        } catch (Throwable $exception) {
            $this->throwUnexpectedFailure($exception, 'editar');
        }

        return response()->json([
            'message' => 'Lançamento atualizado com sucesso.',
            'record' => $this->payload($updated),
        ]);
    }

    public function invoice(Request $request, DriverDeduction $driverDeduction): JsonResponse
    {
        $this->ensureDatabaseReady();
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

        try {
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
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (QueryException $exception) {
            $this->throwDatabaseFailure($exception, 'faturar');
        } catch (Throwable $exception) {
            $this->throwUnexpectedFailure($exception, 'faturar');
        }

        return response()->json([
            'message' => 'Parcela faturada com sucesso.',
            'record' => $this->payload($updated->load('employee', 'settlement')),
        ]);
    }

    public function destroy(Request $request, DriverDeduction $driverDeduction): Response
    {
        $this->ensureDatabaseReady();
        $this->ensureEditable($driverDeduction);

        try {
            DB::transaction(function () use ($request, $driverDeduction): void {
                $before = $this->auditSnapshot($driverDeduction);
                $driverDeduction->forceFill(['deleted_by' => $request->user()?->id])->save();
                $this->recordEvent($driverDeduction, DriverDeductionEvent::ACTION_DELETED, $before, null, $request);
                $driverDeduction->delete();
            });
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (QueryException $exception) {
            $this->throwDatabaseFailure($exception, 'excluir');
        } catch (Throwable $exception) {
            $this->throwUnexpectedFailure($exception, 'excluir');
        }

        return response()->noContent();
    }

    public function history(): JsonResponse
    {
        $this->ensureDatabaseReady();
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

        if ($category === DriverDeduction::CATEGORY_FINE) {
            $request->merge([
                'fine_number' => $this->normalizeFineNumber((string) $request->input('fine_number')),
            ]);
        }

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
            'description' => $category === DriverDeduction::CATEGORY_FINE
                ? ['required', 'string', 'max:255']
                : ['nullable', 'string', 'max:255'],
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
                ? ['required', 'string', 'max:100', 'regex:/^[A-Z0-9]+$/']
                : ['nullable', 'string', 'max:100'],
            'fine_infraction_code' => $category === DriverDeduction::CATEGORY_FINE
                ? ['nullable', 'string', 'regex:/^\d{5}$/']
                : ['nullable', 'string', 'max:5'],
            'fine_infraction_at' => $category === DriverDeduction::CATEGORY_FINE
                ? ['required', 'date_format:Y-m-d\TH:i']
                : ['nullable', 'date_format:Y-m-d\TH:i'],
            'fine_original_amount' => $category === DriverDeduction::CATEGORY_FINE
                ? ['required', 'numeric', 'gt:0', 'max:9999999999.99']
                : ['nullable', 'numeric', 'min:0', 'max:9999999999.99'],
            'fine_observation' => $category === DriverDeduction::CATEGORY_FINE
                ? ['nullable', 'string', 'max:1000']
                : ['nullable', 'string', 'max:1000'],
            'settlement_id' => ['nullable', 'integer', Rule::exists('driver_settlements', 'id')],
        ];

        if ($creating || $category === DriverDeduction::CATEGORY_LOAN) {
            $rules['installments'] = ['required', 'integer', 'between:1,60'];
        }

        $messages = [
            'employee_id.required' => 'Selecione o motorista.',
            'employee_id.exists' => 'O motorista selecionado não está ativo ou não está cadastrado como motorista da empresa.',
            'category.required' => 'Selecione o tipo de lançamento.',
            'category.in' => 'O tipo de lançamento informado é inválido.',
            'discount_start_month.required' => 'Informe o mês do desconto da 1ª parcela.',
            'discount_start_month.date_format' => 'Informe o mês do desconto no formato mês/ano.',
            'amount.required' => 'Informe o valor do lançamento.',
            'amount.numeric' => 'O valor informado não é um número válido.',
            'amount.gt' => 'O valor precisa ser maior que zero.',
            'amount.max' => 'O valor informado ultrapassa o limite permitido.',
            'withdrawal_date.required' => 'Informe a data do lançamento.',
            'withdrawal_date.date_format' => 'Informe uma data válida para o lançamento.',
            'description.required' => 'Informe a descrição da multa.',
            'description.max' => 'A descrição/observação pode ter no máximo 255 caracteres.',
            'fine_plate.required' => 'Selecione a placa da multa.',
            'fine_plate.max' => 'A placa da multa ultrapassa o tamanho permitido.',
            'fine_location.required' => 'Selecione o local/cidade da infração.',
            'fine_location.max' => 'O local da infração pode ter no máximo 255 caracteres.',
            'fine_number.required' => 'Informe o Nº Auto / Nº Multa.',
            'fine_number.regex' => 'Informe um Nº Auto / Nº Multa válido.',
            'fine_number.max' => 'O Nº Auto / Nº Multa pode ter no máximo 100 caracteres.',
            'fine_infraction_code.regex' => 'O Código da Infração precisa ter 5 dígitos, incluindo o desdobramento.',
            'fine_infraction_at.required' => 'Informe a data e a hora da infração.',
            'fine_infraction_at.date_format' => 'Informe uma data e hora válidas para a infração.',
            'fine_original_amount.required' => 'Informe o valor original da multa.',
            'fine_original_amount.numeric' => 'O valor original da multa é inválido.',
            'fine_original_amount.gt' => 'O valor original da multa precisa ser maior que zero.',
            'fine_observation.max' => 'A observação da multa pode ter no máximo 1000 caracteres.',
            'installments.required' => 'Informe o número de parcelas.',
            'installments.integer' => 'O número de parcelas precisa ser um número inteiro.',
            'installments.between' => 'Informe entre 1 e 60 parcelas.',
            'settlement_id.exists' => 'O Acerto vinculado não foi encontrado. Atualize a tela e tente novamente.',
        ];

        $attributes = [
            'employee_id' => 'motorista',
            'category' => 'tipo de lançamento',
            'discount_start_month' => 'mês do desconto da 1ª parcela',
            'description' => 'descrição / observação',
            'amount' => $category === DriverDeduction::CATEGORY_FINE
                ? 'valor à cobrar'
                : ($category === DriverDeduction::CATEGORY_LOAN ? 'valor da parcela' : 'valor'),
            'withdrawal_date' => 'data',
            'fine_plate' => 'placa da multa',
            'fine_location' => 'local da infração',
            'fine_number' => 'Nº Auto / Nº Multa',
            'fine_infraction_code' => 'Código da Infração',
            'fine_infraction_at' => 'data e hora da infração',
            'fine_original_amount' => 'valor original da multa',
            'fine_observation' => 'observação da multa',
            'installments' => 'número de parcelas',
            'settlement_id' => 'Acerto vinculado',
        ];

        return $request->validate($rules, $messages, $attributes);
    }

    private function ensureDatabaseReady(): void
    {
        $requiredColumns = [
            'employee_id',
            'category',
            'entry_date',
            'withdrawal_date',
            'description',
            'amount',
            'installment_group',
            'installment_number',
            'installments_total',
            'status',
            'driver_settlement_id',
            'invoiced',
            'invoiced_at',
            'invoiced_by',
            'fine_plate',
            'fine_location',
            'fine_number',
            'fine_infraction_code',
            'fine_infraction_at',
            'fine_original_amount',
            'fine_charge_amount',
            'fine_observation',
            'created_by',
            'updated_by',
            'deleted_by',
        ];

        $deductionsReady = Schema::hasTable('driver_deductions')
            && Schema::hasColumns('driver_deductions', $requiredColumns);
        $eventsReady = Schema::hasTable('driver_deduction_events');

        if ($deductionsReady && $eventsReady) {
            return;
        }

        throw new HttpResponseException(response()->json([
            'code' => 'VALES_DATABASE_UPDATE_REQUIRED',
            'message' => 'O banco de dados do servidor está desatualizado para a versão atual de Vales, Multas e Descontos.',
            'errors' => [
                'server' => [
                    'Execute as migrations pendentes no servidor com php artisan migrate e tente novamente.',
                ],
            ],
        ], 503));
    }

    private function throwDatabaseFailure(QueryException $exception, string $action): never
    {
        $reference = 'VLS-'.strtoupper(Str::random(8));
        $sqlState = (string) ($exception->errorInfo[0] ?? $exception->getCode());

        Log::error('Falha no banco ao operar Vales/Multas/Descontos.', [
            'reference' => $reference,
            'action' => $action,
            'sql_state' => $sqlState,
            'exception' => $exception,
        ]);

        [$status, $code, $message, $detail] = match ($sqlState) {
            '42P01', '42703' => [
                503,
                'VALES_DATABASE_UPDATE_REQUIRED',
                'O banco de dados do servidor está desatualizado para esta versão da tela.',
                'Execute as migrations pendentes no servidor com php artisan migrate e tente novamente.',
            ],
            '23503' => [
                422,
                'VALES_DATABASE_REFERENCE_ERROR',
                'Não foi possível concluir a gravação porque um registro relacionado não existe mais.',
                'Atualize a página, selecione novamente o motorista/Acerto e tente outra vez.',
            ],
            '23505' => [
                409,
                'VALES_DATABASE_CONFLICT',
                'O servidor identificou um conflito com um registro já existente.',
                'Atualize a tela e confira se o lançamento já foi gravado antes de tentar novamente.',
            ],
            '22001', '22003' => [
                422,
                'VALES_DATABASE_VALUE_ERROR',
                'Um dos valores informados ultrapassa o limite aceito pelo servidor.',
                'Revise valores, textos e número de parcelas antes de tentar novamente.',
            ],
            default => [
                500,
                'VALES_DATABASE_ERROR',
                'O banco de dados recusou a operação e o lançamento não foi gravado.',
                'Tente novamente. Se o erro continuar, informe o código de suporte ao administrador.',
            ],
        };

        throw new HttpResponseException(response()->json([
            'code' => $code,
            'message' => $message,
            'errors' => [
                'server' => [
                    $detail,
                    'Código de suporte: '.$reference,
                ],
            ],
        ], $status));
    }

    private function throwUnexpectedFailure(Throwable $exception, string $action): never
    {
        $reference = 'VLS-'.strtoupper(Str::random(8));

        Log::error('Falha inesperada ao operar Vales/Multas/Descontos.', [
            'reference' => $reference,
            'action' => $action,
            'exception' => $exception,
        ]);

        throw new HttpResponseException(response()->json([
            'code' => 'VALES_UNEXPECTED_ERROR',
            'message' => 'O servidor encontrou um erro inesperado e o lançamento não foi gravado.',
            'errors' => [
                'server' => [
                    'Tente novamente. Se o erro continuar, informe o código de suporte ao administrador.',
                    'Código de suporte: '.$reference,
                ],
            ],
        ], 500));
    }

    private function ensureEditable(DriverDeduction $deduction, ?int $allowedSettlementId = null): void
    {
        $linkedToAllowedSettlement = $allowedSettlementId !== null
            && (int) $deduction->driver_settlement_id === $allowedSettlementId;
        $pendingAndUnlinked = $deduction->driver_settlement_id === null
            && $deduction->status === DriverDeduction::STATUS_PENDING;

        if (! $pendingAndUnlinked && ! $linkedToAllowedSettlement) {
            throw ValidationException::withMessages([
                'record' => ['Esta parcela já pertence a outro acerto e não pode ser alterada neste contexto.'],
            ]);
        }

        if ($deduction->invoiced && ! $linkedToAllowedSettlement) {
            throw ValidationException::withMessages([
                'record' => ['Esta parcela já foi faturada e só pode ser ajustada a partir do acerto ao qual está vinculada.'],
            ]);
        }
    }

    private function normalizeFineNumber(string $number): string
    {
        return strtoupper((string) preg_replace('/[^A-Za-z0-9]/', '', trim($number)));
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
            'fine_infraction_code' => $deduction->fine_infraction_code,
            'fine_infraction_at' => $deduction->fine_infraction_at?->format('Y-m-d\TH:i'),
            'fine_original_amount' => $deduction->fine_original_amount !== null ? (float) $deduction->fine_original_amount : null,
            'fine_charge_amount' => $deduction->fine_charge_amount !== null ? (float) $deduction->fine_charge_amount : null,
            'fine_observation' => $deduction->fine_observation,
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
            'fineInfractionCode' => $deduction->fine_infraction_code,
            'fineInfractionAt' => $deduction->fine_infraction_at?->format('Y-m-d\TH:i'),
            'fineOriginalAmount' => $deduction->fine_original_amount !== null ? (float) $deduction->fine_original_amount : null,
            'fineChargeAmount' => $deduction->fine_charge_amount !== null ? (float) $deduction->fine_charge_amount : null,
            'fineObservation' => $deduction->fine_observation,
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
