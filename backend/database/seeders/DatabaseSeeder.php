<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $username = config('hmt.admin.username');
        $password = config('hmt.admin.password');

        if (! is_string($username) || $username === '' || ! is_string($password) || $password === '') {
            $this->command?->warn(
                'Administrador não criado. Defina ADMIN_USERNAME e ADMIN_PASSWORD no arquivo .env.'
            );

            return;
        }

        User::query()->updateOrCreate(
            ['username' => strtolower(trim($username))],
            [
                'name' => config('hmt.admin.name', 'Administrador'),
                'password' => $password,
                'role' => 'Administrador',
                'is_active' => true,
                'theme_preference' => 'dark',
                'menu_permissions' => array_keys((array) config('hmt.access.permissions', [])),
            ],
        );
    }
}
