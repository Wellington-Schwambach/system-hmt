<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('vehicles', 'tachograph_expiry_date')) {
            Schema::table('vehicles', function (Blueprint $table): void {
                $table->date('tachograph_expiry_date')->nullable();
                $table->index('tachograph_expiry_date');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('vehicles', 'tachograph_expiry_date')) {
            Schema::table('vehicles', function (Blueprint $table): void {
                $table->dropIndex(['tachograph_expiry_date']);
                $table->dropColumn('tachograph_expiry_date');
            });
        }
    }
};
