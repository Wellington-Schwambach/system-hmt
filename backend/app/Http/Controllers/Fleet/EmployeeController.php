<?php

namespace App\Http\Controllers\Fleet;

use App\Http\Controllers\Controller;
use App\Http\Requests\Fleet\StoreEmployeeRequest;
use App\Http\Requests\Fleet\UpdateEmployeeRequest;
use App\Models\BrazilCity;
use App\Models\BrazilState;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class EmployeeController extends Controller
{
    /** @var array<string, string> */
    private const ROUTE_DOCUMENT_TYPES = [
        'cnh' => EmployeeDocument::TYPE_CNH,
        'aso' => EmployeeDocument::TYPE_ASO,
        'toxicological' => EmployeeDocument::TYPE_TOXICOLOGICAL,
        'registration-form' => EmployeeDocument::TYPE_REGISTRATION_FORM,
    ];

    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $status = strtoupper(trim((string) $request->query('status', '')));

        $employees = Employee::query()
            ->with(['documents', 'state', 'city'])
            ->when($search !== '', function ($query) use ($search): void {
                $like = '%'.mb_strtolower($search).'%';
                $digits = preg_replace('/\D/', '', $search);

                $query->where(function ($inner) use ($like, $digits): void {
                    $inner
                        ->whereRaw('LOWER(full_name) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(employee_code) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(job_title) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(email, \'\')) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(cnh_number, \'\')) LIKE ?', [$like]);

                    if ($digits !== '') {
                        $inner->orWhere('cpf', 'like', "%{$digits}%");
                    }
                });
            })
            ->when(in_array($status, ['ACTIVE', 'LEAVE', 'INACTIVE'], true), function ($query) use ($status): void {
                $query->where('status', $status);
            })
            ->orderBy('full_name')
            ->get()
            ->map(fn (Employee $employee): array => $this->payload($employee));

        return response()->json([
            'employees' => $employees,
            'total' => $employees->count(),
        ]);
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $storedPaths = [];

        try {
            $employee = DB::transaction(function () use ($request, &$storedPaths): Employee {
                $attributes = $this->attributes($request);
                $attributes['created_by'] = $request->user()?->id;
                $attributes['updated_by'] = $request->user()?->id;

                $employee = Employee::query()->create($attributes);

                foreach (EmployeeDocument::INPUTS as $type => $input) {
                    if (! $request->hasFile($input)) {
                        continue;
                    }

                    $documentData = $this->storeDocument($request, $employee, $type, $input);
                    $storedPaths[] = $documentData['path'];
                    $employee->documents()->create([
                        'type' => $type,
                        ...$documentData,
                    ]);
                }

                return $employee->load(['documents', 'state', 'city']);
            });
        } catch (Throwable $exception) {
            foreach ($storedPaths as $path) {
                Storage::disk('local')->delete($path);
            }

            throw $exception;
        }

        return response()->json([
            'message' => 'Colaborador cadastrado com sucesso.',
            'employee' => $this->payload($employee),
        ], 201);
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        $newPaths = [];
        $oldPathsToDelete = [];

        try {
            DB::transaction(function () use (
                $request,
                $employee,
                &$newPaths,
                &$oldPathsToDelete
            ): void {
                $attributes = $this->attributes($request);
                $attributes['updated_by'] = $request->user()?->id;
                $employee->fill($attributes)->save();

                foreach (EmployeeDocument::INPUTS as $type => $input) {
                    $existing = $employee->documents()->where('type', $type)->first();
                    $removeInput = 'remove_'.$input;

                    if ($request->hasFile($input)) {
                        $documentData = $this->storeDocument($request, $employee, $type, $input);
                        $newPaths[] = $documentData['path'];

                        if ($existing !== null) {
                            $oldPathsToDelete[] = $existing->path;
                            $existing->fill($documentData)->save();
                        } else {
                            $employee->documents()->create([
                                'type' => $type,
                                ...$documentData,
                            ]);
                        }

                        continue;
                    }

                    if ($request->boolean($removeInput) && $existing !== null) {
                        $oldPathsToDelete[] = $existing->path;
                        $existing->delete();
                    }
                }
            });
        } catch (Throwable $exception) {
            foreach ($newPaths as $path) {
                Storage::disk('local')->delete($path);
            }

            throw $exception;
        }

        foreach (array_unique($oldPathsToDelete) as $path) {
            if (! in_array($path, $newPaths, true)) {
                Storage::disk('local')->delete($path);
            }
        }

        return response()->json([
            'message' => 'Colaborador atualizado com sucesso.',
            'employee' => $this->payload($employee->fresh()->load(['documents', 'state', 'city'])),
        ]);
    }

    public function destroy(Employee $employee): Response
    {
        $paths = $employee->documents()->pluck('path')->all();
        $employee->delete();

        foreach ($paths as $path) {
            Storage::disk('local')->delete($path);
        }

        return response()->noContent();
    }

    public function downloadDocument(Employee $employee, string $documentType): StreamedResponse|JsonResponse
    {
        $type = self::ROUTE_DOCUMENT_TYPES[$documentType] ?? null;

        if ($type === null) {
            return response()->json(['message' => 'Tipo de documento inválido.'], 404);
        }

        $document = $employee->documents()->where('type', $type)->first();

        if ($document === null || ! Storage::disk('local')->exists($document->path)) {
            return response()->json(['message' => 'Este documento não está disponível.'], 404);
        }

        return Storage::disk('local')->download(
            $document->path,
            $document->original_name,
            ['Content-Type' => $document->mime_type ?? 'application/octet-stream']
        );
    }

    /** @return array<string, mixed> */
    private function attributes(StoreEmployeeRequest $request): array
    {
        $excluded = [
            ...array_values(EmployeeDocument::INPUTS),
            ...array_map(fn (string $input): string => 'remove_'.$input, array_values(EmployeeDocument::INPUTS)),
        ];
        $validated = $request->safe()->except($excluded);
        $nullable = [
            'rg', 'phone', 'email', 'full_address', 'address_street', 'address_number',
            'address_neighborhood', 'state_id', 'city_id', 'termination_date', 'family_contact',
            'cnh_number', 'cnh_category', 'cnh_issued_at',
            'cnh_first_license_date', 'cnh_expiry_date', 'cnh_state', 'cnh_security_code',
            'aso_expiry_date', 'opentech_expiry_date', 'angellira_expiry_date',
            'toxicological_expiry_date', 'trainings', 'notes',
        ];

        foreach ($nullable as $field) {
            $validated[$field] = isset($validated[$field]) && $validated[$field] !== ''
                ? $validated[$field]
                : null;
        }

        $admissionDate = CarbonImmutable::parse((string) $validated['admission_date'])->startOfDay();
        $validated['probation_end_date'] = $admissionDate->addDays(45)->toDateString();
        $validated['probation_extension_end_date'] = $admissionDate->addDays(90)->toDateString();
        $validated['vacation_date'] = $admissionDate->addMonthsNoOverflow(22)->toDateString();

        $validated['full_address'] = $this->composeFullAddress($validated);

        return $validated;
    }

    /** @param array<string, mixed> $attributes */
    private function composeFullAddress(array $attributes): ?string
    {
        $street = trim((string) ($attributes['address_street'] ?? ''));
        $number = trim((string) ($attributes['address_number'] ?? ''));
        $neighborhood = trim((string) ($attributes['address_neighborhood'] ?? ''));
        $city = isset($attributes['city_id']) ? BrazilCity::query()->find($attributes['city_id']) : null;
        $state = isset($attributes['state_id']) ? BrazilState::query()->find($attributes['state_id']) : null;

        $parts = array_values(array_filter([
            $street === '' ? null : $street.($number === '' ? '' : ', '.$number),
            $neighborhood === '' ? null : $neighborhood,
            $city?->name,
            $state?->abbreviation,
        ], static fn ($value): bool => $value !== null && $value !== ''));

        return $parts === [] ? null : implode(' - ', $parts);
    }

    /** @return array{path: string, original_name: string, mime_type: ?string, size: ?int} */
    private function storeDocument(
        StoreEmployeeRequest $request,
        Employee $employee,
        string $type,
        string $input
    ): array {
        $file = $request->file($input);
        $filename = sprintf(
            '%s-%s.%s',
            Str::slug(mb_strtolower($type)),
            Str::uuid(),
            strtolower($file->getClientOriginalExtension())
        );
        $path = $file->storeAs("employees/{$employee->id}/documents", $filename, 'local');

        return [
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ];
    }

    /** @return array<string, mixed> */
    private function payload(Employee $employee): array
    {
        $documents = $employee->relationLoaded('documents')
            ? $employee->documents
            : $employee->documents()->get();

        $documentsPayload = $documents->mapWithKeys(function (EmployeeDocument $document) use ($employee): array {
            $routeType = array_search($document->type, self::ROUTE_DOCUMENT_TYPES, true);

            return [
                $this->documentPayloadKey($document->type) => [
                    'name' => $document->original_name,
                    'mime_type' => $document->mime_type,
                    'size' => $document->size,
                    'download_url' => $routeType === false
                        ? null
                        : route('employees.documents.download', [$employee, $routeType]),
                ],
            ];
        })->all();

        return [
            'id' => $employee->id,
            'employee_code' => $employee->employee_code,
            'full_name' => $employee->full_name,
            'cpf' => $employee->cpf,
            'rg' => $employee->rg,
            'birth_date' => $employee->birth_date?->format('Y-m-d'),
            'phone' => $employee->phone,
            'email' => $employee->email,
            'full_address' => $employee->full_address,
            'address_street' => $employee->address_street,
            'address_number' => $employee->address_number,
            'address_neighborhood' => $employee->address_neighborhood,
            'state_id' => $employee->state_id,
            'state' => $employee->state === null ? null : [
                'id' => $employee->state->id,
                'abbreviation' => $employee->state->abbreviation,
                'name' => $employee->state->name,
            ],
            'city_id' => $employee->city_id,
            'city' => $employee->city === null ? null : [
                'id' => $employee->city->id,
                'name' => $employee->city->name,
            ],
            'job_title' => $employee->job_title,
            'admission_date' => $employee->admission_date?->format('Y-m-d'),
            'termination_date' => $employee->termination_date?->format('Y-m-d'),
            'family_contact' => $employee->family_contact,
            'probation_end_date' => $employee->probation_end_date?->format('Y-m-d'),
            'probation_extension_end_date' => $employee->probation_extension_end_date?->format('Y-m-d'),
            'vacation_date' => $employee->vacation_date?->format('Y-m-d'),
            'status' => $employee->status,
            'cnh_number' => $employee->cnh_number,
            'cnh_category' => $employee->cnh_category,
            'cnh_issued_at' => $employee->cnh_issued_at?->format('Y-m-d'),
            'cnh_first_license_date' => $employee->cnh_first_license_date?->format('Y-m-d'),
            'cnh_expiry_date' => $employee->cnh_expiry_date?->format('Y-m-d'),
            'cnh_state' => $employee->cnh_state,
            'cnh_security_code' => $employee->cnh_security_code,
            'aso_expiry_date' => $employee->aso_expiry_date?->format('Y-m-d'),
            'opentech_expiry_date' => $employee->opentech_expiry_date?->format('Y-m-d'),
            'angellira_expiry_date' => $employee->angellira_expiry_date?->format('Y-m-d'),
            'toxicological_expiry_date' => $employee->toxicological_expiry_date?->format('Y-m-d'),
            'trainings' => $employee->trainings,
            'notes' => $employee->notes,
            'documents' => [
                'cnh' => $documentsPayload['cnh'] ?? null,
                'aso' => $documentsPayload['aso'] ?? null,
                'toxicological' => $documentsPayload['toxicological'] ?? null,
                'registration_form' => $documentsPayload['registration_form'] ?? null,
            ],
            'created_at' => $employee->created_at?->toIso8601String(),
            'updated_at' => $employee->updated_at?->toIso8601String(),
        ];
    }

    private function documentPayloadKey(string $type): string
    {
        return match ($type) {
            EmployeeDocument::TYPE_CNH => 'cnh',
            EmployeeDocument::TYPE_ASO => 'aso',
            EmployeeDocument::TYPE_TOXICOLOGICAL => 'toxicological',
            EmployeeDocument::TYPE_REGISTRATION_FORM => 'registration_form',
            default => mb_strtolower($type),
        };
    }
}
