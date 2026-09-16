<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('logistics_loads', function (Blueprint $table): void {
            if (! Schema::hasColumn('logistics_loads', 'destination_notes')) {
                $table->text('destination_notes')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('logistics_loads', function (Blueprint $table): void {
            if (Schema::hasColumn('logistics_loads', 'destination_notes')) {
                $table->dropColumn('destination_notes');
            }
        });
    }
};
