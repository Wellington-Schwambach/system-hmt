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

            $firstRecordWithKm = $records->first(fn ($record): bool => $record->km !== null && (int) $record->km > 0);
            $baseline = null;

            if ($firstRecordWithKm !== null && $firstRecordWithKm->vehicle_km_reference !== null) {
                $candidate = (int) $firstRecordWithKm->vehicle_km_reference;
                $firstKm = (int) $firstRecordWithKm->km;

                // A referência só pode anteceder a sequência se não estiver acima
                // do primeiro KM cronológico. Caso contrário ela veio da regra antiga
                // que usava o KM atual do veículo e deve ser descartada.
                if ($candidate > 0 && $candidate <= $firstKm) {
                    $baseline = $candidate;
                }
            }

            $lastValidKm = $baseline;

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

                if ($fuelKm !== null && ($lastValidKm === null || $fuelKm >= $lastValidKm)) {
                    $lastValidKm = $fuelKm;
                }
            }
        }
    }

    public function down(): void
    {
        // Correção de dados calculados. Não existe rollback seguro para restaurar
        // referências que estavam incorretas pela regra anterior.
    }
};
