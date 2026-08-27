<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicle_sets', function (Blueprint $table): void {
            $table->foreignId('driver_two_id')->nullable()->after('driver_id')->constrained('employees')->nullOnDelete();
            $table->string('driver_two_name', 150)->nullable()->after('driver_name');
            $table->timestamp('driver_two_assigned_at')->nullable()->after('driver_assigned_at');
            $table->index(['driver_two_id', 'status']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("CREATE UNIQUE INDEX vehicle_sets_active_driver_two_unique ON vehicle_sets (driver_two_id) WHERE status = 'ACTIVE' AND driver_two_id IS NOT NULL");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS vehicle_sets_active_driver_two_unique');
        }

        Schema::table('vehicle_sets', function (Blueprint $table): void {
            $table->dropIndex(['driver_two_id', 'status']);
            $table->dropConstrainedForeignId('driver_two_id');
            $table->dropColumn(['driver_two_name', 'driver_two_assigned_at']);
        });
    }
};
