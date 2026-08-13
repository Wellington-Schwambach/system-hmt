<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Proteção contra rajadas automatizadas. O bloqueio de negócio após
        // 10 credenciais erradas é controlado e auditado pelo LoginSecurityService.
        RateLimiter::for('login', function (Request $request): Limit {
            return Limit::perMinute(30)->by((string) ($request->ip() ?: '0.0.0.0'));
        });
    }
}
