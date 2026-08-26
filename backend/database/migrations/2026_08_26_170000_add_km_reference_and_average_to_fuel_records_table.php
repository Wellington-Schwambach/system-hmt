<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('fuel_records')) {
            return;
        }

        Schema::table('fuel_records', function (Blueprint $table): void {
            if (! Schema::hasColumn('fuel_records', 'vehicle_km_reference')) {
                $table->unsignedBigInteger('vehicle_km_reference')->nullable()->after('km');
            }
            if (! Schema::hasColumn('fuel_records', 'distance_km')) {
                $table->unsignedBigInteger('distance_km')->nullable()->after('vehicle_km_reference');
            }
            if (! Schema::hasColumn('fuel_records', 'diesel_average')) {
                $table->decimal('diesel_average', 10, 3)->nullable()->after('distance_km');
            }
        });

        // Para registros antigos, usa o KM do abastecimento anterior do mesmo veículo
        // como referência. O primeiro registro conhecido permanece sem média.
        $lastKmByVehicle = [];

        DB::table('fuel_records')
            ->whereNull('deleted_at')
            ->orderBy('vehicle_id')
            ->orderBy('fuel_date')
            ->orderBy('id')
            ->get(['id', 'vehicle_id', 'km', 'diesel_liters'])
            ->each(function ($record) use (&$lastKmByVehicle): void {
                if ($record->vehicle_id === null || $record->km === null) {
                    return;
                }

                $vehicleId = (int) $record->vehicle_id;
                $fuelKm = (int) $record->km;
                $referenceKm = $lastKmByVehicle[$vehicleId] ?? null;
                $distanceKm = null;
                $average = null;

                if ($referenceKm !== null && $fuelKm >= $referenceKm) {
                    $distanceKm = $fuelKm - $referenceKm;
                    $liters = (float) $record->diesel_liters;
                    $average = $liters > 0 ? round($distanceKm / $liters, 3) : null;
                }

                DB::table('fuel_records')
                    ->where('id', $record->id)
                    ->update([
                        'vehicle_km_reference' => $referenceKm,
                        'distance_km' => $distanceKm,
                        'diesel_average' => $average,
                    ]);

                if (! isset($lastKmByVehicle[$vehicleId]) || $fuelKm > $lastKmByVehicle[$vehicleId]) {
                    $lastKmByVehicle[$vehicleId] = $fuelKm;
                }
            });
    }

    public function down(): void
    {
        if (! Schema::hasTable('fuel_records')) {
            return;
        }

        Schema::table('fuel_records', function (Blueprint $table): void {
            $columns = [];
            foreach (['vehicle_km_reference', 'distance_km', 'diesel_average'] as $column) {
                if (Schema::hasColumn('fuel_records', $column)) {
                    $columns[] = $column;
                }
            }
            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
