<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('vehicles') || ! Schema::hasTable('fuel_records')) {
            return;
        }

        DB::table('fuel_records')
            ->whereNull('deleted_at')
            ->whereNotNull('vehicle_id')
            ->whereNotNull('km')
            ->select('vehicle_id', DB::raw('MAX(km) as highest_km'))
            ->groupBy('vehicle_id')
            ->orderBy('vehicle_id')
            ->get()
            ->each(function ($row): void {
                $vehicle = DB::table('vehicles')->where('id', $row->vehicle_id)->first(['id', 'current_km']);
                if (! $vehicle) {
                    return;
                }

                $highestKm = (int) $row->highest_km;
                $currentKm = (int) ($vehicle->current_km ?? 0);

                if ($highestKm > $currentKm) {
                    DB::table('vehicles')->where('id', $vehicle->id)->update([
                        'current_km' => $highestKm,
                        'updated_at' => now(),
                    ]);
                }
            });
    }

    public function down(): void
    {
        // Não reduz o odômetro, pois KM atual é um dado cumulativo da frota.
    }
};
