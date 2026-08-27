<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('logistics_loads', function (Blueprint $table): void {
            $table->string('shipment_number', 100)->nullable();
            $table->string('load_number', 100)->nullable();
            $table->string('shipowner', 140)->nullable();
            $table->string('booking_number', 100)->nullable();
            $table->string('collection_terminal', 180)->nullable();
            $table->timestamp('collection_at')->nullable();
            $table->string('loading_location', 180)->nullable();
            $table->timestamp('loading_at')->nullable();
            $table->string('delivery_location', 180)->nullable();
            $table->timestamp('delivery_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('completed_by')->nullable()->constrained('users')->nullOnDelete();

            $table->index('collection_at');
            $table->index('loading_at');
            $table->index('delivery_at');
            $table->index('completed_at');
            $table->index(['completed_at', 'stage', 'position'], 'logistics_loads_status_stage_position_idx');
        });

        // Preserva os locais que já haviam sido cadastrados na primeira versão da tela.
        DB::table('logistics_loads')->whereNotNull('collection_city')->update([
            'collection_terminal' => DB::raw('COALESCE(collection_terminal, collection_city)'),
        ]);
        DB::table('logistics_loads')->whereNotNull('loading_city')->update([
            'loading_location' => DB::raw('COALESCE(loading_location, loading_city)'),
        ]);
        DB::table('logistics_loads')->whereNotNull('delivery_city')->update([
            'delivery_location' => DB::raw('COALESCE(delivery_location, delivery_city)'),
        ]);
    }

    public function down(): void
    {
        Schema::table('logistics_loads', function (Blueprint $table): void {
            $table->dropForeign(['completed_by']);
            $table->dropIndex('logistics_loads_status_stage_position_idx');
            $table->dropIndex(['collection_at']);
            $table->dropIndex(['loading_at']);
            $table->dropIndex(['delivery_at']);
            $table->dropIndex(['completed_at']);
            $table->dropColumn([
                'shipment_number',
                'load_number',
                'shipowner',
                'booking_number',
                'collection_terminal',
                'collection_at',
                'loading_location',
                'loading_at',
                'delivery_location',
                'delivery_at',
                'completed_at',
                'completed_by',
            ]);
        });
    }
};
