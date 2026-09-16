<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_note_completions', function (Blueprint $table): void {
            $table->id();
            $table->string('note_key', 255)->unique();
            $table->foreignId('completed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('completed_at');
            $table->timestampsTz();

            $table->index(['completed_at', 'completed_by']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_note_completions');
    }
};
