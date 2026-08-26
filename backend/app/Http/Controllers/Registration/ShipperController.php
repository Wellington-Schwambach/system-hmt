<?php

namespace App\Http\Controllers\Registration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Registration\SaveShipperRequest;
use App\Http\Requests\Registration\StoreShipperDocumentRequest;
use App\Http\Requests\Registration\UpdateShipperDocumentRequest;
use App\Models\Shipper;
use App\Models\ShipperDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ShipperController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $status = strtoupper(trim((string) $request->query('status', '')));

        $shippers = Shipper::query()
            ->with(['documents'])
            ->withCount('travels')
            ->when($search !== '', function ($query) use ($search): void {
                $like = '%'.mb_strtolower($search).'%';
                $query->whereRaw('LOWER(name) LIKE ?', [$like]);
            })
            ->when(in_array($status, ['ACTIVE', 'INACTIVE'], true), fn ($query) => $query->where('status', $status))
            ->orderBy('name')
            ->get()
            ->map(fn (Shipper $shipper): array => $this->payload($shipper));

        return response()->json([
            'shippers' => $shippers,
            'total' => $shippers->count(),
        ]);
    }

    public function store(SaveShipperRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $shipper = Shipper::query()->create([
            ...$validated,
            'created_by' => $request->user()?->id,
            'updated_by' => $request->user()?->id,
        ]);
        $shipper->setAttribute('travels_count', 0);
        $shipper->setRelation('documents', collect());

        return response()->json([
            'message' => 'Embarcador cadastrado com sucesso.',
            'shipper' => $this->payload($shipper),
        ], 201);
    }

    public function update(SaveShipperRequest $request, Shipper $shipper): JsonResponse
    {
        $shipper->fill([
            ...$request->validated(),
            'updated_by' => $request->user()?->id,
        ])->save();
        $shipper->load(['documents'])->loadCount('travels');

        return response()->json([
            'message' => 'Embarcador atualizado com sucesso.',
            'shipper' => $this->payload($shipper),
        ]);
    }

    public function destroy(Shipper $shipper): Response|JsonResponse
    {
        if ($shipper->travels()->exists()) {
            return response()->json([
                'message' => 'Este embarcador já possui viagens vinculadas. Inative o cadastro para preservar o histórico.',
                'code' => 'SHIPPER_HAS_TRAVELS',
            ], 409);
        }

        $shipper->load('documents');
        foreach ($shipper->documents as $document) {
            Storage::disk('local')->delete($document->path);
        }

        $shipper->delete();

        return response()->noContent();
    }

    public function storeDocument(
        StoreShipperDocumentRequest $request,
        Shipper $shipper
    ): JsonResponse {
        $file = $request->file('file');
        $extension = strtolower((string) ($file?->getClientOriginalExtension() ?: $file?->extension() ?: 'bin'));
        $filename = Str::uuid()->toString().'.'.$extension;
        $path = $file?->storeAs("shippers/{$shipper->id}/documents", $filename, 'local');

        if (! $file || ! $path) {
            return response()->json([
                'message' => 'Não foi possível armazenar o documento. Tente novamente.',
                'code' => 'SHIPPER_DOCUMENT_STORAGE_FAILED',
            ], 500);
        }

        $position = ((int) $shipper->documents()->max('position')) + 1;
        $document = $shipper->documents()->create([
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
        UpdateShipperDocumentRequest $request,
        Shipper $shipper,
        ShipperDocument $document
    ): JsonResponse {
        $this->ensureDocumentBelongsToShipper($shipper, $document);

        $document->fill([
            'name' => $request->validated('name'),
            'updated_by' => $request->user()?->id,
        ])->save();

        return response()->json([
            'message' => 'Nome do documento atualizado.',
            'document' => $this->documentPayload($document),
        ]);
    }

    public function destroyDocument(Shipper $shipper, ShipperDocument $document): Response
    {
        $this->ensureDocumentBelongsToShipper($shipper, $document);
        Storage::disk('local')->delete($document->path);
        $document->delete();

        return response()->noContent();
    }

    public function downloadDocument(
        Shipper $shipper,
        ShipperDocument $document
    ): StreamedResponse|JsonResponse {
        $this->ensureDocumentBelongsToShipper($shipper, $document);

        if (! Storage::disk('local')->exists($document->path)) {
            return response()->json([
                'message' => 'O arquivo deste documento não foi encontrado no servidor.',
                'code' => 'SHIPPER_DOCUMENT_FILE_MISSING',
            ], 404);
        }

        return Storage::disk('local')->download(
            $document->path,
            $document->original_name,
            ['Content-Type' => $document->mime_type ?: 'application/octet-stream']
        );
    }

    private function ensureDocumentBelongsToShipper(Shipper $shipper, ShipperDocument $document): void
    {
        abort_unless((int) $document->shipper_id === (int) $shipper->id, 404);
    }

    /** @return array<string, mixed> */
    private function payload(Shipper $shipper): array
    {
        if (! $shipper->relationLoaded('documents')) {
            $shipper->load('documents');
        }

        return [
            'id' => $shipper->id,
            'name' => $shipper->name,
            'display_color' => $shipper->display_color,
            'receipt_term_days' => $shipper->receipt_term_days,
            'status' => $shipper->status,
            'travels_count' => (int) ($shipper->travels_count ?? 0),
            'documents' => $shipper->documents->map(fn (ShipperDocument $document): array => $this->documentPayload($document))->values(),
            'created_at' => $shipper->created_at?->toIso8601String(),
            'updated_at' => $shipper->updated_at?->toIso8601String(),
        ];
    }

    /** @return array<string, mixed> */
    private function documentPayload(ShipperDocument $document): array
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
