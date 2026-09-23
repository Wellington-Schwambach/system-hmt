<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('driver_deductions')) {
            Schema::create('driver_deductions', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('employee_id')->constrained('employees')->restrictOnDelete();
                $table->string('category', 30);
                $table->date('entry_date');
                $table->string('description', 255)->nullable();
                $table->decimal('amount', 12, 2);
                $table->string('status', 20)->default('PENDING');
                $table->foreignId('driver_settlement_id')->nullable()->constrained('driver_settlements')->nullOnDelete();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();
                $table->softDeletes();
                $table->timestamps();

                $table->index(['employee_id', 'status', 'entry_date']);
                $table->index(['category', 'status']);
                $table->index(['driver_settlement_id', 'status']);
            });
        }

        if (! Schema::hasTable('driver_deduction_events')) {
            Schema::create('driver_deduction_events', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('driver_deduction_id')->constrained('driver_deductions')->cascadeOnDelete();
                $table->string('action', 30);
                $table->json('before_data')->nullable();
                $table->json('after_data')->nullable();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('occurred_at');
                $table->timestamps();

                $table->index(['driver_deduction_id', 'occurred_at']);
                $table->index(['action', 'occurred_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_deduction_events');
        Schema::dropIfExists('driver_deductions');
    }
};
