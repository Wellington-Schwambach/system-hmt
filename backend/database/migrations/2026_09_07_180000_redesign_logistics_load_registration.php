<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('logistics_cargo_types')) {
            Schema::create('logistics_cargo_types', function (Blueprint $table): void {
                $table->id();
                $table->string('name', 120);
                $table->string('normalized_name', 120)->unique();
                $table->boolean('active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('logistics_container_types')) {
            Schema::create('logistics_container_types', function (Blueprint $table): void {
                $table->id();
                $table->string('name', 120);
                $table->string('normalized_name', 120)->unique();
                $table->boolean('active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('logistics_shipowners')) {
            Schema::create('logistics_shipowners', function (Blueprint $table): void {
                $table->id();
                $table->string('name', 140);
                $table->string('normalized_name', 140)->unique();
                $table->boolean('active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('logistics_location_types')) {
            Schema::create('logistics_location_types', function (Blueprint $table): void {
                $table->id();
                $table->string('name', 120);
                $table->string('normalized_name', 120);
                $table->char('scope', 1); // C = coleta | B = baixa/entrega
                $table->boolean('active')->default(true);
                $table->timestamps();
                $table->unique(['normalized_name', 'scope']);
                $table->index(['scope', 'active']);
            });
        }

        if (Schema::hasTable('logistics_loads')) {
            Schema::table('logistics_loads', function (Blueprint $table): void {
                if (! Schema::hasColumn('logistics_loads', 'cargo_type_id')) {
                    $table->foreignId('cargo_type_id')->nullable()->after('shipper_id')->constrained('logistics_cargo_types')->nullOnDelete();
                }
                if (! Schema::hasColumn('logistics_loads', 'container_type_id')) {
                    $table->foreignId('container_type_id')->nullable()->after('cargo_type_id')->constrained('logistics_container_types')->nullOnDelete();
                }
                if (! Schema::hasColumn('logistics_loads', 'shipowner_id')) {
                    $table->foreignId('shipowner_id')->nullable()->after('container_type_id')->constrained('logistics_shipowners')->nullOnDelete();
                }
                if (! Schema::hasColumn('logistics_loads', 'collection_city_id')) {
                    $table->foreignId('collection_city_id')->nullable()->after('trailer_id')->constrained('brazil_cities')->nullOnDelete();
                }
                if (! Schema::hasColumn('logistics_loads', 'loading_city_id')) {
                    $table->foreignId('loading_city_id')->nullable()->after('collection_city_id')->constrained('brazil_cities')->nullOnDelete();
                }
                if (! Schema::hasColumn('logistics_loads', 'delivery_city_id')) {
                    $table->foreignId('delivery_city_id')->nullable()->after('loading_city_id')->constrained('brazil_cities')->nullOnDelete();
                }
                if (! Schema::hasColumn('logistics_loads', 'collection_location_type_id')) {
                    $table->foreignId('collection_location_type_id')->nullable()->after('delivery_city_id')->constrained('logistics_location_types')->nullOnDelete();
                }
                if (! Schema::hasColumn('logistics_loads', 'delivery_location_type_id')) {
                    $table->foreignId('delivery_location_type_id')->nullable()->after('collection_location_type_id')->constrained('logistics_location_types')->nullOnDelete();
                }
                if (! Schema::hasColumn('logistics_loads', 'collection_booking_number')) {
                    $table->string('collection_booking_number', 100)->nullable()->after('booking_number');
                }
                if (! Schema::hasColumn('logistics_loads', 'collection_scheduled_at')) {
                    $table->timestamp('collection_scheduled_at')->nullable()->after('collection_booking_number');
                }
                if (! Schema::hasColumn('logistics_loads', 'plan')) {
                    $table->string('plan', 120)->nullable()->after('collection_scheduled_at');
                }
                if (! Schema::hasColumn('logistics_loads', 'load_mode')) {
                    $table->string('load_mode', 20)->nullable()->after('plan');
                }
                if (! Schema::hasColumn('logistics_loads', 'load_status')) {
                    $table->string('load_status', 20)->nullable()->after('load_mode');
                }
                if (! Schema::hasColumn('logistics_loads', 'container_tare_kg')) {
                    $table->decimal('container_tare_kg', 12, 2)->nullable()->after('container_number');
                }
                if (! Schema::hasColumn('logistics_loads', 'container_payload_kg')) {
                    $table->decimal('container_payload_kg', 12, 2)->nullable()->after('container_tare_kg');
                }
                if (! Schema::hasColumn('logistics_loads', 'shipowner_seal')) {
                    $table->string('shipowner_seal', 100)->nullable()->after('container_payload_kg');
                }
                if (! Schema::hasColumn('logistics_loads', 'vessel')) {
                    $table->string('vessel', 140)->nullable()->after('shipowner_seal');
                }
                if (! Schema::hasColumn('logistics_loads', 'deadline')) {
                    $table->date('deadline')->nullable()->after('vessel');
                }
                if (! Schema::hasColumn('logistics_loads', 'country')) {
                    $table->string('country', 100)->nullable()->after('deadline');
                }
                if (! Schema::hasColumn('logistics_loads', 'temperature')) {
                    $table->string('temperature', 40)->nullable()->after('country');
                }
                if (! Schema::hasColumn('logistics_loads', 'sif_seal')) {
                    $table->string('sif_seal', 100)->nullable()->after('temperature');
                }
            });

            // Mantém compatibilidade com os armadores que já estavam gravados como texto.
            if (Schema::hasColumn('logistics_loads', 'shipowner') && Schema::hasColumn('logistics_loads', 'shipowner_id')) {
                $existingShipowners = DB::table('logistics_loads')
                    ->whereNotNull('shipowner')
                    ->where('shipowner', '<>', '')
                    ->distinct()
                    ->pluck('shipowner');

                foreach ($existingShipowners as $name) {
                    $clean = trim((string) $name);
                    if ($clean === '') continue;
                    $normalized = mb_strtoupper($clean, 'UTF-8');
                    DB::table('logistics_shipowners')->updateOrInsert(
                        ['normalized_name' => $normalized],
                        ['name' => $clean, 'active' => true, 'updated_at' => now(), 'created_at' => now()]
                    );
                    $id = DB::table('logistics_shipowners')->where('normalized_name', $normalized)->value('id');
                    DB::table('logistics_loads')
                        ->whereNull('shipowner_id')
                        ->whereRaw('UPPER(TRIM(shipowner)) = ?', [$normalized])
                        ->update(['shipowner_id' => $id]);
                }
            }

            try {
                DB::statement('CREATE INDEX IF NOT EXISTS logistics_loads_collection_scheduled_at_idx ON logistics_loads (collection_scheduled_at)');
            } catch (Throwable) {
                // índice auxiliar; não bloqueia a migration em bancos que não suportem IF NOT EXISTS aqui.
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('logistics_loads')) {
            Schema::table('logistics_loads', function (Blueprint $table): void {
                foreach ([
                    'cargo_type_id', 'container_type_id', 'shipowner_id', 'collection_city_id', 'loading_city_id',
                    'delivery_city_id', 'collection_location_type_id', 'delivery_location_type_id',
                ] as $column) {
                    if (Schema::hasColumn('logistics_loads', $column)) {
                        $table->dropConstrainedForeignId($column);
                    }
                }

                foreach ([
                    'collection_booking_number', 'collection_scheduled_at', 'plan', 'load_mode', 'load_status',
                    'container_tare_kg', 'container_payload_kg', 'shipowner_seal', 'vessel', 'deadline', 'country',
                    'temperature', 'sif_seal',
                ] as $column) {
                    if (Schema::hasColumn('logistics_loads', $column)) $table->dropColumn($column);
                }
            });
        }

        Schema::dropIfExists('logistics_location_types');
        Schema::dropIfExists('logistics_shipowners');
        Schema::dropIfExists('logistics_container_types');
        Schema::dropIfExists('logistics_cargo_types');
    }
};
