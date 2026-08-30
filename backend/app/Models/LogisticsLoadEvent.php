<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogisticsLoadEvent extends Model
{
    public const ACTION_CREATED = 'CREATED';
    public const ACTION_UPDATED = 'UPDATED';
    public const ACTION_STAGE_CHANGED = 'STAGE_CHANGED';
    public const ACTION_FINALIZED = 'FINALIZED';
    public const ACTION_DELETED = 'DELETED';

    protected $fillable = [
        'logistics_load_id',
        'action',
        'from_stage',
        'to_stage',
        'details',
        'occurred_at',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'details' => 'array',
            'occurred_at' => 'immutable_datetime',
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
