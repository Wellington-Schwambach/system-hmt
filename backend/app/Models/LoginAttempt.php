<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'username',
        'ip_address',
        'user_agent',
        'was_successful',
        'failure_reason',
        'failed_attempt_number',
        'blocked_until',
        'attempted_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'was_successful' => 'boolean',
            'blocked_until' => 'immutable_datetime',
            'attempted_at' => 'immutable_datetime',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
