<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('driver_deductions', function (Blueprint $table): void {
            if (! Schema::hasColumn('driver_deductions', 'fine_infraction_at')) {
                $table->timestamp('fine_infraction_at')->nullable()->after('fine_number');
            }
            if (! Schema::hasColumn('driver_deductions', 'fine_original_amount')) {
                $table->decimal('fine_original_amount', 12, 2)->nullable()->after('fine_infraction_at');
            }
            if (! Schema::hasColumn('driver_deductions', 'fine_charge_amount')) {
                $table->decimal('fine_charge_amount', 12, 2)->nullable()->after('fine_original_amount');
            }
        });

        if (Schema::hasColumn('driver_deductions', 'fine_infraction_at')) {
            DB::table('driver_deductions')
                ->where('category', 'FINE')
                ->whereNull('fine_infraction_at')
                ->update(['fine_infraction_at' => DB::raw('withdrawal_date::timestamp')]);
        }

        if (Schema::hasColumn('driver_deductions', 'fine_charge_amount')) {
            DB::statement(<<<'SQL'
                UPDATE driver_deductions AS deduction
                SET fine_charge_amount = totals.total_amount
                FROM (
                    SELECT installment_group, SUM(amount) AS total_amount
                    FROM driver_deductions
                    WHERE category = 'FINE' AND installment_group IS NOT NULL
                    GROUP BY installment_group
                ) AS totals
                WHERE deduction.category = 'FINE'
                  AND deduction.fine_charge_amount IS NULL
                  AND deduction.installment_group = totals.installment_group
            SQL);

            DB::table('driver_deductions')
                ->where('category', 'FINE')
                ->whereNull('fine_charge_amount')
                ->update(['fine_charge_amount' => DB::raw('amount')]);
        }

        if (Schema::hasColumn('driver_deductions', 'fine_original_amount')) {
            DB::table('driver_deductions')
                ->where('category', 'FINE')
                ->whereNull('fine_original_amount')
                ->update(['fine_original_amount' => DB::raw('COALESCE(fine_charge_amount, amount * COALESCE(installments_total, 1))')]);
        }
    }

    public function down(): void
    {
        Schema::table('driver_deductions', function (Blueprint $table): void {
            $columns = [];
            foreach (['fine_infraction_at', 'fine_original_amount', 'fine_charge_amount'] as $column) {
                if (Schema::hasColumn('driver_deductions', $column)) {
                    $columns[] = $column;
                }
            }
            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
