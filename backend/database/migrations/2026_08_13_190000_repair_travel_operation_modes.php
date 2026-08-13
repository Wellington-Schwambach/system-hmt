<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('travels')) {
            return;
        }

        if (DB::getDriverName() === 'pgsql') {
            // Compatibilidade para bases que foram montadas por versões antigas dos SQLs.
            DB::statement('ALTER TABLE travels ALTER COLUMN vehicle_id DROP NOT NULL');
            DB::statement('ALTER TABLE travels ALTER COLUMN driver_one_id DROP NOT NULL');
            DB::statement('ALTER TABLE travels ALTER COLUMN driver_two_id DROP NOT NULL');
            DB::statement('ALTER TABLE travels ALTER COLUMN third_party_name DROP NOT NULL');
            DB::statement('ALTER TABLE travels ALTER COLUMN third_party_plate DROP NOT NULL');
            DB::statement('ALTER TABLE travels ALTER COLUMN third_party_payout_amount SET DEFAULT 0');
            DB::statement('ALTER TABLE travels ALTER COLUMN shipper TYPE VARCHAR(100)');

            // A unicidade oficial agora fica em travel_ctes. A restrição legada na
            // tabela principal pode causar conflito indevido ao salvar/editar viagens.
            DB::statement('ALTER TABLE travels DROP CONSTRAINT IF EXISTS travels_cte_number_cte_series_unique');
            DB::statement('ALTER TABLE travels DROP CONSTRAINT IF EXISTS travels_cte_series_unique');
            DB::statement('CREATE INDEX IF NOT EXISTS travels_cte_number_cte_series_index ON travels (cte_number, cte_series)');
        }

        DB::table('travels')
            ->where('operation_type', 'THIRD_PARTY')
            ->update([
                'vehicle_id' => null,
                'driver_one_id' => null,
                'driver_one_name' => null,
                'driver_two_id' => null,
                'driver_two_name' => null,
            ]);

        DB::table('travels')
            ->where('operation_type', 'FLEET')
            ->update([
                'third_party_name' => null,
                'third_party_plate' => null,
                'third_party_payout_amount' => 0,
            ]);
    }

    public function down(): void
    {
        // Reparo não destrutivo. Não recriamos restrições antigas.
    }
};
