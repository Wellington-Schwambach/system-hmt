<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogisticsLoadStatusNote extends Model
{
    protected $fillable = [
        'logistics_load_id',
        'user_id',
        'observation',
        'is_visible',
    ];

    protected function casts(): array
    {
        return [
            'is_visible' => 'boolean',
        ];
    }

    public function logisticsLoad(): BelongsTo
    {
        return $this->belongsTo(LogisticsLoad::class, 'logistics_load_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
