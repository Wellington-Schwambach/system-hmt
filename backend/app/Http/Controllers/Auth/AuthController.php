<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Requests\Auth\UpdateThemePreferenceRequest;
use App\Models\User;
use App\Services\Access\UserMenuAccessService;
use App\Services\Auth\LoginSecurityService;
use App\Services\Auth\UserAccessScheduleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private readonly LoginSecurityService $loginSecurity,
        private readonly UserAccessScheduleService $accessSchedule,
        private readonly UserMenuAccessService $menuAccess
    ) {
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $username = $validated['username'];
        $ipAddress = (string) ($request->ip() ?: '0.0.0.0');
        $activeBlock = $this->loginSecurity->activeBlock($username, $ipAddress);

        if ($activeBlock !== null) {
            $retryAfter = max(1, (int) now()->diffInSeconds($activeBlock->blocked_until));

            return response()->json([
                'message' => 'Acesso temporariamente bloqueado por excesso de tentativas incorretas. Solicite a liberação ao administrador ou aguarde o término do bloqueio.',
                'code' => 'LOGIN_TEMPORARILY_BLOCKED',
                'blocked_until' => $activeBlock->blocked_until?->toIso8601String(),
                'retry_after_seconds' => $retryAfter,
            ], 429)->header('Retry-After', (string) $retryAfter);
        }

        $user = User::query()
            ->whereRaw('LOWER(username) = ?', [$username])
            ->first();

        if ($user === null || ! Hash::check($validated['password'], $user->password)) {
            $attempt = $this->loginSecurity->recordInvalidCredentials($request, $username, $user);

            if ($attempt->blocked_until !== null) {
                $retryAfter = max(1, (int) now()->diffInSeconds($attempt->blocked_until));

                return response()->json([
                    'message' => 'Acesso temporariamente bloqueado por excesso de tentativas incorretas. O administrador pode liberar este usuário por um período determinado.',
                    'code' => 'LOGIN_TEMPORARILY_BLOCKED',
                    'blocked_until' => $attempt->blocked_until->toIso8601String(),
                    'retry_after_seconds' => $retryAfter,
                ], 429)->header('Retry-After', (string) $retryAfter);
            }

            throw ValidationException::withMessages([
                'username' => ['Usuário ou senha inválidos.'],
            ]);
        }

        if (! $user->is_active) {
            $this->loginSecurity->recordDenied(
                $request,
                $username,
                $user,
                'inactive_user'
            );

            return response()->json([
                'message' => 'Este usuário está inativo. Entre em contato com o administrador.',
                'code' => 'USER_INACTIVE',
            ], 403);
        }

        $schedule = $this->accessSchedule->evaluate($user, null, $ipAddress);

        if (! $schedule['allowed']) {
            $this->loginSecurity->recordDenied(
                $request,
                $username,
                $user,
                'outside_schedule',
                null,
                [
                    'schedule' => $schedule,
                    'next_access_at' => $schedule['next_access_at'],
                ]
            );

            return response()->json([
                'message' => $schedule['message'],
                'code' => 'ACCESS_OUTSIDE_SCHEDULE',
                'next_access_at' => $schedule['next_access_at'],
                'schedule' => $schedule,
            ], 423);
        }

        if (Hash::needsRehash($user->password)) {
            $user->forceFill([
                'password' => $validated['password'],
            ])->save();
        }

        Auth::guard('web')->login($user, (bool) ($validated['remember'] ?? false));
        $request->session()->regenerate();

        $user->forceFill([
            'last_login_at' => now(),
        ])->save();

        $this->loginSecurity->recordSuccess($request, $user);

        return response()->json([
            'message' => 'Login realizado com sucesso.',
            'user' => $this->userPayload($user, $ipAddress),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'user' => $this->userPayload($user, (string) ($request->ip() ?: '0.0.0.0')),
        ]);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $user->forceFill([
            'password' => $request->validated('password'),
            'remember_token' => null,
        ])->save();

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Senha alterada com sucesso.',
        ]);
    }

    public function updateTheme(UpdateThemePreferenceRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->forceFill([
            'theme_preference' => $request->validated('theme_preference'),
        ])->save();

        return response()->json([
            'message' => 'Tema atualizado com sucesso.',
            'user' => $this->userPayload(
                $user->fresh(),
                (string) ($request->ip() ?: '0.0.0.0')
            ),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Sessão encerrada com sucesso.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function userPayload(User $user, ?string $ipAddress = null): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'role' => $user->role,
            'theme_preference' => in_array($user->theme_preference, ['light', 'dark'], true)
                ? $user->theme_preference
                : 'light',
            'permissions' => $this->menuAccess->permissionsFor($user),
            'access' => $this->accessSchedule->evaluate($user, null, $ipAddress),
        ];
    }
}
