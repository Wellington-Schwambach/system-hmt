<?php

namespace App\Http\Controllers\Fleet;

use App\Http\Controllers\Controller;
use App\Models\BrazilState;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    public function states(): JsonResponse
    {
        return response()->json([
            'states' => BrazilState::query()
                ->orderBy('name')
                ->get(['id', 'abbreviation', 'name']),
        ]);
    }

    public function cities(BrazilState $state): JsonResponse
    {
        return response()->json([
            'cities' => $state->cities()
                ->orderBy('name')
                ->get(['id', 'state_id', 'name']),
        ]);
    }
}
