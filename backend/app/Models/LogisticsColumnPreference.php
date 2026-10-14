<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogisticsColumnPreference extends Model
{
    protected $fillable = [
        'user_id',
        'columns',
        'form_order',
    ];

    protected function casts(): array
    {
        return [
            'columns' => 'array',
            'form_order' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
