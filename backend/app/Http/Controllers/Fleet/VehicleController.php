<?php

namespace App\Http\Controllers\Fleet;

use App\Http\Controllers\Controller;
use App\Http\Requests\Fleet\StoreVehicleRequest;
use App\Http\Requests\Fleet\UpdateVehicleRequest;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class VehicleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));

        $vehicles = Vehicle::query()
            ->when($search !== '', function ($query) use ($search): void {
                $like = '%'.mb_strtolower($search).'%';

                $query->where(function ($query) use ($like): void {
                    $query
                        ->whereRaw('LOWER(plate) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(fleet_number, \'\')) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(brand) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(model) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(renavam, \'\')) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(chassis, \'\')) LIKE ?', [$like]);
                });
            })
            ->when(in_array($status, ['ACTIVE', 'MAINTENANCE', 'INACTIVE'], true), function ($query) use ($status): void {
                $query->where('status', $status);
            })
            ->orderByRaw('fleet_number NULLS LAST')
            ->orderBy('plate')
            ->get()
            ->map(fn (Vehicle $vehicle): array => $this->payload($vehicle));

        return response()->json([
            'vehicles' => $vehicles,
            'total' => $vehicles->count(),
        ]);
    }

    public function store(StoreVehicleRequest $request): JsonResponse
    {
        $storedPath = null;

        try {
            $vehicle = DB::transaction(function () use ($request, &$storedPath): Vehicle {
                $attributes = $this->attributes($request);
                $attributes['created_by'] = $request->user()?->id;
                $attributes['updated_by'] = $request->user()?->id;

                if ($request->hasFile('crlv')) {
                    $fileData = $this->storeCrlv($request);
                    $storedPath = $fileData['crlv_path'];
                    $attributes = array_merge($attributes, $fileData);
                }

                return Vehicle::query()->create($attributes);
            });
        } catch (Throwable $exception) {
            if ($storedPath !== null) {
                Storage::disk('local')->delete($storedPath);
            }

            throw $exception;
        }

        return response()->json([
            'message' => 'Veículo cadastrado com sucesso.',
            'vehicle' => $this->payload($vehicle),
        ], 201);
    }

    public function update(UpdateVehicleRequest $request, Vehicle $vehicle): JsonResponse
    {
        $oldPath = $vehicle->crlv_path;
        $newPath = null;
        $deleteOldAfterSave = false;

        try {
            DB::transaction(function () use (
                $request,
                $vehicle,
                $oldPath,
                &$newPath,
                &$deleteOldAfterSave
            ): void {
                $attributes = $this->attributes($request);
                $attributes['updated_by'] = $request->user()?->id;

                if ($request->boolean('remove_crlv') && ! $request->hasFile('crlv')) {
                    $attributes = array_merge($attributes, $this->emptyCrlvAttributes());
                    $deleteOldAfterSave = filled($oldPath);
                }

                if ($request->hasFile('crlv')) {
                    $fileData = $this->storeCrlv($request);
                    $newPath = $fileData['crlv_path'];
                    $attributes = array_merge($attributes, $fileData);
                    $deleteOldAfterSave = filled($oldPath);
                }

                $vehicle->fill($attributes)->save();
            });
        } catch (Throwable $exception) {
            if ($newPath !== null) {
                Storage::disk('local')->delete($newPath);
            }

            throw $exception;
        }

        if ($deleteOldAfterSave && $oldPath !== null && $oldPath !== $newPath) {
            Storage::disk('local')->delete($oldPath);
        }

        return response()->json([
            'message' => 'Veículo atualizado com sucesso.',
            'vehicle' => $this->payload($vehicle->fresh()),
        ]);
    }

    public function destroy(Vehicle $vehicle): Response
    {
        $path = $vehicle->crlv_path;
        $vehicle->delete();

        if ($path !== null) {
            Storage::disk('local')->delete($path);
        }

        return response()->noContent();
    }

    public function downloadCrlv(Vehicle $vehicle): StreamedResponse|JsonResponse
    {
        if ($vehicle->crlv_path === null || ! Storage::disk('local')->exists($vehicle->crlv_path)) {
            return response()->json([
                'message' => 'O CRLV deste veículo não está disponível.',
            ], 404);
        }

        return Storage::disk('local')->download(
            $vehicle->crlv_path,
            $vehicle->crlv_original_name ?? 'CRLV-'.$vehicle->plate.'.pdf',
            ['Content-Type' => $vehicle->crlv_mime_type ?? 'application/octet-stream']
        );
    }

    /** @return array<string, mixed> */
    private function attributes(StoreVehicleRequest $request): array
    {
        $validated = $request->safe()->except(['crlv', 'remove_crlv']);

        return [
            ...$validated,
            'fleet_number' => $validated['fleet_number'] ?: null,
            'color' => $validated['color'] ?: null,
            'chassis' => $validated['chassis'] ?: null,
            'renavam' => $validated['renavam'] ?: null,
            'load_capacity_kg' => (int) ($validated['load_capacity_kg'] ?? 0),
            'tare_kg' => (int) ($validated['tare_kg'] ?? 0),
            'current_km' => (int) ($validated['current_km'] ?? 0),
            'notes' => $validated['notes'] ?: null,
            'opentech_expiry_date' => $validated['opentech_expiry_date'] ?: null,
            'angellira_expiry_date' => $validated['angellira_expiry_date'] ?: null,
            'licensing_expiry_date' => $validated['licensing_expiry_date'] ?: null,
            'crlv_valid_until' => $validated['crlv_valid_until'] ?: null,
        ];
    }

    /** @return array<string, mixed> */
    private function storeCrlv(StoreVehicleRequest $request): array
    {
        $file = $request->file('crlv');
        $safePlate = Str::slug((string) $request->input('plate'));
        $filename = sprintf(
            '%s-%s.%s',
            $safePlate !== '' ? $safePlate : 'veiculo',
            Str::uuid(),
            strtolower($file->getClientOriginalExtension())
        );
        $path = $file->storeAs('vehicles/crlv', $filename, 'local');

        return [
            'crlv_path' => $path,
            'crlv_original_name' => $file->getClientOriginalName(),
            'crlv_mime_type' => $file->getMimeType(),
            'crlv_size' => $file->getSize(),
            'crlv_valid_until' => $request->input('crlv_valid_until') ?: null,
        ];
    }

    /** @return array<string, null> */
    private function emptyCrlvAttributes(): array
    {
        return [
            'crlv_path' => null,
            'crlv_original_name' => null,
            'crlv_mime_type' => null,
            'crlv_size' => null,
            'crlv_valid_until' => null,
        ];
    }

    /** @return array<string, mixed> */
    private function payload(Vehicle $vehicle): array
    {
        return [
            'id' => $vehicle->id,
            'fleet_number' => $vehicle->fleet_number,
            'plate' => $vehicle->plate,
            'type' => $vehicle->type,
            'brand' => $vehicle->brand,
            'model' => $vehicle->model,
            'manufacture_year' => $vehicle->manufacture_year,
            'model_year' => $vehicle->model_year,
            'color' => $vehicle->color,
            'chassis' => $vehicle->chassis,
            'renavam' => $vehicle->renavam,
            'fuel_type' => $vehicle->fuel_type,
            'load_capacity_kg' => $vehicle->load_capacity_kg,
            'tare_kg' => $vehicle->tare_kg,
            'current_km' => $vehicle->current_km,
            'status' => $vehicle->status,
            'opentech_expiry_date' => $vehicle->opentech_expiry_date?->format('Y-m-d'),
            'angellira_expiry_date' => $vehicle->angellira_expiry_date?->format('Y-m-d'),
            'licensing_expiry_date' => $vehicle->licensing_expiry_date?->format('Y-m-d'),
            'notes' => $vehicle->notes,
            'crlv' => $vehicle->crlv_path === null ? null : [
                'name' => $vehicle->crlv_original_name,
                'mime_type' => $vehicle->crlv_mime_type,
                'size' => $vehicle->crlv_size,
                'valid_until' => $vehicle->crlv_valid_until?->format('Y-m-d'),
                'download_url' => route('vehicles.crlv.download', $vehicle),
            ],
            'created_at' => $vehicle->created_at?->toIso8601String(),
            'updated_at' => $vehicle->updated_at?->toIso8601String(),
        ];
    }
}
