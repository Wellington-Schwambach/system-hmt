<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('logistics_load_status_notes')) {
            return;
        }

        Schema::create('logistics_load_status_notes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('logistics_load_id')->constrained('logistics_loads')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('observation');
            $table->timestamps();

            $table->index(['logistics_load_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logistics_load_status_notes');
    }
};
