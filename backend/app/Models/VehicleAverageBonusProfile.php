<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleAverageBonusProfile extends Model
{
    protected $fillable = [
        'code',
        'name',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    public function rules(): HasMany
    {
        return $this->hasMany(VehicleAverageBonusProfileRule::class, 'profile_id')
            ->orderBy('position')
            ->orderBy('minimum_average');
    }
}
