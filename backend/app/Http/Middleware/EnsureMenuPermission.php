<?php

namespace App\Http\Middleware;

use App\Services\Access\UserMenuAccessService;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMenuPermission
{
    public function __construct(private readonly UserMenuAccessService $access)
    {
    }

    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if ($user === null || ! $this->access->can($user, $permission)) {
            return new JsonResponse([
                'message' => 'Seu usuário não possui permissão para acessar este recurso.',
                'code' => 'ACCESS_PERMISSION_DENIED',
                'permission' => $permission,
            ], 403);
        }

        return $next($request);
    }
}
