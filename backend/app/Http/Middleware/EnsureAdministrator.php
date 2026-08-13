<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdministrator
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || strtolower((string) $user->role) !== 'administrador') {
            return new JsonResponse([
                'message' => 'Apenas administradores podem acessar esta área.',
                'code' => 'ADMIN_REQUIRED',
            ], 403);
        }

        return $next($request);
    }
}
