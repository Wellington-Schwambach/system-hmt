<?php

namespace App\Http\Controllers\Registration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Registration\SaveShipperRequest;
use App\Models\Shipper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ShipperController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $status = strtoupper(trim((string) $request->query('status', '')));

        $shippers = Shipper::query()
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
        $shipper->loadCount('travels');

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

        $shipper->delete();

        return response()->noContent();
    }

    /** @return array<string, mixed> */
    private function payload(Shipper $shipper): array
    {
        return [
            'id' => $shipper->id,
            'name' => $shipper->name,
            'display_color' => $shipper->display_color,
            'status' => $shipper->status,
            'travels_count' => (int) ($shipper->travels_count ?? 0),
            'created_at' => $shipper->created_at?->toIso8601String(),
            'updated_at' => $shipper->updated_at?->toIso8601String(),
        ];
    }
}
