<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('driver_deductions', function (Blueprint $table): void {
            if (! Schema::hasColumn('driver_deductions', 'fine_plate')) {
                $table->string('fine_plate', 20)->nullable()->after('description');
            }
            if (! Schema::hasColumn('driver_deductions', 'fine_location')) {
                $table->string('fine_location', 255)->nullable()->after('fine_plate');
            }
            if (! Schema::hasColumn('driver_deductions', 'fine_number')) {
                $table->string('fine_number', 100)->nullable()->after('fine_location');
            }
        });
    }

    public function down(): void
    {
        Schema::table('driver_deductions', function (Blueprint $table): void {
            $columns = [];
            foreach (['fine_plate', 'fine_location', 'fine_number'] as $column) {
                if (Schema::hasColumn('driver_deductions', $column)) {
                    $columns[] = $column;
                }
            }
            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
