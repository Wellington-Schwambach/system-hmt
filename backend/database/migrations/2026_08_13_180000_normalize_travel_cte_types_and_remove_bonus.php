<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('travel_ctes')) {
            DB::table('travel_ctes')->whereNotIn('cte_type', ['NORMAL', 'FREIGHT_COMPLEMENT'])->update(['cte_type' => 'NORMAL']);
            DB::table('travel_ctes')->update([
                'bonus_amount' => 0,
                'gross_freight' => DB::raw('COALESCE(net_freight, 0) + COALESCE(insurance_amount, 0) + COALESCE(toll_amount, 0) + COALESCE(icms_amount, 0)'),
            ]);
        }

        if (Schema::hasTable('travels')) {
            DB::table('travels')->whereNotIn('cte_type', ['NORMAL', 'FREIGHT_COMPLEMENT'])->update(['cte_type' => 'NORMAL']);
            DB::table('travels')->update([
                'bonus_amount' => 0,
                'gross_freight' => DB::raw('COALESCE(net_freight, 0) + COALESCE(insurance_amount, 0) + COALESCE(toll_amount, 0) + COALESCE(icms_amount, 0)'),
            ]);
        }
    }

    public function down(): void
    {
        // Não é possível reconstruir bonificações ou tipos descontinuados com segurança.
    }
};
