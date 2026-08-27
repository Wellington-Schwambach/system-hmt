<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logistics_loads', function (Blueprint $table): void {
            $table->id();
            $table->string('reference_code', 40)->unique();
            $table->foreignId('shipper_id')->constrained('shippers')->restrictOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('driver_two_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('tractor_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->foreignId('trailer_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->string('container_number', 40)->nullable();
            $table->string('collection_city', 140)->nullable();
            $table->string('loading_city', 140)->nullable();
            $table->string('delivery_city', 140)->nullable();
            $table->timestamp('scheduled_at');
            $table->string('stage', 30)->default('PROGRAMMING');
            $table->unsignedInteger('position')->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['stage', 'position']);
            $table->index('scheduled_at');
            $table->index(['shipper_id', 'scheduled_at']);
            $table->index(['tractor_id', 'scheduled_at']);
            $table->index(['driver_id', 'scheduled_at']);
            $table->index(['driver_two_id', 'scheduled_at']);
        });

        Schema::create('logistics_load_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('logistics_load_id')->constrained('logistics_loads')->cascadeOnDelete();
            $table->string('action', 30);
            $table->string('from_stage', 30)->nullable();
            $table->string('to_stage', 30)->nullable();
            $table->json('details')->nullable();
            $table->timestamp('occurred_at');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['logistics_load_id', 'occurred_at']);
            $table->index(['action', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logistics_load_events');
        Schema::dropIfExists('logistics_loads');
    }
};
