<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('vehicle_sets')) {
            return;
        }

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE vehicle_sets ALTER COLUMN trailer_plate DROP NOT NULL');
            DB::statement('ALTER TABLE vehicle_sets ALTER COLUMN trailer_label DROP NOT NULL');
            if (Schema::hasTable('vehicle_set_events')) {
                DB::statement('ALTER TABLE vehicle_set_events ALTER COLUMN trailer_plate DROP NOT NULL');
            }
            return;
        }

        Schema::table('vehicle_sets', function (Blueprint $table): void {
            $table->string('trailer_plate', 7)->nullable()->change();
            $table->string('trailer_label', 220)->nullable()->change();
        });

        if (Schema::hasTable('vehicle_set_events')) {
            Schema::table('vehicle_set_events', function (Blueprint $table): void {
                $table->string('trailer_plate', 7)->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        // Não restaura NOT NULL para não invalidar conjuntos históricos criados sem carreta.
    }
};
