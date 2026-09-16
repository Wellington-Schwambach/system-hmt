<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyNotePreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'alert_type',
        'enabled',
        'days_before',
    ];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'days_before' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
