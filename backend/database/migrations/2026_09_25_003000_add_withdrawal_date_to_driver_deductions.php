<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('driver_deductions', 'withdrawal_date')) {
            Schema::table('driver_deductions', function (Blueprint $table): void {
                $table->date('withdrawal_date')->nullable()->after('entry_date');
            });
        }

        DB::statement(<<<'SQL'
            UPDATE driver_deductions AS current_record
               SET withdrawal_date = COALESCE(
                    (
                        SELECT MIN(group_record.entry_date)
                          FROM driver_deductions AS group_record
                         WHERE group_record.installment_group = current_record.installment_group
                    ),
                    current_record.entry_date
               )
             WHERE current_record.withdrawal_date IS NULL
        SQL);

        Schema::table('driver_deductions', function (Blueprint $table): void {
            $table->index(['employee_id', 'withdrawal_date'], 'driver_deductions_employee_withdrawal_idx');
        });
    }

    public function down(): void
    {
        Schema::table('driver_deductions', function (Blueprint $table): void {
            $table->dropIndex('driver_deductions_employee_withdrawal_idx');
            $table->dropColumn('withdrawal_date');
        });
    }
};
