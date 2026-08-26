<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('fuel_records')) {
            return;
        }

        if (! Schema::hasColumn('fuel_records', 'billing_month')) {
            Schema::table('fuel_records', function (Blueprint $table): void {
                $table->date('billing_month')->nullable()->after('fuel_date');
                $table->index('billing_month');
            });
        }

        DB::table('fuel_records')
            ->whereNull('billing_month')
            ->orderBy('id')
            ->chunkById(200, function ($records): void {
                foreach ($records as $record) {
                    if (empty($record->fuel_date)) {
                        continue;
                    }

                    DB::table('fuel_records')
                        ->where('id', $record->id)
                        ->update([
                            'billing_month' => Carbon::parse($record->fuel_date)
                                ->startOfMonth()
                                ->toDateString(),
                        ]);
                }
            });
    }

    public function down(): void
    {
        if (! Schema::hasTable('fuel_records') || ! Schema::hasColumn('fuel_records', 'billing_month')) {
            return;
        }

        Schema::table('fuel_records', function (Blueprint $table): void {
            $table->dropColumn('billing_month');
        });
    }
};
