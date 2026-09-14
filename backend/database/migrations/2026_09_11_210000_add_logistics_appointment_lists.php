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
            if (! Schema::hasColumn('logistics_loads', 'collection_appointments')) {
                $table->jsonb('collection_appointments')->nullable()->after('collection_at');
            }
            if (! Schema::hasColumn('logistics_loads', 'delivery_appointments')) {
                $table->jsonb('delivery_appointments')->nullable()->after('delivery_at');
            }
        });

        if (Schema::hasColumn('logistics_loads', 'collection_appointments')) {
            DB::statement(<<<'SQL'
                UPDATE logistics_loads
                   SET collection_appointments = jsonb_build_array(
                       jsonb_build_object(
                           'scheduled_at', collection_scheduled_at,
                           'location_type_id', collection_location_type_id
                       )
                   )
                 WHERE collection_appointments IS NULL
                   AND collection_scheduled_at IS NOT NULL
            SQL);
        }
    }

    public function down(): void
    {
        Schema::table('logistics_loads', function (Blueprint $table): void {
            $columns = [];
            if (Schema::hasColumn('logistics_loads', 'collection_appointments')) {
                $columns[] = 'collection_appointments';
            }
            if (Schema::hasColumn('logistics_loads', 'delivery_appointments')) {
                $columns[] = 'delivery_appointments';
            }
            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
