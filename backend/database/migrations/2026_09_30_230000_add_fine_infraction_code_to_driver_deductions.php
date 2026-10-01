<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('driver_deductions', function (Blueprint $table): void {
            if (! Schema::hasColumn('driver_deductions', 'fine_infraction_code')) {
                $table->string('fine_infraction_code', 5)->nullable()->after('fine_number');
                $table->index('fine_infraction_code');
            }
        });
    }

    public function down(): void
    {
        Schema::table('driver_deductions', function (Blueprint $table): void {
            if (Schema::hasColumn('driver_deductions', 'fine_infraction_code')) {
                $table->dropIndex(['fine_infraction_code']);
                $table->dropColumn('fine_infraction_code');
            }
        });
    }
};
