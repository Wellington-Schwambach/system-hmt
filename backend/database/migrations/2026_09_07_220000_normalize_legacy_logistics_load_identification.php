<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('logistics_loads')
            || ! Schema::hasColumn('logistics_loads', 'load_mode')
            || ! Schema::hasColumn('logistics_loads', 'load_status')
            || ! Schema::hasColumn('logistics_loads', 'load_number')
            || ! Schema::hasColumn('logistics_loads', 'load_entries')) {
            return;
        }

        // Registros antigos já possuíam load_number/load_status, mas foram criados
        // antes da existência de load_mode. Nesses casos a identificação é LOAD.
        DB::table('logistics_loads')
            ->whereNull('load_mode')
            ->where(function ($query): void {
                $query->whereNotNull('load_number')->orWhereNotNull('load_status');
            })
            ->update(['load_mode' => 'LOAD']);

        DB::table('logistics_loads')
            ->where('load_mode', 'LOAD')
            ->whereNull('load_entries')
            ->where(function ($query): void {
                $query->whereNotNull('load_number')->orWhereNotNull('load_status');
            })
            ->orderBy('id')
            ->chunkById(200, function ($loads): void {
                foreach ($loads as $load) {
                    $status = in_array($load->load_status, ['EMPTY', 'FULL'], true)
                        ? $load->load_status
                        : 'EMPTY';

                    DB::table('logistics_loads')
                        ->where('id', $load->id)
                        ->update([
                            'load_status' => $status,
                            'load_entries' => json_encode([[
                                'status' => $status,
                                'number' => $load->load_number,
                            ]], JSON_UNESCAPED_UNICODE),
                        ]);
                }
            });
    }

    public function down(): void
    {
        // Migração de normalização de dados. Não desfazemos para evitar apagar
        // a classificação recuperada dos registros legados.
    }
};
