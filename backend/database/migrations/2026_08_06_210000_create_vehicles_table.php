<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table): void {
            $table->id();
            $table->string('fleet_number', 30)->nullable()->unique();
            $table->string('plate', 7)->unique();
            $table->string('type', 20);
            $table->string('brand', 80);
            $table->string('model', 100);
            $table->unsignedSmallInteger('manufacture_year');
            $table->unsignedSmallInteger('model_year');
            $table->string('color', 50)->nullable();
            $table->string('chassis', 17)->nullable()->unique();
            $table->string('renavam', 11)->nullable()->unique();
            $table->string('fuel_type', 20)->default('DIESEL');
            $table->unsignedBigInteger('load_capacity_kg')->default(0);
            $table->unsignedBigInteger('tare_kg')->default(0);
            $table->unsignedBigInteger('current_km')->default(0);
            $table->string('status', 20)->default('ACTIVE');
            $table->date('opentech_expiry_date')->nullable();
            $table->date('angellira_expiry_date')->nullable();
            $table->date('licensing_expiry_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('crlv_path')->nullable();
            $table->string('crlv_original_name')->nullable();
            $table->string('crlv_mime_type', 100)->nullable();
            $table->unsignedBigInteger('crlv_size')->nullable();
            $table->date('crlv_valid_until')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'plate']);
            $table->index('opentech_expiry_date');
            $table->index('angellira_expiry_date');
            $table->index('licensing_expiry_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
