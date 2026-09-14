<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('fuel_records')) {
            return;
        }

        foreach (['vehicle_km_reference', 'distance_km', 'diesel_average'] as $column) {
            if (! Schema::hasColumn('fuel_records', $column)) {
                return;
            }
        }

        $vehicleIds = DB::table('fuel_records')
            ->whereNull('deleted_at')
            ->whereNotNull('vehicle_id')
            ->distinct()
            ->orderBy('vehicle_id')
            ->pluck('vehicle_id');

        foreach ($vehicleIds as $vehicleId) {
            $records = DB::table('fuel_records')
                ->where('vehicle_id', $vehicleId)
                ->whereNull('deleted_at')
                ->orderBy('fuel_date')
                ->orderBy('id')
                ->get(['id', 'km', 'vehicle_km_reference', 'diesel_liters']);

            if ($records->isEmpty()) {
                continue;
            }

            // Registros retroativos gravados pela regra antiga podem ter recebido como
            // referência o KM atual (mais alto). A menor referência positiva já salva
            // na sequência é a melhor âncora histórica disponível para reconstruí-la.
            $baseline = $records
                ->pluck('vehicle_km_reference')
                ->filter(fn ($value): bool => $value !== null && (int) $value > 0)
                ->map(fn ($value): int => (int) $value)
                ->min();

            $lastValidKm = $baseline !== null ? (int) $baseline : null;

            foreach ($records as $record) {
                $fuelKm = $record->km !== null ? (int) $record->km : null;
                $referenceKm = $lastValidKm;
                $distanceKm = null;
                $average = 0.0;

                if ($fuelKm !== null && $referenceKm !== null && $fuelKm >= $referenceKm) {
                    $distanceKm = $fuelKm - $referenceKm;
                    $liters = (float) $record->diesel_liters;
                    $average = $liters > 0 ? round($distanceKm / $liters, 3) : 0.0;
                }

                DB::table('fuel_records')
                    ->where('id', $record->id)
                    ->update([
                        'vehicle_km_reference' => $referenceKm,
                        'distance_km' => $distanceKm,
                        'diesel_average' => $average,
                    ]);

                // Uma leitura regressiva é mantida no histórico, porém não passa a ser
                // base dos registros seguintes para não propagar uma inconsistência.
                if ($fuelKm !== null && ($lastValidKm === null || $fuelKm >= $lastValidKm)) {
                    $lastValidKm = $fuelKm;
                }
            }
        }
    }

    public function down(): void
    {
        // Recalcular os valores não altera a estrutura do banco. Não há rollback seguro
        // para restaurar médias históricas que estavam incorretas pela regra anterior.
    }
};
