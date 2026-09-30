<?php

namespace App\Http\Controllers\Operation;

use App\Http\Controllers\Controller;
use App\Models\Travel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ThirdPartyManagementController extends Controller
{
    public function index(): JsonResponse
    {
        $records = Travel::query()
            ->with('ctes:id,travel_id,cte_number,cte_type')
            ->where('operation_type', 'THIRD_PARTY')
            ->orderBy('third_party_name')
            ->orderBy('travel_date')
            ->orderBy('id')
            ->get()
            ->map(fn (Travel $travel): array => $this->payload($travel));

        return response()->json(['records' => $records]);
    }

    public function update(Request $request, Travel $travel): JsonResponse
    {
        $this->ensureThirdParty($travel);

        $validated = $request->validate([
            'payment_type' => ['nullable', Rule::in(['ADVANCE', 'BALANCE'])],
            'counter_freight_number' => ['nullable', 'string', 'max:60'],
            'payout_date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $travel->forceFill([
            'third_party_payment_type' => $validated['payment_type'] ?? null,
            'third_party_counter_freight_number' => $this->nullableTrim($validated['counter_freight_number'] ?? null),
            'third_party_payout_date' => $validated['payout_date'] ?? null,
            'updated_by' => $request->user()?->id,
        ])->save();

        $travel->load('ctes:id,travel_id,cte_number,cte_type');

        return response()->json([
            'message' => 'Dados do repasse atualizados.',
            'record' => $this->payload($travel),
        ]);
    }

    public function markPaid(Request $request, Travel $travel): JsonResponse
    {
        $this->ensureThirdParty($travel);

        if ($travel->third_party_paid_at === null) {
            $travel->forceFill([
                'third_party_paid_at' => now(),
                'third_party_paid_by' => $request->user()?->id,
                'third_party_payout_date' => $travel->third_party_payout_date?->format('Y-m-d') ?? now()->toDateString(),
                'updated_by' => $request->user()?->id,
            ])->save();
        }

        $travel->load('ctes:id,travel_id,cte_number,cte_type');

        return response()->json([
            'message' => 'Repasse marcado como pago.',
            'record' => $this->payload($travel),
        ]);
    }

    private function ensureThirdParty(Travel $travel): void
    {
        if (strtoupper((string) $travel->operation_type) !== 'THIRD_PARTY') {
            throw ValidationException::withMessages([
                'travel' => ['Somente viagens de terceiros podem ser administradas nesta tela.'],
            ]);
        }
    }

    private function nullableTrim(?string $value): ?string
    {
        $trimmed = trim((string) $value);
        return $trimmed === '' ? null : $trimmed;
    }

    /** @return array<string, mixed> */
    private function payload(Travel $travel): array
    {
        $cteNumbers = $travel->relationLoaded('ctes') && $travel->ctes->isNotEmpty()
            ? $travel->ctes->pluck('cte_number')->filter()->implode(' / ')
            : (string) $travel->cte_number;

        return [
            'id' => (int) $travel->id,
            'travel_date' => $travel->travel_date?->format('Y-m-d'),
            'cte_numbers' => $cteNumbers,
            'origin' => $travel->origin,
            'destination' => $travel->destination,
            'third_party_name' => $travel->third_party_name,
            'third_party_plate' => $travel->third_party_plate,
            'payment_type' => $travel->third_party_payment_type,
            'payout_amount' => (float) $travel->third_party_payout_amount,
            'counter_freight_number' => $travel->third_party_counter_freight_number,
            'payout_date' => $travel->third_party_payout_date?->format('Y-m-d'),
            'paid' => $travel->third_party_paid_at !== null,
            'paid_at' => $travel->third_party_paid_at?->toIso8601String(),
            'gross_freight' => (float) $travel->gross_freight,
        ];
    }
}
