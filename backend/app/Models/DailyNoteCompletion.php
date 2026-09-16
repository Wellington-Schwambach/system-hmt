<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyNoteCompletion extends Model
{
    use HasFactory;

    protected $fillable = [
        'note_key',
        'completed_by',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'completed_at' => 'immutable_datetime',
        ];
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
}
