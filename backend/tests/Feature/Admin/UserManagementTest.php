<?php

namespace Tests\Feature\Admin;

use App\Models\LoginAttempt;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_create_user_with_hashed_password_and_rules(): void
    {
        $administrator = User::factory()->create([
            'role' => 'Administrador',
            'menu_permissions' => array_keys((array) config('hmt.access.permissions', [])),
        ]);

        $response = $this->actingAs($administrator)->postJson('/api/admin/security/users', [
            'name' => 'João Operação',
            'username' => 'joao.operacao',
            'phone' => '(11) 99999-0000',
            'role' => 'Operador',
            'is_active' => true,
            'password' => 'SenhaForte123',
            'theme_preference' => 'dark',
            'menu_permissions' => ['dashboard', 'fuel', 'travel'],
            'access_schedule_enabled' => true,
            'access_start_time' => '08:00',
            'access_end_time' => '18:00',
            'access_days' => [1, 2, 3, 4, 5],
            'access_timezone' => 'America/Sao_Paulo',
            'saturday_access_enabled' => true,
            'saturday_start_time' => '08:00',
            'saturday_end_time' => '12:00',
            'sunday_access_enabled' => false,
            'sunday_start_time' => null,
            'sunday_end_time' => null,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.username', 'joao.operacao')
            ->assertJsonPath('user.theme_preference', 'dark')
            ->assertJsonMissingPath('user.password');

        $user = User::query()->where('username', 'joao.operacao')->firstOrFail();

        $this->assertNotSame('SenhaForte123', $user->password);
        $this->assertTrue(Hash::check('SenhaForte123', $user->password));
        $this->assertSame(['dashboard', 'fuel', 'travel'], $user->menu_permissions);
    }

    public function test_non_administrator_cannot_manage_users(): void
    {
        $operator = User::factory()->create([
            'role' => 'Operador',
            'menu_permissions' => ['dashboard'],
        ]);

        $this->actingAs($operator)
            ->getJson('/api/admin/security/overview')
            ->assertForbidden()
            ->assertJsonPath('code', 'ADMIN_REQUIRED');
    }

    public function test_permission_middleware_denies_unreleased_module(): void
    {
        $user = User::factory()->create([
            'role' => 'Operador',
            'menu_permissions' => [],
        ]);

        $this->actingAs($user)
            ->getJson('/api/dashboard')
            ->assertForbidden()
            ->assertJsonPath('code', 'ACCESS_PERMISSION_DENIED');
    }


    public function test_overview_lists_current_schedule_denial_as_active_block(): void
    {
        CarbonImmutable::setTestNow('2026-08-09 15:00:00 UTC');

        try {
            $administrator = User::factory()->create(['role' => 'Administrador']);
            $user = User::factory()->create([
                'name' => 'Usuário com horário',
                'username' => 'horario.bloqueado',
                'is_active' => true,
                'access_schedule_enabled' => true,
                'access_start_time' => '08:00',
                'access_end_time' => '18:00',
                'access_days' => [1, 2, 3, 4, 5],
                'access_timezone' => 'UTC',
                'saturday_access_enabled' => false,
                'sunday_access_enabled' => false,
            ]);

            LoginAttempt::query()->create([
                'user_id' => $user->id,
                'username' => $user->username,
                'ip_address' => '192.0.2.90',
                'was_successful' => false,
                'failure_reason' => 'outside_schedule',
                'attempted_at' => now(),
                'metadata' => ['next_access_at' => '2026-08-10T08:00:00Z'],
            ]);

            $this->actingAs($administrator)
                ->getJson('/api/admin/security/overview')
                ->assertOk()
                ->assertJsonPath('active_blocks.0.username', 'horario.bloqueado')
                ->assertJsonPath('active_blocks.0.ip_address', '192.0.2.90')
                ->assertJsonPath('active_blocks.0.block_type', 'outside_schedule')
                ->assertJsonPath('active_blocks.0.next_access_at', '2026-08-10T08:00:00+00:00');
        } finally {
            CarbonImmutable::setTestNow();
        }
    }

    public function test_administrator_can_remove_active_login_block(): void
    {
        $administrator = User::factory()->create(['role' => 'Administrador']);

        User::factory()->create(['username' => 'bloqueado']);

        LoginAttempt::query()->create([
            'username' => 'bloqueado',
            'ip_address' => '192.0.2.55',
            'was_successful' => false,
            'failure_reason' => 'invalid_credentials',
            'failed_attempt_number' => 10,
            'blocked_until' => now()->addMinutes(30),
            'attempted_at' => now(),
        ]);

        $this->actingAs($administrator)
            ->postJson('/api/admin/security/blocks/unblock', [
                'username' => 'bloqueado',
                'ip_address' => '192.0.2.55',
                'duration_minutes' => 240,
            ])
            ->assertOk()
            ->assertJsonPath('updated_records', 1)
            ->assertJsonPath('temporary_access_until', fn ($value) => is_string($value));

        $this->assertNotNull(
            User::query()->where('username', 'bloqueado')->value('temporary_access_until')
        );

        $this->assertDatabaseMissing('login_attempts', [
            'username' => 'bloqueado',
            'ip_address' => '192.0.2.55',
            'blocked_until' => now()->addMinutes(30),
        ]);
    }
}
