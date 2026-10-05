<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('driver_deductions', function (Blueprint $table): void {
            if (! Schema::hasColumn('driver_deductions', 'advance_location')) {
                $table->string('advance_location', 255)->nullable()->after('withdrawal_date');
            }
            if (! Schema::hasColumn('driver_deductions', 'boleto_due_date')) {
                $table->date('boleto_due_date')->nullable()->after('advance_location');
            }
            if (! Schema::hasColumn('driver_deductions', 'weekly_authorized_by')) {
                $table->string('weekly_authorized_by', 30)->nullable()->after('boleto_due_date');
            }
            if (! Schema::hasColumn('driver_deductions', 'weekly_authorized_at')) {
                $table->timestamp('weekly_authorized_at')->nullable()->after('weekly_authorized_by');
            }
        });

        Schema::table('fuel_records', function (Blueprint $table): void {
            if (! Schema::hasColumn('fuel_records', 'company_unit')) {
                $table->string('company_unit', 10)->default('MATRIZ')->after('driver_id');
            }
        });

        Schema::table('travels', function (Blueprint $table): void {
            if (! Schema::hasColumn('travels', 'company_unit')) {
                $table->string('company_unit', 10)->default('MATRIZ')->after('operation_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('driver_deductions', function (Blueprint $table): void {
            foreach (['weekly_authorized_at', 'weekly_authorized_by', 'boleto_due_date', 'advance_location'] as $column) {
                if (Schema::hasColumn('driver_deductions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('fuel_records', function (Blueprint $table): void {
            if (Schema::hasColumn('fuel_records', 'company_unit')) {
                $table->dropColumn('company_unit');
            }
        });

        Schema::table('travels', function (Blueprint $table): void {
            if (Schema::hasColumn('travels', 'company_unit')) {
                $table->dropColumn('company_unit');
            }
        });
    }
};
