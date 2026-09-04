<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('travels')) {
            return;
        }

        Schema::table('travels', function (Blueprint $table): void {
            if (! Schema::hasColumn('travels', 'freight_type')) {
                $table->string('freight_type', 30)->nullable();
            }
            if (! Schema::hasColumn('travels', 'cst')) {
                $table->string('cst', 2)->nullable();
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('travels')) {
            return;
        }

        Schema::table('travels', function (Blueprint $table): void {
            if (Schema::hasColumn('travels', 'cst')) {
                $table->dropColumn('cst');
            }
            if (Schema::hasColumn('travels', 'freight_type')) {
                $table->dropColumn('freight_type');
            }
        });
    }
};
