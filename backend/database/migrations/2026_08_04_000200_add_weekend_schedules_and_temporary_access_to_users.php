<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('saturday_access_enabled')->default(false);
            $table->time('saturday_start_time')->nullable();
            $table->time('saturday_end_time')->nullable();
            $table->boolean('sunday_access_enabled')->default(false);
            $table->time('sunday_start_time')->nullable();
            $table->time('sunday_end_time')->nullable();
            $table->timestampTz('temporary_access_until')->nullable()->index();
            $table->string('temporary_access_ip', 45)->nullable();
            $table->foreignId('temporary_access_granted_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestampTz('temporary_access_granted_at')->nullable();
        });

        DB::table('users')
            ->select(['id', 'access_schedule_enabled', 'access_days', 'access_start_time', 'access_end_time'])
            ->orderBy('id')
            ->get()
            ->each(function (object $user): void {
                $days = $this->decodeDays($user->access_days ?? null);
                $weekdays = array_values(array_filter(
                    $days,
                    static fn (int $day): bool => $day >= 1 && $day <= 5
                ));

                if ($weekdays === []
                    && (bool) $user->access_schedule_enabled
                    && $user->access_start_time !== null
                    && $user->access_end_time !== null) {
                    $weekdays = [1, 2, 3, 4, 5];
                }

                $updates = [];

                if (in_array(6, $days, true)) {
                    $updates['saturday_access_enabled'] = true;
                    $updates['saturday_start_time'] = $user->access_start_time;
                    $updates['saturday_end_time'] = $user->access_end_time;
                }

                if (in_array(7, $days, true)) {
                    $updates['sunday_access_enabled'] = true;
                    $updates['sunday_start_time'] = $user->access_start_time;
                    $updates['sunday_end_time'] = $user->access_end_time;
                }

                if ($updates !== []) {
                    DB::table('users')->where('id', $user->id)->update($updates);
                }

                $weekdaysJson = json_encode($weekdays, JSON_THROW_ON_ERROR);

                if (DB::getDriverName() === 'pgsql') {
                    DB::statement(
                        'UPDATE users SET access_days = CAST(? AS JSON) WHERE id = ?',
                        [$weekdaysJson, $user->id]
                    );
                } else {
                    DB::table('users')->where('id', $user->id)->update([
                        'access_days' => $weekdaysJson,
                    ]);
                }
            });

        // Registros de horário antigos não devem ser interpretados como bloqueio por senha.
        DB::table('login_attempts')
            ->where(function ($query): void {
                $query->whereNull('failure_reason')
                    ->orWhere('failure_reason', '<>', 'invalid_credentials');
            })
            ->update(['blocked_until' => null]);
    }

    public function down(): void
    {
        DB::table('users')
            ->select([
                'id',
                'access_days',
                'saturday_access_enabled',
                'sunday_access_enabled',
            ])
            ->orderBy('id')
            ->get()
            ->each(function (object $user): void {
                $days = $this->decodeDays($user->access_days ?? null);

                if ((bool) $user->saturday_access_enabled) {
                    $days[] = 6;
                }

                if ((bool) $user->sunday_access_enabled) {
                    $days[] = 7;
                }

                $days = array_values(array_unique($days));
                sort($days);

                $daysJson = json_encode($days, JSON_THROW_ON_ERROR);

                if (DB::getDriverName() === 'pgsql') {
                    DB::statement(
                        'UPDATE users SET access_days = CAST(? AS JSON) WHERE id = ?',
                        [$daysJson, $user->id]
                    );
                } else {
                    DB::table('users')->where('id', $user->id)->update([
                        'access_days' => $daysJson,
                    ]);
                }
            });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropForeign(['temporary_access_granted_by']);
            $table->dropColumn([
                'saturday_access_enabled',
                'saturday_start_time',
                'saturday_end_time',
                'sunday_access_enabled',
                'sunday_start_time',
                'sunday_end_time',
                'temporary_access_until',
                'temporary_access_ip',
                'temporary_access_granted_by',
                'temporary_access_granted_at',
            ]);
        });
    }

    /**
     * @return array<int, int>
     */
    private function decodeDays(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_map('intval', $value));
        }

        if (! is_string($value) || trim($value) === '') {
            return [];
        }

        $decoded = json_decode($value, true);

        return is_array($decoded)
            ? array_values(array_map('intval', $decoded))
            : [];
    }
};
