<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UnblockLoginRequest;
use App\Http\Requests\Admin\UpdateUserAccessScheduleRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\LoginAttempt;
use App\Models\User;
use App\Services\Access\UserMenuAccessService;
use App\Services\Auth\UserAccessScheduleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SecurityController extends Controller
{
    public function __construct(
        private readonly UserMenuAccessService $menuAccess,
        private readonly UserAccessScheduleService $accessSchedule
    ) {
    }

    public function overview(Request $request): JsonResponse
    {
        $limit = min(max((int) $request->integer('limit', 100), 10), 250);

        $users = User::query()
            ->orderBy('name')
            ->get()
            ->map(fn (User $user): array => $this->userSecurityPayload($user));

        $attempts = LoginAttempt::query()
            ->with('user:id,name,username')
            ->latest('attempted_at')
            ->limit($limit)
            ->get()
            ->map(static fn (LoginAttempt $attempt): array => [
                'id' => $attempt->id,
                'user_id' => $attempt->user_id,
                'name' => $attempt->user?->name,
                'username' => $attempt->username,
                'ip_address' => $attempt->ip_address,
                'was_successful' => $attempt->was_successful,
                'failure_reason' => $attempt->failure_reason,
                'failed_attempt_number' => $attempt->failed_attempt_number,
                'blocked_until' => $attempt->blocked_until?->toIso8601String(),
                'attempted_at' => $attempt->attempted_at?->toIso8601String(),
                'user_agent' => $attempt->user_agent,
            ]);

        $activeBlocks = $this->activeBlocks();

        return response()->json([
            'users' => $users,
            'attempts' => $attempts,
            'active_blocks' => $activeBlocks,
            'policy' => [
                'max_failed_attempts' => (int) config('hmt.security.max_failed_login_attempts', 10),
                'attempt_window_minutes' => (int) config('hmt.security.login_attempt_window_minutes', 15),
                'block_minutes' => (int) config('hmt.security.login_block_minutes', 30),
            ],
            'permission_catalog' => collect($this->menuAccess->catalog())
                ->map(static fn (array $permission, string $key): array => [
                    'key' => $key,
                    'label' => $permission['label'] ?? $key,
                    'group' => $permission['group'] ?? 'Outros',
                    'path' => $permission['path'] ?? null,
                ])
                ->values(),
            'access_profiles' => collect($this->menuAccess->profiles())
                ->map(static fn (array $profile, string $key): array => [
                    'key' => $key,
                    'label' => $profile['label'] ?? $key,
                    'description' => $profile['description'] ?? '',
                    'default_permissions' => array_values($profile['permissions'] ?? []),
                ])
                ->values(),
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = User::query()->create($this->userAttributes($validated));

        return response()->json([
            'message' => 'Usuário criado com sucesso. A senha foi armazenada somente como hash.',
            'user' => $this->userSecurityPayload($user),
        ], 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();
        $authenticatedUser = $request->user();

        if ($authenticatedUser?->is($user) && ! $validated['is_active']) {
            throw ValidationException::withMessages([
                'is_active' => ['Você não pode desativar o próprio usuário enquanto está conectado.'],
            ]);
        }

        if ($authenticatedUser?->is($user) && mb_strtolower($validated['role']) !== 'administrador') {
            throw ValidationException::withMessages([
                'role' => ['Você não pode remover o próprio perfil de administrador.'],
            ]);
        }

        $isCurrentAdministrator = mb_strtolower((string) $user->role) === 'administrador';
        $willRemainActiveAdministrator = mb_strtolower($validated['role']) === 'administrador'
            && $validated['is_active'];

        if ($isCurrentAdministrator && ! $willRemainActiveAdministrator) {
            $activeAdministrators = User::query()
                ->whereRaw('LOWER(role) = ?', ['administrador'])
                ->where('is_active', true)
                ->count();

            if ($activeAdministrators <= 1) {
                throw ValidationException::withMessages([
                    'role' => ['O sistema precisa manter pelo menos um administrador ativo.'],
                ]);
            }
        }

        $attributes = $this->userAttributes($validated);

        if (! isset($validated['password']) || trim((string) $validated['password']) === '') {
            unset($attributes['password']);
        }

        $user->fill($attributes)->save();

        return response()->json([
            'message' => isset($attributes['password'])
                ? 'Usuário e nova senha atualizados com sucesso.'
                : 'Usuário atualizado com sucesso.',
            'user' => $this->userSecurityPayload($user->fresh()),
        ]);
    }

    public function updateSchedule(
        UpdateUserAccessScheduleRequest $request,
        User $user
    ): JsonResponse {
        $validated = $request->validated();

        $user->forceFill($this->scheduleAttributes($validated))->save();

        return response()->json([
            'message' => 'Horário de acesso atualizado com sucesso.',
            'user' => $this->userSecurityPayload($user->fresh()),
        ]);
    }

    public function unblock(UnblockLoginRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $username = mb_strtolower($validated['username']);
        $ipAddress = $validated['ip_address'];
        $durationMinutes = (int) $validated['duration_minutes'];

        $updated = LoginAttempt::query()
            ->whereRaw('LOWER(username) = ?', [$username])
            ->where('ip_address', $ipAddress)
            ->where('failure_reason', 'invalid_credentials')
            ->whereNotNull('blocked_until')
            ->where('blocked_until', '>', now())
            ->update(['blocked_until' => null]);

        $user = User::query()
            ->whereRaw('LOWER(username) = ?', [$username])
            ->first();

        if ($user === null) {
            return response()->json([
                'message' => $updated > 0
                    ? 'Bloqueio removido, mas não existe um usuário cadastrado com esse nome para receber a liberação temporária.'
                    : 'Nenhum bloqueio ativo ou usuário cadastrado foi encontrado.',
                'updated_records' => $updated,
                'temporary_access_until' => null,
            ]);
        }

        $temporaryAccessUntil = now()->addMinutes($durationMinutes);

        $user->forceFill([
            'temporary_access_until' => $temporaryAccessUntil,
            'temporary_access_ip' => $ipAddress,
            'temporary_access_granted_by' => $request->user()?->id,
            'temporary_access_granted_at' => now(),
        ])->save();

        return response()->json([
            'message' => sprintf(
                'Acesso liberado para @%s até %s. Durante esse período, a regra de horário será ignorada somente para o IP %s.',
                $user->username,
                $temporaryAccessUntil->format('d/m/Y H:i'),
                $ipAddress
            ),
            'updated_records' => $updated,
            'temporary_access_until' => $temporaryAccessUntil->toIso8601String(),
        ]);
    }


    /**
     * Monta uma lista única de bloqueios por credenciais e recusas atuais por
     * dia/horário. A regra de horário é reavaliada no momento da consulta para
     * não exibir registros antigos que já deixaram de bloquear o usuário.
     *
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    private function activeBlocks(): \Illuminate\Support\Collection
    {
        $credentialBlocks = LoginAttempt::query()
            ->with('user:id,name,username')
            ->where('failure_reason', 'invalid_credentials')
            ->whereNotNull('blocked_until')
            ->where('blocked_until', '>', now())
            ->latest('blocked_until')
            ->get()
            ->unique(static fn (LoginAttempt $attempt): string => $attempt->username.'|'.$attempt->ip_address)
            ->values()
            ->map(static fn (LoginAttempt $attempt): array => [
                'id' => $attempt->id,
                'user_id' => $attempt->user_id,
                'name' => $attempt->user?->name,
                'username' => $attempt->username,
                'ip_address' => $attempt->ip_address,
                'block_type' => 'invalid_credentials',
                'failed_attempt_number' => $attempt->failed_attempt_number,
                'blocked_until' => $attempt->blocked_until?->toIso8601String(),
                'next_access_at' => null,
                'attempted_at' => $attempt->attempted_at?->toIso8601String(),
                'message' => 'Bloqueado por excesso de tentativas incorretas.',
            ]);

        $credentialKeys = $credentialBlocks
            ->mapWithKeys(static fn (array $block): array => [
                mb_strtolower($block['username']).'|'.$block['ip_address'] => true,
            ]);

        $scheduleBlocks = LoginAttempt::query()
            ->with('user')
            ->whereNotNull('user_id')
            ->where('attempted_at', '>=', now()->subDays(30))
            ->latest('attempted_at')
            ->limit(1000)
            ->get()
            ->unique(static fn (LoginAttempt $attempt): string => mb_strtolower($attempt->username).'|'.$attempt->ip_address)
            ->filter(function (LoginAttempt $attempt) use ($credentialKeys): bool {
                $key = mb_strtolower($attempt->username).'|'.$attempt->ip_address;

                if ($attempt->failure_reason !== 'outside_schedule'
                    || $credentialKeys->has($key)
                    || $attempt->user === null
                    || ! $attempt->user->is_active) {
                    return false;
                }

                $evaluation = $this->accessSchedule->evaluate(
                    $attempt->user,
                    null,
                    $attempt->ip_address
                );

                return ! $evaluation['allowed'];
            })
            ->map(function (LoginAttempt $attempt): array {
                /** @var User $user */
                $user = $attempt->user;
                $evaluation = $this->accessSchedule->evaluate($user, null, $attempt->ip_address);

                return [
                    'id' => $attempt->id,
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'ip_address' => $attempt->ip_address,
                    'block_type' => 'outside_schedule',
                    'failed_attempt_number' => null,
                    'blocked_until' => null,
                    'next_access_at' => $evaluation['next_access_at'] ?? null,
                    'attempted_at' => $attempt->attempted_at?->toIso8601String(),
                    'message' => $evaluation['message'] ?? 'Usuário fora do dia ou horário permitido.',
                ];
            })
            ->values();

        return $credentialBlocks
            ->concat($scheduleBlocks)
            ->sortByDesc(static fn (array $block): string => (string) ($block['attempted_at'] ?? $block['blocked_until'] ?? ''))
            ->values();
    }

    /**
     * @param array<string, mixed> $validated
     * @return array<string, mixed>
     */
    private function userAttributes(array $validated): array
    {
        $role = (string) $validated['role'];
        $permissions = mb_strtolower($role) === 'administrador'
            ? $this->menuAccess->allPermissions()
            : array_values($validated['menu_permissions'] ?? []);

        return [
            'name' => trim((string) $validated['name']),
            'username' => $validated['username'],
            'phone' => ($validated['phone'] ?? null) !== null
                ? trim((string) $validated['phone'])
                : null,
            'is_active' => (bool) $validated['is_active'],
            'role' => $role,
            'password' => $validated['password'] ?? null,
            'theme_preference' => $validated['theme_preference'],
            'menu_permissions' => $permissions,
            ...$this->scheduleAttributes($validated),
        ];
    }

    /**
     * @param array<string, mixed> $validated
     * @return array<string, mixed>
     */
    private function scheduleAttributes(array $validated): array
    {
        $enabled = (bool) $validated['access_schedule_enabled'];

        return [
            'access_schedule_enabled' => $enabled,
            'access_start_time' => $enabled ? ($validated['access_start_time'] ?? null) : null,
            'access_end_time' => $enabled ? ($validated['access_end_time'] ?? null) : null,
            'access_days' => $enabled
                ? array_values(array_map('intval', $validated['access_days'] ?? []))
                : null,
            'saturday_access_enabled' => $enabled
                && (bool) ($validated['saturday_access_enabled'] ?? false),
            'saturday_start_time' => $enabled && (bool) ($validated['saturday_access_enabled'] ?? false)
                ? ($validated['saturday_start_time'] ?? null)
                : null,
            'saturday_end_time' => $enabled && (bool) ($validated['saturday_access_enabled'] ?? false)
                ? ($validated['saturday_end_time'] ?? null)
                : null,
            'sunday_access_enabled' => $enabled
                && (bool) ($validated['sunday_access_enabled'] ?? false),
            'sunday_start_time' => $enabled && (bool) ($validated['sunday_access_enabled'] ?? false)
                ? ($validated['sunday_start_time'] ?? null)
                : null,
            'sunday_end_time' => $enabled && (bool) ($validated['sunday_access_enabled'] ?? false)
                ? ($validated['sunday_end_time'] ?? null)
                : null,
            'access_timezone' => $validated['access_timezone'] ?? 'America/Sao_Paulo',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function userSecurityPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'phone' => $user->phone,
            'role' => $user->role,
            'is_active' => $user->is_active,
            'theme_preference' => in_array($user->theme_preference, ['light', 'dark'], true)
                ? $user->theme_preference
                : 'light',
            'menu_permissions' => $this->menuAccess->permissionsFor($user),
            'access_schedule_enabled' => $user->access_schedule_enabled,
            'access_start_time' => $this->formatTime($user->access_start_time),
            'access_end_time' => $this->formatTime($user->access_end_time),
            'access_days' => $user->access_days ?? [1, 2, 3, 4, 5],
            'access_timezone' => $user->access_timezone ?: 'America/Sao_Paulo',
            'saturday_access_enabled' => (bool) $user->saturday_access_enabled,
            'saturday_start_time' => $this->formatTime($user->saturday_start_time),
            'saturday_end_time' => $this->formatTime($user->saturday_end_time),
            'sunday_access_enabled' => (bool) $user->sunday_access_enabled,
            'sunday_start_time' => $this->formatTime($user->sunday_start_time),
            'sunday_end_time' => $this->formatTime($user->sunday_end_time),
            'temporary_access_until' => $user->temporary_access_until?->toIso8601String(),
            'temporary_access_ip' => $user->temporary_access_ip,
            'last_login_at' => $user->last_login_at?->toIso8601String(),
        ];
    }

    private function formatTime(mixed $time): ?string
    {
        if (! is_string($time) || $time === '') {
            return null;
        }

        return substr($time, 0, 5);
    }
}
