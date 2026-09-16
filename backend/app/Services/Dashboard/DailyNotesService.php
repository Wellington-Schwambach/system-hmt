<?php

namespace App\Services\Dashboard;

use App\Models\DailyNote;
use App\Models\DailyNoteCompletion;
use App\Models\DailyNotePreference;
use App\Models\Employee;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class DailyNotesService
{
    /** @var array<string, array{label:string, description:string, default_days:int}> */
    private const PREFERENCE_CATALOG = [
        'vehicle_expiry' => [
            'label' => 'Vencimentos de veículos',
            'description' => 'Licenciamento, tacógrafo, CRLV, Opentech e Angellira.',
            'default_days' => 10,
        ],
        'employee_expiry' => [
            'label' => 'Vencimentos de colaboradores',
            'description' => 'CNH, ASO, toxicológico, Opentech e Angellira.',
            'default_days' => 10,
        ],
        'birthday' => [
            'label' => 'Aniversários dos colaboradores',
            'description' => 'Aviso antecipado dos aniversários da equipe.',
            'default_days' => 5,
        ],
        'probation' => [
            'label' => 'Fim de experiência',
            'description' => 'Término do período de experiência e da prorrogação, quando houver.',
            'default_days' => 10,
        ],
        'vacation' => [
            'label' => 'Férias',
            'description' => 'Data de férias cadastrada no colaborador.',
            'default_days' => 15,
        ],
    ];

    /** @return array<string, array{label:string, description:string, default_days:int}> */
    public static function preferenceCatalog(): array
    {
        return self::PREFERENCE_CATALOG;
    }

    /** @return array<string, array{enabled:bool, days_before:int}> */
    public function preferencesForUser(User $user): array
    {
        // O Dashboard não pode ficar indisponível caso as migrations de Notas do Dia
        // ainda não tenham sido aplicadas. Nesse cenário usamos os padrões do sistema.
        $saved = Schema::hasTable('daily_note_preferences')
            ? ($user->relationLoaded('dailyNotePreferences')
                ? $user->dailyNotePreferences->keyBy('alert_type')
                : $user->dailyNotePreferences()->get()->keyBy('alert_type'))
            : collect();

        return collect(self::PREFERENCE_CATALOG)
            ->mapWithKeys(function (array $definition, string $type) use ($saved): array {
                /** @var DailyNotePreference|null $preference */
                $preference = $saved->get($type);

                return [
                    $type => [
                        'enabled' => $preference ? (bool) $preference->enabled : true,
                        'days_before' => $preference
                            ? (int) $preference->days_before
                            : (int) $definition['default_days'],
                    ],
                ];
            })
            ->all();
    }

    /**
     * @return array{
     *   daily_notes: array<int, array<string, mixed>>,
     *   calendar_notes: array<int, array<string, mixed>>,
     *   note_counts: array<string, int>
     * }
     */
    public function dashboardPayload(
        User $user,
        CarbonImmutable $monthStart,
        CarbonImmutable $monthEnd,
        CarbonImmutable $now
    ): array {
        $today = $now->startOfDay();
        $preferences = $this->preferencesForUser($user);
        $maxLead = collect($preferences)
            ->filter(fn (array $preference): bool => $preference['enabled'])
            ->max('days_before') ?? 0;

        $rangeStart = $monthStart->startOfDay()->min($today);
        $rangeEnd = $monthEnd->endOfDay()->max($today->addDays((int) $maxLead)->endOfDay());

        try {
            $systemEvents = $this->systemEvents($preferences, $rangeStart, $rangeEnd, $today);
        } catch (\Throwable $exception) {
            Log::warning('Falha ao montar alertas automáticos das Notas do Dia.', [
                'user_id' => $user->id,
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);
            $systemEvents = collect();
        }

        try {
            // Os alertas personalizados são carregados separadamente dos automáticos.
            // Assim, uma inconsistência em vencimentos de veículo/colaborador não pode
            // fazer os alertas criados manualmente desaparecerem do Dashboard.
            $manualEvents = $this->manualEvents($user, $today);
        } catch (\Throwable $exception) {
            Log::warning('Falha ao montar alertas personalizados das Notas do Dia.', [
                'user_id' => $user->id,
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);
            $manualEvents = collect();
        }

        try {
            [$systemEvents, $manualEvents] = $this->applyCompletions($systemEvents, $manualEvents);
        } catch (\Throwable $exception) {
            Log::warning('Falha ao aplicar conclusões das Notas do Dia.', [
                'user_id' => $user->id,
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);

            $withoutCompletion = static function (array $event): array {
                $event['is_completed'] = false;
                $event['completed_at'] = null;
                $event['completed_by_name'] = null;
                $event['can_complete'] = false;
                return $event;
            };

            $systemEvents = $systemEvents->map($withoutCompletion);
            $manualEvents = $manualEvents->map($withoutCompletion);
        }

        $dailySystem = $systemEvents
            ->filter(function (array $event): bool {
                $daysUntil = (int) ($event['_days_until'] ?? PHP_INT_MAX);
                $leadDays = (int) ($event['_lead_days'] ?? 0);

                return $daysUntil >= 0 && $daysUntil <= $leadDays;
            });

        $dailyManual = $manualEvents->filter(function (array $event) use ($today): bool {
            if (($event['due_date'] ?? null) === null) {
                return true;
            }

            $daysUntil = (int) ($event['_days_until'] ?? PHP_INT_MAX);

            if (($event['alert_type'] ?? '') === 'custom') {
                $leadDays = (int) ($event['_lead_days'] ?? 0);

                // Alertas personalizados entram quando alcançam a antecedência definida
                // e permanecem como pendência depois do vencimento até serem concluídos.
                if (($event['is_completed'] ?? false) === true && $daysUntil < 0) {
                    return false;
                }

                return $daysUntil <= $leadDays;
            }

            // Lembretes criados manualmente devem ficar visíveis assim que são criados,
            // mesmo que possuam uma data futura. Depois da data, permanecem até serem
            // concluídos. Isso evita a sensação de que o lembrete "sumiu" ao ser salvo.
            if (($event['is_completed'] ?? false) === true && $daysUntil < 0) {
                return false;
            }

            return true;
        });

        $dailyNotes = $dailySystem
            ->concat($dailyManual)
            ->sortBy(function (array $event): string {
                $due = (string) ($event['due_at'] ?? $event['due_date'] ?? '9999-12-31');
                return $due.'|'.(string) ($event['title'] ?? '');
            })
            ->values()
            ->map(fn (array $event): array => $this->stripInternalFields($event))
            ->all();

        $calendarNotes = $systemEvents
            ->concat($manualEvents)
            ->filter(function (array $event) use ($monthStart, $monthEnd): bool {
                $date = $event['due_date'] ?? null;
                if (! is_string($date) || $date === '') {
                    return false;
                }

                $eventDate = CarbonImmutable::parse($date)->startOfDay();
                return $eventDate->betweenIncluded($monthStart->startOfDay(), $monthEnd->endOfDay());
            })
            ->sortBy(fn (array $event): string => (string) ($event['due_at'] ?? $event['due_date'] ?? ''))
            ->values()
            ->map(fn (array $event): array => $this->stripInternalFields($event));

        $noteCounts = $calendarNotes
            ->groupBy('due_date')
            ->map(fn (Collection $items): int => $items->count())
            ->all();

        return [
            'daily_notes' => $dailyNotes,
            'calendar_notes' => $calendarNotes->all(),
            'note_counts' => $noteCounts,
        ];
    }

    /**
     * @param Collection<int, array<string, mixed>> $systemEvents
     * @param Collection<int, array<string, mixed>> $manualEvents
     * @return array{0: Collection<int, array<string, mixed>>, 1: Collection<int, array<string, mixed>>}
     */
    private function applyCompletions(Collection $systemEvents, Collection $manualEvents): array
    {
        $keys = $systemEvents
            ->concat($manualEvents)
            ->pluck('id')
            ->filter(fn ($key): bool => is_string($key) && $key !== '')
            ->unique()
            ->values();

        if ($keys->isEmpty()) {
            return [$systemEvents, $manualEvents];
        }

        if (! Schema::hasTable('daily_note_completions')) {
            $withoutCompletion = static function (array $event): array {
                $event['is_completed'] = false;
                $event['completed_at'] = null;
                $event['completed_by_name'] = null;
                $event['can_complete'] = false;

                return $event;
            };

            return [
                $systemEvents->map($withoutCompletion),
                $manualEvents->map($withoutCompletion),
            ];
        }

        $completions = DailyNoteCompletion::query()
            ->with('completedBy:id,name')
            ->whereIn('note_key', $keys->all())
            ->get()
            ->keyBy('note_key');

        $decorate = function (array $event) use ($completions): array {
            /** @var DailyNoteCompletion|null $completion */
            $completion = $completions->get((string) ($event['id'] ?? ''));

            $event['is_completed'] = $completion !== null;
            $event['completed_at'] = $completion?->completed_at?->toIso8601String();
            $event['completed_by_name'] = $completion?->completedBy?->name;
            $event['can_complete'] = true;

            return $event;
        };

        return [
            $systemEvents->map($decorate),
            $manualEvents->map($decorate),
        ];
    }

    /**
     * @param array<string, array{enabled:bool, days_before:int}> $preferences
     * @return Collection<int, array<string, mixed>>
     */
    private function systemEvents(
        array $preferences,
        CarbonImmutable $rangeStart,
        CarbonImmutable $rangeEnd,
        CarbonImmutable $today
    ): Collection {
        $events = collect();

        if (($preferences['vehicle_expiry']['enabled'] ?? false) === true) {
            $leadDays = (int) $preferences['vehicle_expiry']['days_before'];
            $vehicleFields = [
                'opentech_expiry_date' => 'Opentech',
                'angellira_expiry_date' => 'Angellira',
                'licensing_expiry_date' => 'licenciamento',
                'tachograph_expiry_date' => 'tacógrafo',
                'crlv_valid_until' => 'CRLV',
            ];

            Vehicle::query()
                ->where('status', 'ACTIVE')
                ->orderBy('plate')
                ->get(['id', 'fleet_number', 'plate', ...array_keys($vehicleFields)])
                ->each(function (Vehicle $vehicle) use ($events, $vehicleFields, $leadDays, $rangeStart, $rangeEnd, $today): void {
                    foreach ($vehicleFields as $field => $label) {
                        $value = $vehicle->{$field};
                        if ($value === null) {
                            continue;
                        }

                        $due = CarbonImmutable::parse($value)->startOfDay();
                        if (! $due->betweenIncluded($rangeStart, $rangeEnd)) {
                            continue;
                        }

                        $vehicleLabel = trim(($vehicle->fleet_number ? "Frota {$vehicle->fleet_number} · " : '').$vehicle->plate);
                        $events->push($this->systemEvent(
                            id: "vehicle-expiry:{$vehicle->id}:{$field}:{$due->toDateString()}",
                            alertType: 'vehicle_expiry',
                            icon: 'truck',
                            title: "Vencimento de {$label} · {$vehicle->plate}",
                            observation: "{$vehicleLabel}: {$label} vence em {$due->format('d/m/Y')}.",
                            due: $due,
                            source: $vehicleLabel,
                            leadDays: $leadDays,
                            today: $today,
                        ));
                    }
                });
        }

        $needsEmployees = collect(['employee_expiry', 'birthday', 'probation', 'vacation'])
            ->contains(fn (string $type): bool => ($preferences[$type]['enabled'] ?? false) === true);

        if (! $needsEmployees) {
            return $events;
        }

        $employeeFields = [
            'cnh_expiry_date' => 'CNH',
            'aso_expiry_date' => 'ASO',
            'opentech_expiry_date' => 'Opentech',
            'angellira_expiry_date' => 'Angellira',
            'toxicological_expiry_date' => 'toxicológico',
        ];

        Employee::query()
            ->where('status', 'ACTIVE')
            ->orderBy('full_name')
            ->get([
                'id',
                'full_name',
                'birth_date',
                'probation_end_date',
                'probation_extension_end_date',
                'vacation_date',
                ...array_keys($employeeFields),
            ])
            ->each(function (Employee $employee) use (
                $events,
                $employeeFields,
                $preferences,
                $rangeStart,
                $rangeEnd,
                $today
            ): void {
                if (($preferences['employee_expiry']['enabled'] ?? false) === true) {
                    $leadDays = (int) $preferences['employee_expiry']['days_before'];
                    foreach ($employeeFields as $field => $label) {
                        $value = $employee->{$field};
                        if ($value === null) {
                            continue;
                        }

                        $due = CarbonImmutable::parse($value)->startOfDay();
                        if (! $due->betweenIncluded($rangeStart, $rangeEnd)) {
                            continue;
                        }

                        $events->push($this->systemEvent(
                            id: "employee-expiry:{$employee->id}:{$field}:{$due->toDateString()}",
                            alertType: 'employee_expiry',
                            icon: 'clipboard',
                            title: "Vencimento de {$label} · {$employee->full_name}",
                            observation: "{$label} de {$employee->full_name} vence em {$due->format('d/m/Y')}.",
                            due: $due,
                            source: $employee->full_name,
                            leadDays: $leadDays,
                            today: $today,
                        ));
                    }
                }

                if (($preferences['birthday']['enabled'] ?? false) === true && $employee->birth_date !== null) {
                    $leadDays = (int) $preferences['birthday']['days_before'];
                    $birth = CarbonImmutable::parse($employee->birth_date);
                    foreach (range($rangeStart->year, $rangeEnd->year) as $year) {
                        $lastDay = CarbonImmutable::create($year, $birth->month, 1)->daysInMonth;
                        $birthday = CarbonImmutable::create($year, $birth->month, min($birth->day, $lastDay))->startOfDay();
                        if (! $birthday->betweenIncluded($rangeStart, $rangeEnd)) {
                            continue;
                        }

                        $events->push($this->systemEvent(
                            id: "birthday:{$employee->id}:{$birthday->toDateString()}",
                            alertType: 'birthday',
                            icon: 'cake',
                            title: "Aniversário · {$employee->full_name}",
                            observation: "Aniversário de {$employee->full_name} em {$birthday->format('d/m/Y')}.",
                            due: $birthday,
                            source: $employee->full_name,
                            leadDays: $leadDays,
                            today: $today,
                        ));
                    }
                }

                if (($preferences['probation']['enabled'] ?? false) === true) {
                    $leadDays = (int) $preferences['probation']['days_before'];
                    $probationDates = [
                        'probation_end_date' => 'Fim da experiência',
                        'probation_extension_end_date' => 'Fim da prorrogação da experiência',
                    ];

                    foreach ($probationDates as $field => $label) {
                        $value = $employee->{$field};
                        if ($value === null) {
                            continue;
                        }

                        $due = CarbonImmutable::parse($value)->startOfDay();
                        if (! $due->betweenIncluded($rangeStart, $rangeEnd)) {
                            continue;
                        }

                        $events->push($this->systemEvent(
                            id: "probation:{$employee->id}:{$field}:{$due->toDateString()}",
                            alertType: 'probation',
                            icon: 'clock',
                            title: "{$label} · {$employee->full_name}",
                            observation: "{$label} de {$employee->full_name} em {$due->format('d/m/Y')}.",
                            due: $due,
                            source: $employee->full_name,
                            leadDays: $leadDays,
                            today: $today,
                        ));
                    }
                }

                if (($preferences['vacation']['enabled'] ?? false) === true && $employee->vacation_date !== null) {
                    $leadDays = (int) $preferences['vacation']['days_before'];
                    $due = CarbonImmutable::parse($employee->vacation_date)->startOfDay();
                    if ($due->betweenIncluded($rangeStart, $rangeEnd)) {
                        $events->push($this->systemEvent(
                            id: "vacation:{$employee->id}:{$due->toDateString()}",
                            alertType: 'vacation',
                            icon: 'calendar',
                            title: "Férias · {$employee->full_name}",
                            observation: "Férias de {$employee->full_name} previstas para {$due->format('d/m/Y')}.",
                            due: $due,
                            source: $employee->full_name,
                            leadDays: $leadDays,
                            today: $today,
                        ));
                    }
                }
            });

        return $events;
    }

    /** @return Collection<int, array<string, mixed>> */
    private function manualEvents(User $user, CarbonImmutable $today): Collection
    {
        if (! Schema::hasTable('daily_notes') || ! Schema::hasTable('daily_note_recipients')) {
            return collect();
        }

        $hasNoteType = Schema::hasColumn('daily_notes', 'note_type');
        $hasDaysBefore = Schema::hasColumn('daily_notes', 'days_before');
        $hasIsActive = Schema::hasColumn('daily_notes', 'is_active');
        $hasDeletedAt = Schema::hasColumn('daily_notes', 'deleted_at');

        /*
         * Consulta direta pelo vínculo de destinatário.
         *
         * Esta parte é propositalmente independente dos relacionamentos Eloquent. O módulo já
         * passou por mais de uma evolução de schema (lembretes -> alertas personalizados ->
         * conclusão), e uma exceção em eager loading/casts fazia somente as notas gravadas no
         * banco sumirem enquanto os alertas automáticos continuavam normais. Aqui a regra de
         * visibilidade fica explícita: se existe daily_note_recipients para o usuário, a nota é
         * carregada. Depois decidimos apenas quando ela entra no card/calendário.
         */
        $query = DB::table('daily_notes as note')
            ->join('daily_note_recipients as recipient', function ($join) use ($user): void {
                $join->on('recipient.daily_note_id', '=', 'note.id')
                    ->where('recipient.user_id', '=', (int) $user->id);
            })
            ->leftJoin('users as creator', 'creator.id', '=', 'note.created_by');

        if ($hasDeletedAt) {
            $query->whereNull('note.deleted_at');
        }

        if ($hasIsActive) {
            $query->where('note.is_active', true);
        }

        $select = [
            'note.id',
            'note.title',
            'note.observation',
            'note.scheduled_at',
            'note.created_by',
            'creator.name as creator_name',
        ];

        if ($hasNoteType) {
            $select[] = 'note.note_type';
        }
        if ($hasDaysBefore) {
            $select[] = 'note.days_before';
        }
        if ($hasIsActive) {
            $select[] = 'note.is_active';
        }

        $timezone = (string) config('app.timezone', 'America/Sao_Paulo');

        return $query
            ->select($select)
            ->orderByRaw('CASE WHEN note.scheduled_at IS NULL THEN 0 ELSE 1 END')
            ->orderBy('note.scheduled_at')
            ->orderBy('note.id')
            ->get()
            ->map(function (object $row) use ($today, $hasNoteType, $hasDaysBefore, $timezone, $user): array {
                $scheduled = null;
                if ($row->scheduled_at !== null && (string) $row->scheduled_at !== '') {
                    $scheduled = CarbonImmutable::parse((string) $row->scheduled_at, $timezone);
                }

                $noteType = $hasNoteType ? mb_strtolower(trim((string) ($row->note_type ?? 'manual'))) : 'manual';
                if (! in_array($noteType, ['manual', 'custom'], true)) {
                    $noteType = 'manual';
                }

                $daysBefore = $hasDaysBefore ? (int) ($row->days_before ?? 0) : 0;
                $daysBefore = max(0, min(365, $daysBefore));

                return [
                    'id' => 'manual:'.(int) $row->id,
                    'manual_note_id' => (int) $row->id,
                    'alert_type' => $noteType,
                    'icon' => $noteType === 'custom' ? 'calendar' : 'note',
                    'title' => trim((string) $row->title),
                    'observation' => trim((string) $row->observation),
                    'due_date' => $scheduled?->toDateString(),
                    'due_at' => $scheduled?->toIso8601String(),
                    'source' => trim((string) ($row->creator_name ?? '')) ?: 'Sistema',
                    'is_manual' => true,
                    'can_delete' => $noteType === 'manual' && (
                        (int) $row->created_by === (int) $user->id
                        || mb_strtolower(trim((string) $user->role)) === 'administrador'
                    ),
                    '_lead_days' => $noteType === 'custom' ? $daysBefore : 0,
                    '_days_until' => $scheduled
                        ? $today->diffInDays($scheduled->startOfDay(), false)
                        : 0,
                ];
            })
            ->values();
    }

    /** @return array<string, mixed> */
    private function systemEvent(
        string $id,
        string $alertType,
        string $icon,
        string $title,
        string $observation,
        CarbonImmutable $due,
        string $source,
        int $leadDays,
        CarbonImmutable $today
    ): array {
        return [
            'id' => $id,
            'alert_type' => $alertType,
            'icon' => $icon,
            'title' => $title,
            'observation' => $observation,
            'due_date' => $due->toDateString(),
            'due_at' => $due->toDateString().'T00:00:00',
            'source' => $source,
            'is_manual' => false,
            'can_delete' => false,
            '_lead_days' => $leadDays,
            '_days_until' => $today->diffInDays($due, false),
        ];
    }

    /** @param array<string, mixed> $event
     * @return array<string, mixed>
     */
    private function stripInternalFields(array $event): array
    {
        unset($event['_lead_days'], $event['_days_until']);
        return $event;
    }
}
