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
            if (! Schema::hasColumn('logistics_loads', 'third_party_driver_name')) {
                $table->string('third_party_driver_name', 160)->nullable()->after('third_party_trailer_plate');
            }
            if (! Schema::hasColumn('logistics_loads', 'third_party_driver_two_name')) {
                $table->string('third_party_driver_two_name', 160)->nullable()->after('third_party_driver_name');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('logistics_loads')) {
            return;
        }

        Schema::table('logistics_loads', function (Blueprint $table): void {
            foreach (['third_party_driver_two_name', 'third_party_driver_name'] as $column) {
                if (Schema::hasColumn('logistics_loads', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
