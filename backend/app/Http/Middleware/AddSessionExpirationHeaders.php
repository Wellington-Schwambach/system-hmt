<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AddSessionExpirationHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $request->routeIs('auth.logout') && Auth::guard('web')->check()) {
            $lifetimeMinutes = (int) config('session.lifetime', 120);
            $expiresAt = now()->addMinutes($lifetimeMinutes)->toIso8601String();

            $response->headers->set('X-Session-Expires-At', $expiresAt);
            $response->headers->set('X-Session-Lifetime-Minutes', (string) $lifetimeMinutes);
        }

        return $response;
    }
}
