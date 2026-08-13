<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table): void {
            $table->id();
            $table->string('employee_code', 30)->unique();
            $table->string('full_name', 150);
            $table->string('cpf', 11)->unique();
            $table->string('rg', 30)->nullable();
            $table->date('birth_date');
            $table->string('phone', 20)->nullable();
            $table->string('email', 150)->nullable();
            $table->text('full_address')->nullable();
            $table->string('job_title', 80)->default('Motorista');
            $table->date('admission_date');
            $table->date('termination_date')->nullable();
            $table->string('family_contact', 200)->nullable();
            $table->date('probation_end_date')->nullable();
            $table->string('status', 20)->default('ACTIVE');

            $table->string('cnh_number', 20)->nullable()->unique();
            $table->string('cnh_category', 3)->nullable();
            $table->date('cnh_issued_at')->nullable();
            $table->date('cnh_first_license_date')->nullable();
            $table->date('cnh_expiry_date')->nullable();
            $table->string('cnh_state', 2)->nullable();
            $table->string('cnh_security_code', 20)->nullable();

            $table->date('aso_expiry_date')->nullable();
            $table->date('opentech_expiry_date')->nullable();
            $table->date('angellira_expiry_date')->nullable();
            $table->date('toxicological_expiry_date')->nullable();
            $table->text('trainings')->nullable();
            $table->text('notes')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'full_name']);
            $table->index('admission_date');
            $table->index('aso_expiry_date');
            $table->index('opentech_expiry_date');
            $table->index('angellira_expiry_date');
            $table->index('toxicological_expiry_date');
        });

        Schema::create('employee_documents', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('type', 30);
            $table->string('path');
            $table->string('original_name');
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_documents');
        Schema::dropIfExists('employees');
    }
};
