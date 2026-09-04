<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('vehicle_sets')) {
            Schema::table('vehicle_sets', function (Blueprint $table): void {
                if (! Schema::hasColumn('vehicle_sets', 'trailer_two_id')) {
                    $table->foreignId('trailer_two_id')->nullable()->after('trailer_id')->constrained('vehicles')->nullOnDelete();
                }
                if (! Schema::hasColumn('vehicle_sets', 'trailer_two_plate')) {
                    $table->string('trailer_two_plate', 10)->nullable()->after('trailer_label');
                }
                if (! Schema::hasColumn('vehicle_sets', 'trailer_two_label')) {
                    $table->string('trailer_two_label', 220)->nullable()->after('trailer_two_plate');
                }
            });

            if (DB::getDriverName() === 'pgsql') {
                DB::statement("CREATE UNIQUE INDEX IF NOT EXISTS vehicle_sets_active_trailer_two_unique ON vehicle_sets (trailer_two_id) WHERE status = 'ACTIVE' AND trailer_two_id IS NOT NULL");
                DB::statement("ALTER TABLE vehicle_sets DROP CONSTRAINT IF EXISTS vehicle_sets_distinct_trailers_check");
                DB::statement("ALTER TABLE vehicle_sets ADD CONSTRAINT vehicle_sets_distinct_trailers_check CHECK (trailer_two_id IS NULL OR trailer_id IS NULL OR trailer_two_id <> trailer_id)");
            }
        }

        if (Schema::hasTable('vehicle_set_events')) {
            Schema::table('vehicle_set_events', function (Blueprint $table): void {
                if (! Schema::hasColumn('vehicle_set_events', 'trailer_two_id')) {
                    $table->foreignId('trailer_two_id')->nullable()->after('trailer_id')->constrained('vehicles')->nullOnDelete();
                }
                if (! Schema::hasColumn('vehicle_set_events', 'trailer_two_plate')) {
                    $table->string('trailer_two_plate', 10)->nullable()->after('trailer_plate');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('vehicle_set_events')) {
            Schema::table('vehicle_set_events', function (Blueprint $table): void {
                if (Schema::hasColumn('vehicle_set_events', 'trailer_two_id')) {
                    $table->dropConstrainedForeignId('trailer_two_id');
                }
                if (Schema::hasColumn('vehicle_set_events', 'trailer_two_plate')) {
                    $table->dropColumn('trailer_two_plate');
                }
            });
        }

        if (Schema::hasTable('vehicle_sets')) {
            if (DB::getDriverName() === 'pgsql') {
                DB::statement('DROP INDEX IF EXISTS vehicle_sets_active_trailer_two_unique');
                DB::statement('ALTER TABLE vehicle_sets DROP CONSTRAINT IF EXISTS vehicle_sets_distinct_trailers_check');
            }

            Schema::table('vehicle_sets', function (Blueprint $table): void {
                if (Schema::hasColumn('vehicle_sets', 'trailer_two_id')) {
                    $table->dropConstrainedForeignId('trailer_two_id');
                }
                foreach (['trailer_two_plate', 'trailer_two_label'] as $column) {
                    if (Schema::hasColumn('vehicle_sets', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
