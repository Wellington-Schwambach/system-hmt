<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\Auth\LoginSecurityService;
use App\Services\Auth\UserAccessScheduleService;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserAccessSchedule
{
    public function __construct(
        private readonly UserAccessScheduleService $accessSchedule,
        private readonly LoginSecurityService $loginSecurity
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user === null) {
            return $next($request);
        }

        $evaluation = $this->accessSchedule->evaluate(
            $user,
            null,
            (string) ($request->ip() ?: '0.0.0.0')
        );

        if ($evaluation['allowed']) {
            return $next($request);
        }

        $this->loginSecurity->recordDenied(
            $request,
            $user->username,
            $user,
            'outside_schedule',
            null,
            [
                'schedule' => $evaluation,
                'next_access_at' => $evaluation['next_access_at'],
            ]
        );

        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return new JsonResponse([
            'message' => $evaluation['message'],
            'code' => 'ACCESS_OUTSIDE_SCHEDULE',
            'next_access_at' => $evaluation['next_access_at'],
            'schedule' => $evaluation,
        ], 423);
    }
}
