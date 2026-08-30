<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FuelRecordEvent extends Model
{
    public const ACTION_UPDATED = 'UPDATED';
    public const ACTION_DELETED = 'DELETED';
    public const ACTION_RESTORED = 'RESTORED';

    protected $fillable = ['fuel_record_id', 'action', 'before_data', 'after_data', 'user_id', 'occurred_at'];

    protected function casts(): array
    {
        return ['before_data' => 'array', 'after_data' => 'array', 'occurred_at' => 'immutable_datetime'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
