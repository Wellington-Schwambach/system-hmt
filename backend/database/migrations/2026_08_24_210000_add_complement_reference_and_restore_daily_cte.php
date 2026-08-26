<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('travel_ctes') && ! Schema::hasColumn('travel_ctes', 'complemented_cte_number')) {
            Schema::table('travel_ctes', function (Blueprint $table): void {
                $table->string('complemented_cte_number', 30)->nullable()->after('cte_series');
                $table->index('complemented_cte_number');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('travel_ctes') && Schema::hasColumn('travel_ctes', 'complemented_cte_number')) {
            Schema::table('travel_ctes', function (Blueprint $table): void {
                $table->dropIndex(['complemented_cte_number']);
                $table->dropColumn('complemented_cte_number');
            });
        }
    }
};
