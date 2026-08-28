<?php

namespace App\Http\Controllers\Registration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Registration\SaveCompanyProfileRequest;
use App\Http\Requests\Registration\StoreCompanyDocumentRequest;
use App\Http\Requests\Registration\UpdateCompanyDocumentRequest;
use App\Models\CompanyDocument;
use App\Models\CompanyProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CompanyProfileController extends Controller
{
    public function show(): JsonResponse
    {
        $company = CompanyProfile::query()->with('documents')->orderBy('id')->first();

        return response()->json([
            'company' => $company ? $this->payload($company) : null,
        ]);
    }

    public function save(SaveCompanyProfileRequest $request): JsonResponse
    {
        $company = CompanyProfile::query()->orderBy('id')->first();
        $validated = $request->validated();

        if ($company === null) {
            $company = CompanyProfile::query()->create([
                ...$validated,
                'created_by' => $request->user()?->id,
                'updated_by' => $request->user()?->id,
            ]);
            $message = 'Dados da empresa cadastrados com sucesso.';
        } else {
            $company->fill([
                ...$validated,
                'updated_by' => $request->user()?->id,
            ])->save();
            $message = 'Dados da empresa atualizados com sucesso.';
        }

        $company->load('documents');

        return response()->json([
            'message' => $message,
            'company' => $this->payload($company),
        ]);
    }

    public function storeDocument(
        StoreCompanyDocumentRequest $request,
        CompanyProfile $companyProfile
    ): JsonResponse {
        $this->ensureMainProfile($companyProfile);

        $file = $request->file('file');
        $extension = strtolower((string) ($file?->getClientOriginalExtension() ?: $file?->extension() ?: 'bin'));
        $filename = Str::uuid()->toString().'.'.$extension;
        $path = $file?->storeAs("company/{$companyProfile->id}/documents", $filename, 'local');

        if (! $file || ! $path) {
            return response()->json([
                'message' => 'Não foi possível armazenar o documento. Tente novamente.',
                'code' => 'COMPANY_DOCUMENT_STORAGE_FAILED',
            ], 500);
        }

        $position = ((int) $companyProfile->documents()->max('position')) + 1;
        $document = $companyProfile->documents()->create([
            'name' => $request->validated('name'),
            'original_name' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getMimeType(),
            'size_bytes' => (int) $file->getSize(),
            'position' => $position,
            'created_by' => $request->user()?->id,
            'updated_by' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Documento anexado com sucesso.',
            'document' => $this->documentPayload($document),
        ], 201);
    }

    public function updateDocument(
        UpdateCompanyDocumentRequest $request,
        CompanyProfile $companyProfile,
        CompanyDocument $document
    ): JsonResponse {
        $this->ensureDocumentBelongsToCompany($companyProfile, $document);

        $document->fill([
            'name' => $request->validated('name'),
            'updated_by' => $request->user()?->id,
        ])->save();

        return response()->json([
            'message' => 'Nome do documento atualizado.',
            'document' => $this->documentPayload($document),
        ]);
    }

    public function destroyDocument(
        CompanyProfile $companyProfile,
        CompanyDocument $document
    ): Response {
        $this->ensureDocumentBelongsToCompany($companyProfile, $document);
        Storage::disk('local')->delete($document->path);
        $document->delete();

        return response()->noContent();
    }

    public function downloadDocument(
        CompanyProfile $companyProfile,
        CompanyDocument $document
    ): StreamedResponse|JsonResponse {
        $this->ensureDocumentBelongsToCompany($companyProfile, $document);

        if (! Storage::disk('local')->exists($document->path)) {
            return response()->json([
                'message' => 'O arquivo deste documento não foi encontrado no servidor.',
                'code' => 'COMPANY_DOCUMENT_FILE_MISSING',
            ], 404);
        }

        return Storage::disk('local')->download(
            $document->path,
            $document->original_name,
            ['Content-Type' => $document->mime_type ?: 'application/octet-stream']
        );
    }

    private function ensureMainProfile(CompanyProfile $companyProfile): void
    {
        $firstId = CompanyProfile::query()->min('id');
        abort_unless($firstId !== null && (int) $firstId === (int) $companyProfile->id, 404);
    }

    private function ensureDocumentBelongsToCompany(CompanyProfile $companyProfile, CompanyDocument $document): void
    {
        $this->ensureMainProfile($companyProfile);
        abort_unless((int) $document->company_profile_id === (int) $companyProfile->id, 404);
    }

    /** @return array<string, mixed> */
    private function payload(CompanyProfile $company): array
    {
        if (! $company->relationLoaded('documents')) {
            $company->load('documents');
        }

        return [
            'id' => $company->id,
            'legal_name' => $company->legal_name,
            'trade_name' => $company->trade_name,
            'cnpj' => $company->cnpj,
            'state_registration' => $company->state_registration,
            'municipal_registration' => $company->municipal_registration,
            'rntrc' => $company->rntrc,
            'opening_date' => $company->opening_date?->format('Y-m-d'),
            'tax_regime' => $company->tax_regime,
            'email' => $company->email,
            'email_secondary' => $company->email_secondary,
            'phone' => $company->phone,
            'whatsapp' => $company->whatsapp,
            'postal_code' => $company->postal_code,
            'street' => $company->street,
            'number' => $company->number,
            'complement' => $company->complement,
            'neighborhood' => $company->neighborhood,
            'city' => $company->city,
            'state' => $company->state,
            'responsible_name' => $company->responsible_name,
            'responsible_cpf' => $company->responsible_cpf,
            'responsible_phone' => $company->responsible_phone,
            'responsible_email' => $company->responsible_email,
            'responsible_two_name' => $company->responsible_two_name,
            'responsible_two_cpf' => $company->responsible_two_cpf,
            'responsible_two_phone' => $company->responsible_two_phone,
            'responsible_two_email' => $company->responsible_two_email,
            'notes' => $company->notes,
            'documents' => $company->documents->map(fn (CompanyDocument $document): array => $this->documentPayload($document))->values(),
            'created_at' => $company->created_at?->toIso8601String(),
            'updated_at' => $company->updated_at?->toIso8601String(),
        ];
    }

    /** @return array<string, mixed> */
    private function documentPayload(CompanyDocument $document): array
    {
        return [
            'id' => $document->id,
            'name' => $document->name,
            'original_name' => $document->original_name,
            'mime_type' => $document->mime_type,
            'size_bytes' => (int) $document->size_bytes,
            'position' => (int) $document->position,
            'created_at' => $document->created_at?->toIso8601String(),
            'updated_at' => $document->updated_at?->toIso8601String(),
        ];
    }
}
