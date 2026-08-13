<?php

namespace App\Services\Auth;

use App\Models\User;
use Carbon\CarbonImmutable;
use DateTimeZone;
use Throwable;

class UserAccessScheduleService
{
    /**
     * Avalia a regra semanal, os horários opcionais de fim de semana e uma
     * eventual liberação temporária concedida pelo administrador.
     *
     * @return array<string, mixed>
     */
    public function evaluate(
        User $user,
        ?CarbonImmutable $now = null,
        ?string $ipAddress = null
    ): array {
        $timezone = $this->normalizeTimezone($user->access_timezone);
        $weekdays = $this->normalizeWeekdays($user->access_days);
        $weekdayStart = $this->normalizeTime($user->access_start_time);
        $weekdayEnd = $this->normalizeTime($user->access_end_time);
        $saturdayStart = $this->normalizeTime($user->saturday_start_time);
        $saturdayEnd = $this->normalizeTime($user->saturday_end_time);
        $sundayStart = $this->normalizeTime($user->sunday_start_time);
        $sundayEnd = $this->normalizeTime($user->sunday_end_time);
        $nowUtc = ($now ?? CarbonImmutable::now('UTC'))->utc();
        $temporaryAccessUntil = $user->temporary_access_until !== null
            ? CarbonImmutable::parse($user->temporary_access_until)->utc()
            : null;
        $temporaryIpMatches = $user->temporary_access_ip === null
            || ($ipAddress !== null
                && hash_equals((string) $user->temporary_access_ip, $ipAddress));

        if ($temporaryAccessUntil?->greaterThan($nowUtc) && $temporaryIpMatches) {
            return $this->payload(
                user: $user,
                allowed: true,
                enabled: true,
                timezone: $timezone,
                weekdays: $weekdays,
                weekdayStart: $weekdayStart,
                weekdayEnd: $weekdayEnd,
                saturdayStart: $saturdayStart,
                saturdayEnd: $saturdayEnd,
                sundayStart: $sundayStart,
                sundayEnd: $sundayEnd,
                currentWindowEndsAt: $temporaryAccessUntil->toIso8601String(),
                nextAccessAt: null,
                message: 'Acesso temporário liberado pelo administrador.',
                temporaryOverride: true,
                temporaryAccessUntil: $temporaryAccessUntil->toIso8601String(),
            );
        }

        $enabled = (bool) $user->access_schedule_enabled;

        if (! $enabled) {
            return $this->payload(
                user: $user,
                allowed: true,
                enabled: false,
                timezone: $timezone,
                weekdays: $weekdays,
                weekdayStart: $weekdayStart,
                weekdayEnd: $weekdayEnd,
                saturdayStart: $saturdayStart,
                saturdayEnd: $saturdayEnd,
                sundayStart: $sundayStart,
                sundayEnd: $sundayEnd,
            );
        }

        $nowLocal = $nowUtc->setTimezone($timezone);

        // O dia anterior também é verificado para turnos que atravessam a madrugada.
        foreach ([-1, 0] as $offset) {
            $date = $nowLocal->startOfDay()->addDays($offset);
            $schedule = $this->scheduleForDate(
                $user,
                $date->dayOfWeekIso,
                $weekdays,
                $weekdayStart,
                $weekdayEnd,
                $saturdayStart,
                $saturdayEnd,
                $sundayStart,
                $sundayEnd,
            );

            if ($schedule === null) {
                continue;
            }

            [$windowStart, $windowEnd] = $this->windowForDate(
                $date,
                $schedule['start_time'],
                $schedule['end_time']
            );

            if ($nowLocal->greaterThanOrEqualTo($windowStart) && $nowLocal->lessThan($windowEnd)) {
                return $this->payload(
                    user: $user,
                    allowed: true,
                    enabled: true,
                    timezone: $timezone,
                    weekdays: $weekdays,
                    weekdayStart: $weekdayStart,
                    weekdayEnd: $weekdayEnd,
                    saturdayStart: $saturdayStart,
                    saturdayEnd: $saturdayEnd,
                    sundayStart: $sundayStart,
                    sundayEnd: $sundayEnd,
                    currentWindowEndsAt: $windowEnd->utc()->toIso8601String(),
                    activeSchedule: $schedule['label'],
                );
            }
        }

        $nextAccess = $this->findNextAccess(
            $user,
            $nowLocal,
            $weekdays,
            $weekdayStart,
            $weekdayEnd,
            $saturdayStart,
            $saturdayEnd,
            $sundayStart,
            $sundayEnd,
        );
        $nextAccessText = $nextAccess?->locale('pt_BR')->translatedFormat('d/m/Y \à\s H:i');

        return $this->payload(
            user: $user,
            allowed: false,
            enabled: true,
            timezone: $timezone,
            weekdays: $weekdays,
            weekdayStart: $weekdayStart,
            weekdayEnd: $weekdayEnd,
            saturdayStart: $saturdayStart,
            saturdayEnd: $saturdayEnd,
            sundayStart: $sundayStart,
            sundayEnd: $sundayEnd,
            nextAccessAt: $nextAccess?->utc()->toIso8601String(),
            message: $nextAccessText !== null
                ? sprintf('Você está fora do horário permitido. Próximo acesso em %s.', $nextAccessText)
                : 'Nenhum horário de acesso foi configurado. Entre em contato com o administrador.',
        );
    }

    /**
     * @return array{start_time: string, end_time: string, label: string}|null
     */
    private function scheduleForDate(
        User $user,
        int $dayOfWeekIso,
        array $weekdays,
        ?string $weekdayStart,
        ?string $weekdayEnd,
        ?string $saturdayStart,
        ?string $saturdayEnd,
        ?string $sundayStart,
        ?string $sundayEnd,
    ): ?array {
        if ($dayOfWeekIso >= 1 && $dayOfWeekIso <= 5) {
            if (! in_array($dayOfWeekIso, $weekdays, true)
                || $weekdayStart === null
                || $weekdayEnd === null) {
                return null;
            }

            return [
                'start_time' => $weekdayStart,
                'end_time' => $weekdayEnd,
                'label' => 'semana',
            ];
        }

        if ($dayOfWeekIso === 6
            && $user->saturday_access_enabled
            && $saturdayStart !== null
            && $saturdayEnd !== null) {
            return [
                'start_time' => $saturdayStart,
                'end_time' => $saturdayEnd,
                'label' => 'sábado',
            ];
        }

        if ($dayOfWeekIso === 7
            && $user->sunday_access_enabled
            && $sundayStart !== null
            && $sundayEnd !== null) {
            return [
                'start_time' => $sundayStart,
                'end_time' => $sundayEnd,
                'label' => 'domingo',
            ];
        }

        return null;
    }

    /**
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    private function windowForDate(
        CarbonImmutable $date,
        string $startTime,
        string $endTime
    ): array {
        $windowStart = $date->setTimeFromTimeString($startTime);
        $windowEnd = $date->setTimeFromTimeString($endTime);

        if ($windowEnd->lessThanOrEqualTo($windowStart)) {
            $windowEnd = $windowEnd->addDay();
        }

        return [$windowStart, $windowEnd];
    }

    private function findNextAccess(
        User $user,
        CarbonImmutable $now,
        array $weekdays,
        ?string $weekdayStart,
        ?string $weekdayEnd,
        ?string $saturdayStart,
        ?string $saturdayEnd,
        ?string $sundayStart,
        ?string $sundayEnd,
    ): ?CarbonImmutable {
        for ($offset = 0; $offset <= 21; $offset++) {
            $date = $now->startOfDay()->addDays($offset);
            $schedule = $this->scheduleForDate(
                $user,
                $date->dayOfWeekIso,
                $weekdays,
                $weekdayStart,
                $weekdayEnd,
                $saturdayStart,
                $saturdayEnd,
                $sundayStart,
                $sundayEnd,
            );

            if ($schedule === null) {
                continue;
            }

            [$windowStart] = $this->windowForDate(
                $date,
                $schedule['start_time'],
                $schedule['end_time']
            );

            if ($windowStart->greaterThan($now)) {
                return $windowStart;
            }
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(
        User $user,
        bool $allowed,
        bool $enabled,
        string $timezone,
        array $weekdays,
        ?string $weekdayStart,
        ?string $weekdayEnd,
        ?string $saturdayStart,
        ?string $saturdayEnd,
        ?string $sundayStart,
        ?string $sundayEnd,
        ?string $currentWindowEndsAt = null,
        ?string $nextAccessAt = null,
        ?string $message = null,
        bool $temporaryOverride = false,
        ?string $temporaryAccessUntil = null,
        ?string $activeSchedule = null,
    ): array {
        return [
            'allowed' => $allowed,
            'enabled' => $enabled,
            'timezone' => $timezone,
            'start_time' => $weekdayStart,
            'end_time' => $weekdayEnd,
            'days' => $weekdays,
            'saturday_enabled' => (bool) $user->saturday_access_enabled,
            'saturday_start_time' => $saturdayStart,
            'saturday_end_time' => $saturdayEnd,
            'sunday_enabled' => (bool) $user->sunday_access_enabled,
            'sunday_start_time' => $sundayStart,
            'sunday_end_time' => $sundayEnd,
            'current_window_ends_at' => $currentWindowEndsAt,
            'next_access_at' => $nextAccessAt,
            'message' => $message,
            'temporary_override' => $temporaryOverride,
            'temporary_access_until' => $temporaryAccessUntil,
            'active_schedule' => $activeSchedule,
        ];
    }

    /**
     * @return array<int, int>
     */
    private function normalizeWeekdays(mixed $days): array
    {
        if (! is_array($days)) {
            return [1, 2, 3, 4, 5];
        }

        $normalized = array_values(array_unique(array_filter(
            array_map('intval', $days),
            static fn (int $day): bool => $day >= 1 && $day <= 5
        )));

        sort($normalized);

        return $normalized;
    }

    private function normalizeTime(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        $time = trim($value);

        return strlen($time) === 5 ? $time.':00' : substr($time, 0, 8);
    }

    private function normalizeTimezone(mixed $timezone): string
    {
        $candidate = is_string($timezone) && trim($timezone) !== ''
            ? trim($timezone)
            : (string) config('app.timezone', 'America/Sao_Paulo');

        try {
            new DateTimeZone($candidate);

            return $candidate;
        } catch (Throwable) {
            return 'America/Sao_Paulo';
        }
    }
}
