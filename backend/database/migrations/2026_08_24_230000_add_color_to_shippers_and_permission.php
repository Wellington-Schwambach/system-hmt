<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('shippers') && ! Schema::hasColumn('shippers', 'display_color')) {
            Schema::table('shippers', function (Blueprint $table): void {
                $table->string('display_color', 7)->default('#009E60')->after('status');
            });
        }

        if (Schema::hasTable('shippers') && Schema::hasColumn('shippers', 'display_color')) {
            $knownColors = [
                'BRF' => '#2563EB',
                'AURORA' => '#16A34A',
                'MILIA' => '#7C3AED',
                'GEO' => '#EA580C',
                'ITRACON' => '#0891B2',
            ];

            $palette = [
                '#0F766E', '#9333EA', '#DC2626', '#CA8A04', '#0284C7',
                '#C026D3', '#4F46E5', '#65A30D', '#E11D48', '#0D9488',
            ];

            $shippers = DB::table('shippers')->orderBy('id')->get(['id', 'name', 'normalized_name']);

            foreach ($shippers as $index => $shipper) {
                $normalized = strtoupper(trim((string) ($shipper->normalized_name ?: $shipper->name)));
                $color = $knownColors[$normalized] ?? $palette[$index % count($palette)];

                DB::table('shippers')
                    ->where('id', $shipper->id)
                    ->update(['display_color' => $color]);
            }
        }

        // Usuários que já tinham acesso aos cadastros continuam enxergando o novo cadastro.
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
                    || in_array('registrations.vehicles', $permissions, true)
                    || in_array('registrations.employees', $permissions, true);

                if ($shouldAdd && ! in_array('registrations.shippers', $permissions, true)) {
                    $permissions[] = 'registrations.shippers';
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
                    fn ($permission): bool => $permission !== 'registrations.shippers'
                ));

                DB::table('users')->where('id', $user->id)->update([
                    'menu_permissions' => json_encode($permissions),
                ]);
            });
        }

        if (Schema::hasTable('shippers') && Schema::hasColumn('shippers', 'display_color')) {
            Schema::table('shippers', function (Blueprint $table): void {
                $table->dropColumn('display_color');
            });
        }
    }
};
