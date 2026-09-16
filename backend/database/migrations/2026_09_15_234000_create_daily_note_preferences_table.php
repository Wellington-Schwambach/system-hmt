<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_note_preferences', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('alert_type', 50);
            $table->boolean('enabled')->default(true);
            $table->unsignedSmallInteger('days_before')->default(10);
            $table->timestamps();

            $table->unique(['user_id', 'alert_type']);
            $table->index(['alert_type', 'enabled']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_note_preferences');
    }
};
