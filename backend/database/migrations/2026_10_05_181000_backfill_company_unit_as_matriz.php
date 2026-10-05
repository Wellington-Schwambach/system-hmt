<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('fuel_records', 'company_unit')) {
            DB::table('fuel_records')
                ->whereNull('company_unit')
                ->orWhere('company_unit', '')
                ->update(['company_unit' => 'MATRIZ']);
        }

        if (Schema::hasColumn('travels', 'company_unit')) {
            DB::table('travels')
                ->whereNull('company_unit')
                ->orWhere('company_unit', '')
                ->update(['company_unit' => 'MATRIZ']);
        }
    }

    public function down(): void
    {
        // Backfill de dados antigos: não há reversão segura sem saber o valor anterior.
    }
};
