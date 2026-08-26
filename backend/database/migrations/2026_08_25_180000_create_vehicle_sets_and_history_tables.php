<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_sets', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tractor_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->foreignId('trailer_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('employees')->nullOnDelete();

            // Snapshots mantêm o histórico legível mesmo se um cadastro for removido futuramente.
            $table->string('tractor_plate', 7);
            $table->string('tractor_label', 220);
            $table->string('trailer_plate', 7);
            $table->string('trailer_label', 220);
            $table->string('driver_name', 150);

            $table->timestamp('coupled_at');
            $table->timestamp('driver_assigned_at');
            $table->timestamp('detached_at')->nullable();
            $table->string('status', 20)->default('ACTIVE');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'coupled_at']);
            $table->index(['tractor_id', 'status']);
            $table->index(['trailer_id', 'status']);
            $table->index(['driver_id', 'status']);
        });

        Schema::create('vehicle_set_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('vehicle_set_id')->constrained('vehicle_sets')->cascadeOnDelete();
            $table->string('action', 30);
            $table->foreignId('tractor_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->foreignId('trailer_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('tractor_plate', 7);
            $table->string('trailer_plate', 7);
            $table->string('driver_name', 150)->nullable();
            $table->timestamp('occurred_at');
            $table->text('notes')->nullable();
            $table->json('details')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['vehicle_set_id', 'occurred_at']);
            $table->index(['action', 'occurred_at']);
        });

        // PostgreSQL: garante unicidade também em concorrência, não apenas na validação da API.
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("CREATE UNIQUE INDEX vehicle_sets_active_tractor_unique ON vehicle_sets (tractor_id) WHERE status = 'ACTIVE' AND tractor_id IS NOT NULL");
            DB::statement("CREATE UNIQUE INDEX vehicle_sets_active_trailer_unique ON vehicle_sets (trailer_id) WHERE status = 'ACTIVE' AND trailer_id IS NOT NULL");
            DB::statement("CREATE UNIQUE INDEX vehicle_sets_active_driver_unique ON vehicle_sets (driver_id) WHERE status = 'ACTIVE' AND driver_id IS NOT NULL");
        }


        // Mantém o novo módulo disponível para os perfis operacionais já cadastrados.
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'menu_permissions')) {
            DB::table('users')->orderBy('id')->get(['id', 'role', 'menu_permissions'])->each(function ($user): void {
                $permissions = is_string($user->menu_permissions)
                    ? json_decode($user->menu_permissions, true)
                    : $user->menu_permissions;

                if (! is_array($permissions)) {
                    return;
                }

                $role = mb_strtolower(trim((string) $user->role));
                $shouldAdd = in_array($role, ['administrador', 'gestor', 'operador'], true)
                    || in_array('travel', $permissions, true)
                    || in_array('logistics', $permissions, true);

                if ($shouldAdd && ! in_array('vehicle_sets', $permissions, true)) {
                    $permissions[] = 'vehicle_sets';
                    DB::table('users')->where('id', $user->id)->update([
                        'menu_permissions' => json_encode(array_values(array_unique($permissions))),
                    ]);
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'menu_permissions')) {
            DB::table('users')->orderBy('id')->get(['id', 'menu_permissions'])->each(function ($user): void {
                $permissions = is_string($user->menu_permissions)
                    ? json_decode($user->menu_permissions, true)
                    : $user->menu_permissions;

                if (! is_array($permissions)) {
                    return;
                }

                $permissions = array_values(array_filter(
                    $permissions,
                    fn ($permission): bool => $permission !== 'vehicle_sets'
                ));

                DB::table('users')->where('id', $user->id)->update([
                    'menu_permissions' => json_encode($permissions),
                ]);
            });
        }

        Schema::dropIfExists('vehicle_set_events');
        Schema::dropIfExists('vehicle_sets');
    }
};
