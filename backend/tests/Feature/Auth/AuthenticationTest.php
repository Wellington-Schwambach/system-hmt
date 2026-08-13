<?php

namespace Tests\Feature\Auth;

use App\Models\LoginAttempt;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    public function test_guest_cannot_access_authenticated_user_endpoint(): void
    {
        $this->getJson('/api/auth/me')
            ->assertUnauthorized();
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'username' => 'admin',
            'password' => 'SenhaForte@123',
            'role' => 'Administrador',
        ]);

        $this->postJson('/api/auth/login', [
            'username' => 'ADMIN',
            'password' => 'SenhaForte@123',
            'remember' => true,
        ])
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.username', 'admin')
            ->assertJsonPath('user.role', 'Administrador');

        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->fresh()?->last_login_at);
        $this->assertDatabaseHas('login_attempts', [
            'user_id' => $user->id,
            'username' => 'admin',
            'was_successful' => true,
        ]);
    }

    public function test_login_fails_with_invalid_credentials_and_records_ip(): void
    {
        User::factory()->create([
            'username' => 'admin',
            'password' => 'SenhaForte@123',
        ]);

        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.10'])
            ->postJson('/api/auth/login', [
                'username' => 'admin',
                'password' => 'senha-incorreta',
                'remember' => false,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('username');

        $this->assertGuest();
        $this->assertDatabaseHas('login_attempts', [
            'username' => 'admin',
            'ip_address' => '192.0.2.10',
            'was_successful' => false,
            'failure_reason' => 'invalid_credentials',
            'failed_attempt_number' => 1,
        ]);
    }

    public function test_tenth_invalid_attempt_blocks_username_and_ip(): void
    {
        User::factory()->create([
            'username' => 'admin',
            'password' => 'SenhaForte@123',
        ]);

        for ($attempt = 1; $attempt <= 9; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.20'])
                ->postJson('/api/auth/login', [
                    'username' => 'admin',
                    'password' => 'senha-incorreta',
                ])
                ->assertUnprocessable();
        }

        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.20'])
            ->postJson('/api/auth/login', [
                'username' => 'admin',
                'password' => 'senha-incorreta',
            ])
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'LOGIN_TEMPORARILY_BLOCKED');

        $block = LoginAttempt::query()
            ->where('username', 'admin')
            ->where('ip_address', '192.0.2.20')
            ->whereNotNull('blocked_until')
            ->latest('id')
            ->first();

        $this->assertNotNull($block);
        $this->assertSame(10, $block?->failed_attempt_number);
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->inactive()->create([
            'username' => 'inativo',
            'password' => 'SenhaForte@123',
        ]);

        $this->postJson('/api/auth/login', [
            'username' => 'inativo',
            'password' => 'SenhaForte@123',
            'remember' => false,
        ])
            ->assertForbidden()
            ->assertJsonPath('code', 'USER_INACTIVE');

        $this->assertGuest();
    }

    public function test_user_cannot_login_outside_registered_schedule(): void
    {
        CarbonImmutable::setTestNow(
            CarbonImmutable::parse('2026-07-30 20:30:00', 'America/Sao_Paulo')
        );

        User::factory()->create([
            'username' => 'expediente',
            'password' => 'SenhaForte@123',
            'access_schedule_enabled' => true,
            'access_start_time' => '08:00',
            'access_end_time' => '18:00',
            'access_days' => [1, 2, 3, 4, 5],
            'access_timezone' => 'America/Sao_Paulo',
        ]);

        $this->postJson('/api/auth/login', [
            'username' => 'expediente',
            'password' => 'SenhaForte@123',
        ])
            ->assertStatus(423)
            ->assertJsonPath('code', 'ACCESS_OUTSIDE_SCHEDULE');

        $this->assertGuest();
        $this->assertDatabaseHas('login_attempts', [
            'username' => 'expediente',
            'failure_reason' => 'outside_schedule',
        ]);
    }

    public function test_authenticated_user_is_logged_out_when_schedule_ends(): void
    {
        CarbonImmutable::setTestNow(
            CarbonImmutable::parse('2026-07-30 20:30:00', 'America/Sao_Paulo')
        );

        $user = User::factory()->create([
            'access_schedule_enabled' => true,
            'access_start_time' => '08:00',
            'access_end_time' => '18:00',
            'access_days' => [1, 2, 3, 4, 5],
            'access_timezone' => 'America/Sao_Paulo',
        ]);

        $this->actingAs($user)
            ->getJson('/api/dashboard')
            ->assertStatus(423)
            ->assertJsonPath('code', 'ACCESS_OUTSIDE_SCHEDULE');

        $this->assertGuest();
    }


    public function test_saturday_and_sunday_use_independent_optional_schedules(): void
    {
        $user = User::factory()->create([
            'username' => 'fimsemana',
            'password' => 'SenhaForte@123',
            'access_schedule_enabled' => true,
            'access_start_time' => '08:00',
            'access_end_time' => '18:00',
            'access_days' => [1, 2, 3, 4, 5],
            'saturday_access_enabled' => true,
            'saturday_start_time' => '08:00',
            'saturday_end_time' => '12:00',
            'sunday_access_enabled' => true,
            'sunday_start_time' => '08:00',
            'sunday_end_time' => '18:00',
            'access_timezone' => 'America/Sao_Paulo',
        ]);

        CarbonImmutable::setTestNow(
            CarbonImmutable::parse('2026-08-08 10:00:00', 'America/Sao_Paulo')
        );

        $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => 'SenhaForte@123',
        ])->assertOk();

        $this->postJson('/api/auth/logout')->assertOk();

        CarbonImmutable::setTestNow(
            CarbonImmutable::parse('2026-08-08 13:00:00', 'America/Sao_Paulo')
        );

        $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => 'SenhaForte@123',
        ])
            ->assertStatus(423)
            ->assertJsonPath('code', 'ACCESS_OUTSIDE_SCHEDULE');

        CarbonImmutable::setTestNow(
            CarbonImmutable::parse('2026-08-09 17:00:00', 'America/Sao_Paulo')
        );

        $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => 'SenhaForte@123',
        ])->assertOk();
    }

    public function test_temporary_access_bypasses_schedule_only_for_released_ip(): void
    {
        CarbonImmutable::setTestNow(
            CarbonImmutable::parse('2026-08-08 20:00:00', 'America/Sao_Paulo')
        );

        $user = User::factory()->create([
            'username' => 'temporario',
            'password' => 'SenhaForte@123',
            'access_schedule_enabled' => true,
            'access_start_time' => '08:00',
            'access_end_time' => '18:00',
            'access_days' => [1, 2, 3, 4, 5],
            'access_timezone' => 'America/Sao_Paulo',
            'temporary_access_until' => now()->addHours(2),
            'temporary_access_ip' => '192.0.2.80',
        ]);

        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.80'])
            ->postJson('/api/auth/login', [
                'username' => $user->username,
                'password' => 'SenhaForte@123',
            ])
            ->assertOk()
            ->assertJsonPath('user.access.temporary_override', true);

        $this->postJson('/api/auth/logout')->assertOk();

        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.81'])
            ->postJson('/api/auth/login', [
                'username' => $user->username,
                'password' => 'SenhaForte@123',
            ])
            ->assertStatus(423)
            ->assertJsonPath('code', 'ACCESS_OUTSIDE_SCHEDULE');
    }

    public function test_schedule_denial_is_not_treated_as_invalid_password_block(): void
    {
        CarbonImmutable::setTestNow(
            CarbonImmutable::parse('2026-08-08 20:00:00', 'America/Sao_Paulo')
        );

        User::factory()->create([
            'username' => 'agenda',
            'password' => 'SenhaForte@123',
            'access_schedule_enabled' => true,
            'access_start_time' => '08:00',
            'access_end_time' => '18:00',
            'access_days' => [1, 2, 3, 4, 5],
            'access_timezone' => 'America/Sao_Paulo',
        ]);

        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.90'])
            ->postJson('/api/auth/login', [
                'username' => 'agenda',
                'password' => 'SenhaForte@123',
            ])
            ->assertStatus(423);

        $this->assertDatabaseHas('login_attempts', [
            'username' => 'agenda',
            'ip_address' => '192.0.2.90',
            'failure_reason' => 'outside_schedule',
            'blocked_until' => null,
        ]);
    }

    public function test_authenticated_user_can_change_own_password(): void
    {
        $user = User::factory()->create([
            'password' => 'SenhaAtual@123',
        ]);

        $this->actingAs($user)
            ->putJson('/api/auth/password', [
                'current_password' => 'SenhaAtual@123',
                'password' => 'NovaSenha@456',
                'password_confirmation' => 'NovaSenha@456',
            ])
            ->assertOk()
            ->assertJsonPath('message', 'Senha alterada com sucesso.');

        $this->assertTrue(
            password_verify('NovaSenha@456', (string) $user->fresh()?->password)
        );
        $this->assertAuthenticatedAs($user);
    }

    public function test_user_cannot_change_password_with_incorrect_current_password(): void
    {
        $user = User::factory()->create([
            'password' => 'SenhaAtual@123',
        ]);

        $this->actingAs($user)
            ->putJson('/api/auth/password', [
                'current_password' => 'SenhaErrada@123',
                'password' => 'NovaSenha@456',
                'password_confirmation' => 'NovaSenha@456',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('current_password');

        $this->assertTrue(
            password_verify('SenhaAtual@123', (string) $user->fresh()?->password)
        );
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Sessão encerrada com sucesso.');

        $this->assertGuest();
    }
}
