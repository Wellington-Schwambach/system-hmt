<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('logistics_loads')) {
            return;
        }

        Schema::table('logistics_loads', function (Blueprint $table): void {
            if (! Schema::hasColumn('logistics_loads', 'cargo_number')) {
                $table->string('cargo_number', 100)->nullable()->after('load_mode');
            }
            if (! Schema::hasColumn('logistics_loads', 'load_entries')) {
                $table->jsonb('load_entries')->nullable()->after('load_status');
            }
        });

        if (Schema::hasColumn('logistics_loads', 'load_entries')) {
            DB::table('logistics_loads')
                ->where('load_mode', 'LOAD')
                ->whereNull('load_entries')
                ->where(function ($query): void {
                    $query->whereNotNull('load_status')->orWhereNotNull('load_number');
                })
                ->orderBy('id')
                ->chunkById(200, function ($loads): void {
                    foreach ($loads as $load) {
                        $status = in_array($load->load_status, ['EMPTY', 'FULL'], true) ? $load->load_status : 'EMPTY';
                        DB::table('logistics_loads')
                            ->where('id', $load->id)
                            ->update([
                                'load_entries' => json_encode([[
                                    'status' => $status,
                                    'number' => $load->load_number,
                                ]], JSON_UNESCAPED_UNICODE),
                            ]);
                    }
                });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('logistics_loads')) {
            return;
        }

        Schema::table('logistics_loads', function (Blueprint $table): void {
            if (Schema::hasColumn('logistics_loads', 'load_entries')) {
                $table->dropColumn('load_entries');
            }
            if (Schema::hasColumn('logistics_loads', 'cargo_number')) {
                $table->dropColumn('cargo_number');
            }
        });
    }
};
