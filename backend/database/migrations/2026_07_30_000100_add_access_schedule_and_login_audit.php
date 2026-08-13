<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('access_schedule_enabled')->default(false);
            $table->time('access_start_time')->nullable();
            $table->time('access_end_time')->nullable();
            $table->json('access_days')->nullable();
            $table->string('access_timezone', 80)->default('America/Sao_Paulo');
        });

        Schema::create('login_attempts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('username', 100)->index();
            $table->string('ip_address', 45)->index();
            $table->text('user_agent')->nullable();
            $table->boolean('was_successful')->default(false)->index();
            $table->string('failure_reason', 80)->nullable()->index();
            $table->unsignedSmallInteger('failed_attempt_number')->nullable();
            $table->timestampTz('blocked_until')->nullable()->index();
            $table->timestampTz('attempted_at')->useCurrent()->index();
            $table->json('metadata')->nullable();
            $table->timestampsTz();

            $table->index(
                ['username', 'ip_address', 'attempted_at'],
                'login_attempts_identity_time_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_attempts');

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'access_schedule_enabled',
                'access_start_time',
                'access_end_time',
                'access_days',
                'access_timezone',
            ]);
        });
    }
};
