<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_notes', function (Blueprint $table): void {
            $table->id();
            $table->string('title', 160);
            $table->text('observation');
            $table->timestamp('scheduled_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('scheduled_at');
            $table->index('created_by');
        });

        Schema::create('daily_note_recipients', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('daily_note_id')->constrained('daily_notes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['daily_note_id', 'user_id']);
            $table->index(['user_id', 'daily_note_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_note_recipients');
        Schema::dropIfExists('daily_notes');
    }
};
