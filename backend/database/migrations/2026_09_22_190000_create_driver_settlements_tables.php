<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('driver_settlements')) {
            Schema::create('driver_settlements', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('driver_id')->nullable()->constrained('employees')->nullOnDelete();
                $table->string('driver_name', 180);
                $table->date('start_date');
                $table->date('end_date');
                $table->json('snapshot');
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();
                $table->softDeletes();
                $table->timestamps();

                $table->index(['driver_id', 'start_date', 'end_date']);
                $table->index(['updated_at', 'id']);
            });
        }

        if (! Schema::hasTable('driver_settlement_events')) {
            Schema::create('driver_settlement_events', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('driver_settlement_id');
                $table->string('action', 30);
                $table->json('before_data')->nullable();
                $table->json('after_data')->nullable();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('occurred_at');
                $table->timestamps();

                $table->index(['driver_settlement_id', 'occurred_at']);
                $table->index(['action', 'occurred_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_settlement_events');
        Schema::dropIfExists('driver_settlements');
    }
};
