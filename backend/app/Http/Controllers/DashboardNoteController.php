<?php

namespace App\Http\Controllers;

use App\Models\DailyNote;
use App\Models\DailyNoteCompletion;
use App\Models\User;
use App\Services\Dashboard\DailyNotesService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class DashboardNoteController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        abort_unless(
            Schema::hasTable('daily_notes') && Schema::hasTable('daily_note_recipients'),
            503,
            'As tabelas de Notas do Dia ainda não foram criadas. Execute php artisan migrate.'
        );

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'observation' => ['required', 'string', 'max:4000'],
            'scheduled_at' => ['nullable', 'date'],
            'recipient_ids' => ['required', 'array', 'min:1'],
            'recipient_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('users', 'id')->where(fn ($query) => $query->where('is_active', true)),
            ],
        ]);

        $attributes = [
            'title' => trim((string) $validated['title']),
            'observation' => trim((string) $validated['observation']),
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'created_by' => $request->user()->id,
        ];

        // Preenche explicitamente os campos novos quando a migration já estiver aplicada,
        // sem depender apenas dos defaults do PostgreSQL.
        if (Schema::hasColumn('daily_notes', 'note_type')) {
            $attributes['note_type'] = 'manual';
        }
        if (Schema::hasColumn('daily_notes', 'days_before')) {
            $attributes['days_before'] = 0;
        }
        if (Schema::hasColumn('daily_notes', 'is_active')) {
            $attributes['is_active'] = true;
        }

        $note = DB::transaction(function () use ($attributes, $validated): DailyNote {
            $created = DailyNote::query()->create($attributes);
            $created->recipients()->sync(array_values(array_map('intval', $validated['recipient_ids'])));

            return $created;
        });

        return response()->json([
            'message' => 'Nota cadastrada com sucesso.',
            'note' => [
                'id' => $note->id,
                'title' => $note->title,
            ],
        ], 201);
    }


    public function setCompletion(Request $request, DailyNotesService $dailyNotes): JsonResponse
    {
        abort_unless(
            Schema::hasTable('daily_note_completions'),
            503,
            'A tabela de conclusão das Notas do Dia ainda não foi criada. Execute php artisan migrate.'
        );

        $validated = $request->validate([
            'note_key' => ['required', 'string', 'max:255'],
            'completed' => ['required', 'boolean'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $now = CarbonImmutable::now();
        $payload = $dailyNotes->dashboardPayload(
            $user,
            $now->startOfMonth()->startOfDay(),
            $now->endOfMonth()->endOfDay(),
            $now,
        );

        $noteKey = (string) $validated['note_key'];
        $visibleNote = collect($payload['daily_notes'])
            ->concat($payload['calendar_notes'])
            ->first(fn (array $note): bool => (string) ($note['id'] ?? '') === $noteKey);

        abort_unless($visibleNote !== null, 404, 'Esta nota não está disponível para o usuário atual.');

        if ((bool) $validated['completed']) {
            $completion = DailyNoteCompletion::query()->updateOrCreate(
                ['note_key' => $noteKey],
                [
                    'completed_by' => $user->id,
                    'completed_at' => $now,
                ],
            );

            return response()->json([
                'message' => 'Nota marcada como concluída.',
                'completion' => [
                    'note_key' => $noteKey,
                    'is_completed' => true,
                    'completed_at' => $completion->completed_at?->toIso8601String(),
                    'completed_by_name' => (string) $user->name,
                ],
            ]);
        }

        DailyNoteCompletion::query()->where('note_key', $noteKey)->delete();

        return response()->json([
            'message' => 'Conclusão removida.',
            'completion' => [
                'note_key' => $noteKey,
                'is_completed' => false,
                'completed_at' => null,
                'completed_by_name' => null,
            ],
        ]);
    }

    public function destroy(Request $request, DailyNote $dailyNote): JsonResponse
    {
        if (Schema::hasColumn('daily_notes', 'note_type')) {
            abort_if(
                mb_strtolower(trim((string) $dailyNote->note_type)) === 'custom',
                422,
                'Alertas personalizados devem ser gerenciados em Segurança > Alertas e notas.'
            );
        }

        /** @var User $user */
        $user = $request->user();
        $isAdmin = mb_strtolower((string) $user->role) === 'administrador';

        abort_unless($isAdmin || (int) $dailyNote->created_by === (int) $user->id, 403, 'Você não pode excluir esta nota.');

        DB::transaction(function () use ($dailyNote): void {
            if (Schema::hasTable('daily_note_completions')) {
                DailyNoteCompletion::query()->where('note_key', 'manual:'.$dailyNote->id)->delete();
            }
            $dailyNote->delete();
        });

        return response()->json(['message' => 'Nota removida com sucesso.']);
    }
}
