<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BrazilCity extends Model
{
    public $timestamps = false;

    protected $table = 'brazil_cities';

    protected $fillable = ['id', 'state_id', 'name'];

    public function state(): BelongsTo
    {
        return $this->belongsTo(BrazilState::class, 'state_id');
    }
}
