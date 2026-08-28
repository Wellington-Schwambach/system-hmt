<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('logistics_loads', function (Blueprint $table): void {
            $table->index(
                ['loading_at', 'shipper_id', 'completed_at'],
                'logistics_loads_calendar_loading_shipper_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::table('logistics_loads', function (Blueprint $table): void {
            $table->dropIndex('logistics_loads_calendar_loading_shipper_idx');
        });
    }
};
