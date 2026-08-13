<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('api/auth')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware(['throttle:login', 'session.expiration'])
        ->name('auth.login');

    Route::middleware(['auth:sanctum', 'access.schedule', 'session.expiration'])->group(function (): void {
        Route::get('/me', [AuthController::class, 'me'])
            ->name('auth.me');

        Route::put('/theme', [AuthController::class, 'updateTheme'])
            ->name('auth.theme');

        Route::put('/password', [AuthController::class, 'updatePassword'])
            ->name('auth.password');

        Route::post('/logout', [AuthController::class, 'logout'])
            ->name('auth.logout');
    });
});
