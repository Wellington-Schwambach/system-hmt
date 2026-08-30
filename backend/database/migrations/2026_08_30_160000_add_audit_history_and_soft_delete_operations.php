<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('fuel_records')) {
            Schema::table('fuel_records', function (Blueprint $table): void {
                if (! Schema::hasColumn('fuel_records', 'trailer_id')) {
                    $table->foreignId('trailer_id')->nullable()->after('vehicle_id')->constrained('vehicles')->nullOnDelete();
                }
                if (! Schema::hasColumn('fuel_records', 'trailer_plate_snapshot')) {
                    $table->string('trailer_plate_snapshot', 10)->nullable()->after('plate');
                }
            });
        }

        if (! Schema::hasTable('fuel_record_events')) {
            Schema::create('fuel_record_events', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('fuel_record_id');
                $table->string('action', 30);
                $table->json('before_data')->nullable();
                $table->json('after_data')->nullable();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('occurred_at');
                $table->timestamps();
                $table->index(['fuel_record_id', 'occurred_at']);
                $table->index(['action', 'occurred_at']);
            });
        }

        if (Schema::hasTable('travels')) {
            Schema::table('travels', function (Blueprint $table): void {
                if (! Schema::hasColumn('travels', 'deleted_by')) {
                    $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn('travels', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }

        if (! Schema::hasTable('travel_events')) {
            Schema::create('travel_events', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('travel_id');
                $table->string('action', 30);
                $table->json('before_data')->nullable();
                $table->json('after_data')->nullable();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('occurred_at');
                $table->timestamps();
                $table->index(['travel_id', 'occurred_at']);
                $table->index(['action', 'occurred_at']);
            });
        }

        if (Schema::hasTable('logistics_loads')) {
            Schema::table('logistics_loads', function (Blueprint $table): void {
                if (! Schema::hasColumn('logistics_loads', 'deleted_by')) {
                    $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn('logistics_loads', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('logistics_loads')) {
            Schema::table('logistics_loads', function (Blueprint $table): void {
                if (Schema::hasColumn('logistics_loads', 'deleted_by')) $table->dropConstrainedForeignId('deleted_by');
                if (Schema::hasColumn('logistics_loads', 'deleted_at')) $table->dropSoftDeletes();
            });
        }
        Schema::dropIfExists('travel_events');
        if (Schema::hasTable('travels')) {
            Schema::table('travels', function (Blueprint $table): void {
                if (Schema::hasColumn('travels', 'deleted_by')) $table->dropConstrainedForeignId('deleted_by');
                if (Schema::hasColumn('travels', 'deleted_at')) $table->dropSoftDeletes();
            });
        }
        Schema::dropIfExists('fuel_record_events');
        if (Schema::hasTable('fuel_records')) {
            Schema::table('fuel_records', function (Blueprint $table): void {
                if (Schema::hasColumn('fuel_records', 'trailer_id')) $table->dropConstrainedForeignId('trailer_id');
                if (Schema::hasColumn('fuel_records', 'trailer_plate_snapshot')) $table->dropColumn('trailer_plate_snapshot');
            });
        }
    }
};
