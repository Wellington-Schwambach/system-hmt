<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daily_notes', function (Blueprint $table): void {
            $table->string('note_type', 20)->default('manual')->after('id');
            $table->unsignedSmallInteger('days_before')->default(0)->after('scheduled_at');
            $table->boolean('is_active')->default(true)->after('days_before');

            $table->index(['note_type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::table('daily_notes', function (Blueprint $table): void {
            $table->dropIndex(['note_type', 'is_active']);
            $table->dropColumn(['note_type', 'days_before', 'is_active']);
        });
    }
};
