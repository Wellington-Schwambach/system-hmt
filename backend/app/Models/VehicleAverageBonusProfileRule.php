<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleAverageBonusProfileRule extends Model
{
    protected $fillable = [
        'profile_id',
        'minimum_average',
        'percent',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'minimum_average' => 'decimal:3',
            'percent' => 'decimal:2',
            'position' => 'integer',
        ];
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(VehicleAverageBonusProfile::class, 'profile_id');
    }
}
