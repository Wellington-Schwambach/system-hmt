<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('driver_deductions', function (Blueprint $table): void {
            if (! Schema::hasColumn('driver_deductions', 'fine_observation')) {
                $table->text('fine_observation')->nullable()->after('fine_charge_amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('driver_deductions', function (Blueprint $table): void {
            if (Schema::hasColumn('driver_deductions', 'fine_observation')) {
                $table->dropColumn('fine_observation');
            }
        });
    }
};
