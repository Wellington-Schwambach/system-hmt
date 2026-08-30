<?php

namespace App\Http\Controllers;

use App\Models\FuelRecord;
use App\Models\LogisticsLoad;
use App\Models\Travel;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $now = CarbonImmutable::now();
        $monthStart = $now->startOfMonth()->startOfDay();
        $monthEnd = $now->endOfMonth()->endOfDay();

        $travels = Travel::query()
            ->with('ctes:id,travel_id,cte_type')
            ->whereBetween('travel_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
            ->get();

        $fuelings = FuelRecord::query()
            ->whereBetween('fuel_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
            ->count();

        $loads = LogisticsLoad::query()
            ->with([
                'shipper:id,name,display_color',
                'driver:id,full_name',
                'driverTwo:id,full_name',
                'tractor:id,plate',
                'trailer:id,plate',
            ])
            ->whereNotNull('loading_at')
            ->whereBetween('loading_at', [$monthStart, $monthEnd])
            ->orderBy('loading_at')
            ->orderBy('id')
            ->get();

        return response()->json([
            'period' => [
                'year' => $now->year,
                'month' => $now->month,
                'key' => $now->format('Y-m'),
                'start' => $monthStart->toDateString(),
                'end' => $monthEnd->toDateString(),
            ],
            'metrics' => [
                'loads' => $loads->count(),
                'travels' => $travels->filter(fn (Travel $travel): bool => $this->countsAsTrip($travel))->count(),
                'fuelings' => $fuelings,
            ],
            'load_counts' => $loads
                ->groupBy(fn (LogisticsLoad $load): string => $load->loading_at?->format('Y-m-d') ?? '')
                ->filter(fn ($items, string $date): bool => $date !== '')
                ->map(fn ($items): int => $items->count()),
            'loads' => $loads->map(fn (LogisticsLoad $load): array => $this->loadPayload($load))->values(),
        ]);
    }

    private function countsAsTrip(Travel $travel): bool
    {
        if ($travel->relationLoaded('ctes') && $travel->ctes->isNotEmpty()) {
            return $travel->ctes->contains(
                fn ($cte): bool => strtoupper((string) $cte->cte_type) === 'NORMAL'
            );
        }

        return strtoupper((string) $travel->cte_type) === 'NORMAL';
    }

    /** @return array<string, mixed> */
    private function loadPayload(LogisticsLoad $load): array
    {
        return [
            'id' => (int) $load->id,
            'reference_code' => (string) $load->reference_code,
            'loading_at' => $load->loading_at?->toIso8601String(),
            'shipment_number' => $load->shipment_number,
            'load_number' => $load->load_number,
            'shipowner' => $load->shipowner,
            'booking_number' => $load->booking_number,
            'shipper_name' => (string) ($load->shipper?->name ?? 'Sem embarcador'),
            'shipper_color' => (string) ($load->shipper?->display_color ?: '#3FA66C'),
            'origin' => $load->loading_location ?: $load->collection_terminal ?: $load->collection_city,
            'destination' => $load->delivery_location ?: $load->delivery_city,
            'tractor_plate' => $load->tractor?->plate,
            'trailer_plate' => $load->trailer?->plate,
            'driver_name' => $load->driver?->full_name,
            'driver_two_name' => $load->driverTwo?->full_name,
            'completed_at' => $load->completed_at?->toIso8601String(),
        ];
    }
}
