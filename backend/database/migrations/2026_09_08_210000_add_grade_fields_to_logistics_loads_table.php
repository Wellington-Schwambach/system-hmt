<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('logistics_loads', function (Blueprint $table): void {
            if (! Schema::hasColumn('logistics_loads', 'grade_number')) {
                $table->string('grade_number', 100)->nullable()->after('collection_booking_number');
            }
            if (! Schema::hasColumn('logistics_loads', 'grade_at')) {
                $table->timestamp('grade_at')->nullable()->after('grade_number');
            }
        });

        DB::statement('CREATE INDEX IF NOT EXISTS logistics_loads_grade_at_idx ON logistics_loads (grade_at)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS logistics_loads_grade_at_idx');

        Schema::table('logistics_loads', function (Blueprint $table): void {
            if (Schema::hasColumn('logistics_loads', 'grade_at')) {
                $table->dropColumn('grade_at');
            }
            if (Schema::hasColumn('logistics_loads', 'grade_number')) {
                $table->dropColumn('grade_number');
            }
        });
    }
};
