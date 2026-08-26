<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fuel_records', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('plate', 10);
            $table->string('driver_name', 180);
            $table->date('fuel_date');
            $table->string('station', 120);
            $table->unsignedBigInteger('km')->nullable();
            $table->decimal('diesel_liters', 12, 3);
            $table->decimal('diesel_total_value', 14, 2);
            $table->decimal('arla_liters', 12, 3)->default(0);
            $table->decimal('arla_total_value', 14, 2)->default(0);
            $table->boolean('diesel_invoiced')->default(false);
            $table->boolean('arla_invoiced')->default(false);
            $table->timestamp('diesel_invoiced_at')->nullable();
            $table->timestamp('arla_invoiced_at')->nullable();
            $table->foreignId('diesel_invoiced_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('arla_invoiced_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['fuel_date', 'plate']);
            $table->index(['diesel_invoiced', 'arla_invoiced']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fuel_records');
    }
};
