<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BrazilState extends Model
{
    public $timestamps = false;

    protected $table = 'brazil_states';

    protected $fillable = ['id', 'abbreviation', 'name', 'region'];

    public function cities(): HasMany
    {
        return $this->hasMany(BrazilCity::class, 'state_id');
    }
}
