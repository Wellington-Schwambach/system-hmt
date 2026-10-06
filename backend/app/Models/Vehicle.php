<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'fleet_number',
        'plate',
        'type',
        'brand',
        'model',
        'manufacture_year',
        'model_year',
        'color',
        'chassis',
        'renavam',
        'fuel_type',
        'load_capacity_kg',
        'tare_kg',
        'current_km',
        'status',
        'opentech_expiry_date',
        'angellira_expiry_date',
        'licensing_expiry_date',
        'tachograph_expiry_date',
        'notes',
        'average_bonus_enabled',
        'average_bonus_valid_from',
        'average_bonus_profile_id',
        'average_bonus_disengagement',
        'average_bonus_extra_percent',
        'average_bonus_rules',
        'crlv_path',
        'crlv_original_name',
        'crlv_mime_type',
        'crlv_size',
        'crlv_valid_until',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'manufacture_year' => 'integer',
            'model_year' => 'integer',
            'load_capacity_kg' => 'integer',
            'tare_kg' => 'integer',
            'current_km' => 'integer',
            'crlv_size' => 'integer',
            'opentech_expiry_date' => 'date:Y-m-d',
            'angellira_expiry_date' => 'date:Y-m-d',
            'licensing_expiry_date' => 'date:Y-m-d',
            'tachograph_expiry_date' => 'date:Y-m-d',
            'average_bonus_enabled' => 'boolean',
            'average_bonus_valid_from' => 'date:Y-m-d',
            'average_bonus_profile_id' => 'integer',
            'average_bonus_disengagement' => 'boolean',
            'average_bonus_extra_percent' => 'decimal:2',
            'average_bonus_rules' => 'array',
            'crlv_valid_until' => 'date:Y-m-d',
        ];
    }


    public function averageBonusProfile(): BelongsTo
    {
        return $this->belongsTo(VehicleAverageBonusProfile::class, 'average_bonus_profile_id');
    }

    public function fuelRecords(): HasMany
    {
        return $this->hasMany(FuelRecord::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
