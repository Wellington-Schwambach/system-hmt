<?php

namespace App\Http\Controllers\Operation;

use App\Http\Controllers\Controller;
use App\Models\FuelRecord;
use App\Models\Travel;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class OperationalBIController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'month' => ['nullable', 'integer', 'min:0', 'max:12'],
        ]);

        $availableYears = $this->availableYears();
        $latestDate = $this->latestOperationalDate();
        $defaultYear = $latestDate?->year ?? CarbonImmutable::now()->year;
        $defaultMonth = $latestDate?->month ?? CarbonImmutable::now()->month;

        $year = (int) ($validated['year'] ?? $defaultYear);
        $month = array_key_exists('month', $validated)
            ? (int) $validated['month']
            : $defaultMonth;

        if (! in_array($year, $availableYears, true)) {
            $availableYears[] = $year;
            rsort($availableYears, SORT_NUMERIC);
        }

        [$periodStart, $periodEnd] = $this->periodBounds($year, $month);
        [$previousStart, $previousEnd] = $this->previousPeriodBounds($year, $month);
        $yearStart = CarbonImmutable::create($year, 1, 1)->startOfDay();
        $yearEnd = CarbonImmutable::create($year, 12, 31)->endOfDay();

        $travelWindowStart = collect([$periodStart, $previousStart, $yearStart])
            ->sortBy(fn (CarbonImmutable $date): int => $date->timestamp)
            ->first();
        $travelWindowEnd = collect([$periodEnd, $previousEnd, $yearEnd])
            ->sortByDesc(fn (CarbonImmutable $date): int => $date->timestamp)
            ->first();

        $travels = Travel::query()
            ->with(['ctes:id,travel_id,cte_type,cte_number', 'shipperRelation:id,name'])
            ->whereBetween('travel_date', [$travelWindowStart->toDateString(), $travelWindowEnd->toDateString()])
            ->orderBy('travel_date')
            ->orderBy('id')
            ->get();

        $fuelRecords = FuelRecord::query()
            ->whereBetween('fuel_date', [$travelWindowStart->toDateString(), $travelWindowEnd->toDateString()])
            ->orderBy('fuel_date')
            ->orderBy('id')
            ->get();

        $currentTravels = $this->filterByDate($travels, 'travel_date', $periodStart, $periodEnd);
        $currentFuel = $this->filterByDate($fuelRecords, 'fuel_date', $periodStart, $periodEnd);
        $previousTravels = $this->filterByDate($travels, 'travel_date', $previousStart, $previousEnd);
        $previousFuel = $this->filterByDate($fuelRecords, 'fuel_date', $previousStart, $previousEnd);

        $metrics = $this->metrics($currentTravels, $currentFuel);
        $previousMetrics = $this->metrics($previousTravels, $previousFuel);

        $yearTravels = $this->filterByDate($travels, 'travel_date', $yearStart, $yearEnd);
        $yearFuel = $this->filterByDate($fuelRecords, 'fuel_date', $yearStart, $yearEnd);

        return response()->json([
            'period' => ['year' => $year, 'month' => $month],
            'available_years' => $availableYears,
            'metrics' => $metrics,
            'comparisons' => [
                'fuel_investment' => $this->percentageDelta($metrics['fuel_investment'], $previousMetrics['fuel_investment']),
                'trips' => $this->percentageDelta($metrics['trips'], $previousMetrics['trips']),
                'net_freight' => $this->percentageDelta($metrics['net_freight'], $previousMetrics['net_freight']),
                'operational_result' => $this->percentageDelta($metrics['operational_result'], $previousMetrics['operational_result']),
            ],
            'monthly_performance' => $this->monthlyPerformance($yearTravels, $yearFuel, $year),
            'vehicle_performance' => $this->vehiclePerformance($currentTravels, $currentFuel),
            'shipper_performance' => $this->shipperPerformance($currentTravels),
            'recent_activities' => $this->recentActivities($currentTravels, $currentFuel),
        ]);
    }

    /** @return array<int> */
    private function availableYears(): array
    {
        $years = collect();

        Travel::query()->whereNotNull('travel_date')->pluck('travel_date')->each(function ($date) use ($years): void {
            $years->push(CarbonImmutable::parse($date)->year);
        });

        FuelRecord::query()->whereNotNull('fuel_date')->pluck('fuel_date')->each(function ($date) use ($years): void {
            $years->push(CarbonImmutable::parse($date)->year);
        });

        $years->push(CarbonImmutable::now()->year);

        return $years->filter()->unique()->sortDesc()->values()->all();
    }

    private function latestOperationalDate(): ?CarbonImmutable
    {
        $travelDate = Travel::query()->max('travel_date');
        $fuelDate = FuelRecord::query()->max('fuel_date');

        $dates = collect([$travelDate, $fuelDate])->filter()->map(fn ($date) => CarbonImmutable::parse($date));

        return $dates->sortByDesc(fn (CarbonImmutable $date) => $date->timestamp)->first();
    }

    /** @return array{0: CarbonImmutable, 1: CarbonImmutable} */
    private function periodBounds(int $year, int $month): array
    {
        if ($month === 0) {
            return [
                CarbonImmutable::create($year, 1, 1)->startOfDay(),
                CarbonImmutable::create($year, 12, 31)->endOfDay(),
            ];
        }

        $start = CarbonImmutable::create($year, $month, 1)->startOfMonth()->startOfDay();
        return [$start, $start->endOfMonth()->endOfDay()];
    }

    /** @return array{0: CarbonImmutable, 1: CarbonImmutable} */
    private function previousPeriodBounds(int $year, int $month): array
    {
        if ($month === 0) {
            return $this->periodBounds($year - 1, 0);
        }

        $previous = CarbonImmutable::create($year, $month, 1)->subMonthNoOverflow();
        return $this->periodBounds($previous->year, $previous->month);
    }

    private function filterByDate(Collection $records, string $field, CarbonImmutable $start, CarbonImmutable $end): Collection
    {
        $startDate = $start->toDateString();
        $endDate = $end->toDateString();

        return $records->filter(function ($record) use ($field, $startDate, $endDate): bool {
            $value = $record->{$field};
            if ($value === null) {
                return false;
            }

            $date = $value instanceof \DateTimeInterface ? $value->format('Y-m-d') : CarbonImmutable::parse($value)->toDateString();
            return $date >= $startDate && $date <= $endDate;
        })->values();
    }

    /** @return array<string, float|int> */
    private function metrics(Collection $travels, Collection $fuelRecords): array
    {
        $fuelInvestment = $fuelRecords->sum(fn (FuelRecord $record): float => (float) $record->diesel_total_value + (float) $record->arla_total_value);
        $dieselLiters = $fuelRecords->sum(fn (FuelRecord $record): float => (float) $record->diesel_liters);
        $arlaLiters = $fuelRecords->sum(fn (FuelRecord $record): float => (float) $record->arla_liters);
        $grossFreight = $travels->sum(fn (Travel $travel): float => (float) $travel->gross_freight);
        $netFreight = $travels->sum(fn (Travel $travel): float => (float) $travel->net_freight);
        $trips = $travels->filter(fn (Travel $travel): bool => $this->countsAsTrip($travel))->count();
        $freightDifference = $grossFreight - $netFreight;

        return [
            'fuel_investment' => round($fuelInvestment, 2),
            'diesel_liters' => round($dieselLiters, 3),
            'arla_liters' => round($arlaLiters, 3),
            'fuelings' => $fuelRecords->count(),
            'trips' => $trips,
            'gross_freight' => round($grossFreight, 2),
            'net_freight' => round($netFreight, 2),
            'freight_difference' => round($freightDifference, 2),
            'operational_result' => round($netFreight - $fuelInvestment, 2),
            'average_freight' => $trips > 0 ? round($netFreight / $trips, 2) : 0.0,
            'average_fuel_ticket' => $fuelRecords->count() > 0 ? round($fuelInvestment / $fuelRecords->count(), 2) : 0.0,
        ];
    }

    private function countsAsTrip(Travel $travel): bool
    {
        if ($travel->relationLoaded('ctes') && $travel->ctes->isNotEmpty()) {
            return $travel->ctes->contains(fn ($cte): bool => strtoupper((string) $cte->cte_type) === 'NORMAL');
        }

        return strtoupper((string) $travel->cte_type) === 'NORMAL';
    }

    private function percentageDelta(float|int $current, float|int $previous): ?float
    {
        $currentValue = (float) $current;
        $previousValue = (float) $previous;

        if (abs($previousValue) < 0.000001) {
            return abs($currentValue) < 0.000001 ? 0.0 : null;
        }

        return round((($currentValue - $previousValue) / abs($previousValue)) * 100, 2);
    }

    /** @return array<int, array<string, float|int>> */
    private function monthlyPerformance(Collection $travels, Collection $fuelRecords, int $year): array
    {
        return collect(range(1, 12))->map(function (int $month) use ($travels, $fuelRecords, $year): array {
            [$start, $end] = $this->periodBounds($year, $month);
            $metrics = $this->metrics(
                $this->filterByDate($travels, 'travel_date', $start, $end),
                $this->filterByDate($fuelRecords, 'fuel_date', $start, $end),
            );

            return [
                'month' => $month,
                'trips' => $metrics['trips'],
                'net_freight' => $metrics['net_freight'],
                'fuel_investment' => $metrics['fuel_investment'],
                'operational_result' => $metrics['operational_result'],
            ];
        })->all();
    }

    /** @return array<int, array<string, float|int>> */
    private function vehiclePerformance(Collection $travels, Collection $fuelRecords): array
    {
        $vehicles = collect();

        foreach ($travels as $travel) {
            $plate = trim((string) ($travel->plate_snapshot ?: $travel->third_party_plate ?: 'Sem placa'));
            $plate = $plate !== '' ? mb_strtoupper($plate) : 'SEM PLACA';
            $current = $vehicles->get($plate, [
                'plate' => $plate,
                'trips' => 0,
                'net_freight' => 0.0,
                'fuel_investment' => 0.0,
                'diesel_liters' => 0.0,
            ]);

            if ($this->countsAsTrip($travel)) {
                $current['trips']++;
            }
            $current['net_freight'] += (float) $travel->net_freight;
            $vehicles->put($plate, $current);
        }

        foreach ($fuelRecords as $record) {
            $plate = trim((string) ($record->plate ?: 'Sem placa'));
            $plate = $plate !== '' ? mb_strtoupper($plate) : 'SEM PLACA';
            $current = $vehicles->get($plate, [
                'plate' => $plate,
                'trips' => 0,
                'net_freight' => 0.0,
                'fuel_investment' => 0.0,
                'diesel_liters' => 0.0,
            ]);

            $current['fuel_investment'] += (float) $record->diesel_total_value + (float) $record->arla_total_value;
            $current['diesel_liters'] += (float) $record->diesel_liters;
            $vehicles->put($plate, $current);
        }

        return $vehicles->map(function (array $vehicle): array {
            $vehicle['net_freight'] = round($vehicle['net_freight'], 2);
            $vehicle['fuel_investment'] = round($vehicle['fuel_investment'], 2);
            $vehicle['diesel_liters'] = round($vehicle['diesel_liters'], 3);
            $vehicle['operational_result'] = round($vehicle['net_freight'] - $vehicle['fuel_investment'], 2);
            return $vehicle;
        })->sortByDesc('operational_result')->values()->all();
    }

    /** @return array<int, array<string, float|int|string>> */
    private function shipperPerformance(Collection $travels): array
    {
        $totalNetFreight = $travels->sum(fn (Travel $travel): float => (float) $travel->net_freight);
        $shippers = collect();

        foreach ($travels as $travel) {
            $name = trim((string) ($travel->shipperRelation?->name ?: $travel->shipper ?: 'Sem embarcador'));
            $key = mb_strtolower($name);
            $current = $shippers->get($key, [
                'shipper' => $name,
                'label' => $name,
                'trips' => 0,
                'net_freight' => 0.0,
            ]);

            if ($this->countsAsTrip($travel)) {
                $current['trips']++;
            }
            $current['net_freight'] += (float) $travel->net_freight;
            $shippers->put($key, $current);
        }

        return $shippers->map(function (array $item) use ($totalNetFreight): array {
            $item['net_freight'] = round($item['net_freight'], 2);
            $item['share'] = $totalNetFreight > 0 ? round(($item['net_freight'] / $totalNetFreight) * 100, 3) : 0.0;
            return $item;
        })->sortByDesc('net_freight')->values()->all();
    }

    /** @return array<int, array<string, float|int|string>> */
    private function recentActivities(Collection $travels, Collection $fuelRecords): array
    {
        $travelActivities = $travels->map(function (Travel $travel): array {
            $cteNumbers = $travel->relationLoaded('ctes')
                ? $travel->ctes->pluck('cte_number')->filter()->unique()->implode(' / ')
                : '';
            if ($cteNumbers === '') {
                $cteNumbers = (string) $travel->cte_number;
            }

            $drivers = collect([$travel->driver_one_name, $travel->driver_two_name])->filter()->implode(' / ');
            if ($drivers === '') {
                $drivers = trim((string) $travel->third_party_name) ?: 'Motorista não informado';
            }

            $plate = trim((string) ($travel->plate_snapshot ?: $travel->third_party_plate ?: 'Sem placa'));

            return [
                'id' => 'travel-'.$travel->id,
                'type' => 'TRAVEL',
                'date' => $travel->travel_date?->format('Y-m-d') ?? '',
                'sort_at' => ($travel->travel_date?->format('Y-m-d') ?? '').' '.($travel->created_at?->format('H:i:s') ?? '00:00:00'),
                'title' => trim((string) $travel->origin).' → '.trim((string) $travel->destination),
                'description' => 'CT-e '.($cteNumbers ?: '-').' • '.$drivers,
                'value' => round((float) $travel->net_freight, 2),
                'plate' => $plate ?: 'Sem placa',
            ];
        });

        $fuelActivities = $fuelRecords->map(function (FuelRecord $record): array {
            return [
                'id' => 'fuel-'.$record->id,
                'type' => 'FUEL',
                'date' => $record->fuel_date?->format('Y-m-d') ?? '',
                'sort_at' => ($record->fuel_date?->format('Y-m-d') ?? '').' '.($record->created_at?->format('H:i:s') ?? '00:00:00'),
                'title' => 'Abastecimento em '.trim((string) $record->station),
                'description' => number_format((float) $record->diesel_liters, 2, ',', '.').' L de diesel • '.((string) $record->driver_name ?: 'Motorista não informado'),
                'value' => round((float) $record->diesel_total_value + (float) $record->arla_total_value, 2),
                'plate' => (string) ($record->plate ?: 'Sem placa'),
            ];
        });

        return $travelActivities
            ->concat($fuelActivities)
            ->sortByDesc('sort_at')
            ->values()
            ->map(function (array $item): array {
                unset($item['sort_at']);
                return $item;
            })
            ->all();
    }
}
