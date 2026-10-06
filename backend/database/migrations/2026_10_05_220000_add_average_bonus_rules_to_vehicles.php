<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table): void {
            $table->boolean('average_bonus_enabled')->default(false);
            $table->date('average_bonus_valid_from')->nullable();
            $table->jsonb('average_bonus_rules')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table): void {
            $table->dropColumn([
                'average_bonus_enabled',
                'average_bonus_valid_from',
                'average_bonus_rules',
            ]);
        });
    }
};
