<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'username' => fake()->unique()->userName(),
            'password' => static::$password ??= Hash::make('password'),
            'phone' => fake()->optional()->phoneNumber(),
            'role' => 'Operador',
            'is_active' => true,
            'last_login_at' => null,
            'theme_preference' => 'light',
            'menu_permissions' => ['dashboard'],
            'remember_token' => Str::random(10),
            'access_schedule_enabled' => false,
            'access_start_time' => null,
            'access_end_time' => null,
            'access_days' => null,
            'access_timezone' => 'America/Sao_Paulo',
            'saturday_access_enabled' => false,
            'saturday_start_time' => null,
            'saturday_end_time' => null,
            'sunday_access_enabled' => false,
            'sunday_start_time' => null,
            'sunday_end_time' => null,
            'temporary_access_until' => null,
            'temporary_access_ip' => null,
            'temporary_access_granted_by' => null,
            'temporary_access_granted_at' => null,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
