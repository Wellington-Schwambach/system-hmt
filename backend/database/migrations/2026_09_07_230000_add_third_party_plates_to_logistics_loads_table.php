<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('logistics_loads')) {
            return;
        }

        Schema::table('logistics_loads', function (Blueprint $table): void {
            if (! Schema::hasColumn('logistics_loads', 'plate_mode')) {
                $table->string('plate_mode', 20)->default('FLEET')->after('driver_two_id');
            }
            if (! Schema::hasColumn('logistics_loads', 'third_party_tractor_plate')) {
                $table->string('third_party_tractor_plate', 40)->nullable()->after('trailer_id');
            }
            if (! Schema::hasColumn('logistics_loads', 'third_party_trailer_plate')) {
                $table->string('third_party_trailer_plate', 40)->nullable()->after('third_party_tractor_plate');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('logistics_loads')) {
            return;
        }

        Schema::table('logistics_loads', function (Blueprint $table): void {
            foreach (['third_party_trailer_plate', 'third_party_tractor_plate', 'plate_mode'] as $column) {
                if (Schema::hasColumn('logistics_loads', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
