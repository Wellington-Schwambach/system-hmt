<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('logistics_load_status_notes')) {
            return;
        }

        Schema::table('logistics_load_status_notes', function (Blueprint $table): void {
            if (! Schema::hasColumn('logistics_load_status_notes', 'is_visible')) {
                $table->boolean('is_visible')->default(true)->after('observation');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('logistics_load_status_notes') || ! Schema::hasColumn('logistics_load_status_notes', 'is_visible')) {
            return;
        }

        Schema::table('logistics_load_status_notes', function (Blueprint $table): void {
            $table->dropColumn('is_visible');
        });
    }
};
