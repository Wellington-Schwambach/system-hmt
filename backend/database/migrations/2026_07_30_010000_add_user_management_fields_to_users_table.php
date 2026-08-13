<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('phone', 30)->nullable();
            $table->string('theme_preference', 12)->default('light');
            $table->json('menu_permissions')->nullable();
        });

        $profiles = (array) config('hmt.access.profiles', []);

        foreach ($profiles as $role => $profile) {
            $permissions = json_encode(
                array_values($profile['permissions'] ?? []),
                JSON_THROW_ON_ERROR
            );

            if (DB::getDriverName() === 'pgsql') {
                DB::statement(
                    'UPDATE users SET menu_permissions = CAST(? AS JSON) WHERE LOWER(role) = LOWER(?)',
                    [$permissions, $role]
                );
            } else {
                DB::table('users')
                    ->whereRaw('LOWER(role) = LOWER(?)', [$role])
                    ->update(['menu_permissions' => $permissions]);
            }
        }

        $dashboardOnly = json_encode(['dashboard'], JSON_THROW_ON_ERROR);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                'UPDATE users SET menu_permissions = CAST(? AS JSON) WHERE menu_permissions IS NULL',
                [$dashboardOnly]
            );
        } else {
            DB::table('users')
                ->whereNull('menu_permissions')
                ->update(['menu_permissions' => $dashboardOnly]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'phone',
                'theme_preference',
                'menu_permissions',
            ]);
        });
    }
};
