<?php

namespace App\Services\Auth;

use App\Models\LoginAttempt;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;

class LoginSecurityService
{
    public function activeBlock(string $username, string $ipAddress): ?LoginAttempt
    {
        return LoginAttempt::query()
            ->where('username', $username)
            ->where('ip_address', $ipAddress)
            ->where('failure_reason', 'invalid_credentials')
            ->whereNotNull('blocked_until')
            ->where('blocked_until', '>', now())
            ->latest('blocked_until')
            ->first();
    }

    public function recordInvalidCredentials(
        Request $request,
        string $username,
        ?User $user
    ): LoginAttempt {
        $now = CarbonImmutable::now();
        $windowMinutes = (int) config('hmt.security.login_attempt_window_minutes', 15);
        $maxAttempts = (int) config('hmt.security.max_failed_login_attempts', 10);
        $blockMinutes = (int) config('hmt.security.login_block_minutes', 30);
        $ipAddress = $this->ipAddress($request);
        $windowStart = $now->subMinutes($windowMinutes);

        $latestSuccess = LoginAttempt::query()
            ->where('username', $username)
            ->where('ip_address', $ipAddress)
            ->where('was_successful', true)
            ->latest('attempted_at')
            ->value('attempted_at');

        if ($latestSuccess !== null) {
            $latestSuccessAt = CarbonImmutable::parse((string) $latestSuccess);

            if ($latestSuccessAt->greaterThan($windowStart)) {
                $windowStart = $latestSuccessAt;
            }
        }

        $failedAttemptNumber = LoginAttempt::query()
            ->where('username', $username)
            ->where('ip_address', $ipAddress)
            ->where('was_successful', false)
            ->where('failure_reason', 'invalid_credentials')
            ->where('attempted_at', '>=', $windowStart)
            ->count() + 1;

        $blockedUntil = $failedAttemptNumber >= $maxAttempts
            ? $now->addMinutes($blockMinutes)
            : null;

        return LoginAttempt::query()->create([
            'user_id' => $user?->id,
            'username' => $username,
            'ip_address' => $ipAddress,
            'user_agent' => $request->userAgent(),
            'was_successful' => false,
            'failure_reason' => 'invalid_credentials',
            'failed_attempt_number' => $failedAttemptNumber,
            'blocked_until' => $blockedUntil,
            'attempted_at' => $now,
            'metadata' => [
                'route' => $request->path(),
                'method' => $request->method(),
            ],
        ]);
    }

    public function recordDenied(
        Request $request,
        string $username,
        ?User $user,
        string $reason,
        ?string $blockedUntil = null,
        array $metadata = []
    ): LoginAttempt {
        return LoginAttempt::query()->create([
            'user_id' => $user?->id,
            'username' => $username,
            'ip_address' => $this->ipAddress($request),
            'user_agent' => $request->userAgent(),
            'was_successful' => false,
            'failure_reason' => $reason,
            'blocked_until' => $blockedUntil,
            'attempted_at' => now(),
            'metadata' => [
                'route' => $request->path(),
                'method' => $request->method(),
                ...$metadata,
            ],
        ]);
    }

    public function recordSuccess(Request $request, User $user): LoginAttempt
    {
        return LoginAttempt::query()->create([
            'user_id' => $user->id,
            'username' => $user->username,
            'ip_address' => $this->ipAddress($request),
            'user_agent' => $request->userAgent(),
            'was_successful' => true,
            'attempted_at' => now(),
            'metadata' => [
                'route' => $request->path(),
                'method' => $request->method(),
            ],
        ]);
    }

    private function ipAddress(Request $request): string
    {
        return (string) ($request->ip() ?: '0.0.0.0');
    }
}
