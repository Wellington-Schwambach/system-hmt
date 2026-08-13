<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'notes',
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
            'crlv_valid_until' => 'date:Y-m-d',
        ];
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
