<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('driver_deductions', function (Blueprint $table): void {
            if (! Schema::hasColumn('driver_deductions', 'installment_group')) {
                $table->uuid('installment_group')->nullable()->after('amount');
            }
            if (! Schema::hasColumn('driver_deductions', 'installment_number')) {
                $table->unsignedSmallInteger('installment_number')->default(1)->after('installment_group');
            }
            if (! Schema::hasColumn('driver_deductions', 'installments_total')) {
                $table->unsignedSmallInteger('installments_total')->default(1)->after('installment_number');
            }
            if (! Schema::hasColumn('driver_deductions', 'invoiced')) {
                $table->boolean('invoiced')->default(false)->after('driver_settlement_id');
            }
            if (! Schema::hasColumn('driver_deductions', 'invoiced_at')) {
                $table->timestamp('invoiced_at')->nullable()->after('invoiced');
            }
            if (! Schema::hasColumn('driver_deductions', 'invoiced_by')) {
                $table->foreignId('invoiced_by')->nullable()->after('invoiced_at')->constrained('users')->nullOnDelete();
            }
        });

        Schema::table('driver_deductions', function (Blueprint $table): void {
            $table->index(['employee_id', 'entry_date', 'invoiced'], 'driver_deductions_employee_date_invoice_idx');
            $table->index(['installment_group', 'installment_number'], 'driver_deductions_installment_idx');
        });
    }

    public function down(): void
    {
        Schema::table('driver_deductions', function (Blueprint $table): void {
            $table->dropIndex('driver_deductions_employee_date_invoice_idx');
            $table->dropIndex('driver_deductions_installment_idx');
            $table->dropConstrainedForeignId('invoiced_by');
            $table->dropColumn([
                'installment_group',
                'installment_number',
                'installments_total',
                'invoiced',
                'invoiced_at',
            ]);
        });
    }
};
