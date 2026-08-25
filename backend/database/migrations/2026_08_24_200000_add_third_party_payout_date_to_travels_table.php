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

        if (! Schema::hasColumn('travels', 'third_party_payout_date')) {
            Schema::table('travels', function (Blueprint $table): void {
                $table->date('third_party_payout_date')
                    ->nullable()
                    ->after('third_party_payout_amount');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('travels') || ! Schema::hasColumn('travels', 'third_party_payout_date')) {
            return;
        }

        Schema::table('travels', function (Blueprint $table): void {
            $table->dropColumn('third_party_payout_date');
        });
    }
};
