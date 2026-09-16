<?php

namespace App\Http\Controllers;

use App\Models\FuelRecord;
use App\Models\LogisticsLoad;
use App\Models\Travel;
use App\Models\User;
use App\Services\Dashboard\DailyNotesService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index(Request $request, DailyNotesService $dailyNotes): JsonResponse
    {
        $now = CarbonImmutable::now();
        $monthStart = $now->startOfMonth()->startOfDay();
        $monthEnd = $now->endOfMonth()->endOfDay();

        $travels = Travel::query()
            ->with('ctes:id,travel_id,cte_type')
            ->whereBetween('travel_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
            ->get();

        $fuelings = FuelRecord::query()
            ->whereBetween('fuel_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
            ->count();

        $loadsCount = LogisticsLoad::query()
            ->whereNotNull('loading_at')
            ->whereBetween('loading_at', [$monthStart, $monthEnd])
            ->count();

        /** @var User $user */
        $user = $request->user();

        try {
            $notePayload = $dailyNotes->dashboardPayload($user, $monthStart, $monthEnd, $now);
        } catch (\Throwable $exception) {
            // Notas/alertas são complementares ao Dashboard. Uma inconsistência ou migration
            // pendente nesse módulo não pode derrubar os indicadores principais da tela.
            Log::warning('Falha ao montar Notas do Dia do Dashboard.', [
                'user_id' => $user->id,
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);

            $notePayload = [
                'daily_notes' => [],
                'calendar_notes' => [],
                'note_counts' => [],
            ];
        }

        $noteUsers = User::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(static fn (User $noteUser): array => [
                'id' => (int) $noteUser->id,
                'name' => (string) $noteUser->name,
            ])
            ->values();

        return response()->json([
            'period' => [
                'year' => $now->year,
                'month' => $now->month,
                'key' => $now->format('Y-m'),
                'start' => $monthStart->toDateString(),
                'end' => $monthEnd->toDateString(),
            ],
            'metrics' => [
                'loads' => $loadsCount,
                'travels' => $travels->filter(fn (Travel $travel): bool => $this->countsAsTrip($travel))->count(),
                'fuelings' => $fuelings,
            ],
            'daily_notes' => $notePayload['daily_notes'],
            'calendar_notes' => $notePayload['calendar_notes'],
            'note_counts' => $notePayload['note_counts'],
            'note_users' => $noteUsers,
        ])->withHeaders([
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
        ]);
    }

    private function countsAsTrip(Travel $travel): bool
    {
        if ($travel->relationLoaded('ctes') && $travel->ctes->isNotEmpty()) {
            return $travel->ctes->contains(
                fn ($cte): bool => strtoupper((string) $cte->cte_type) === 'NORMAL'
            );
        }

        return strtoupper((string) $travel->cte_type) === 'NORMAL';
    }

}
