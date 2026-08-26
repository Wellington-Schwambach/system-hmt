<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FuelRecord extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'vehicle_id',
        'driver_id',
        'plate',
        'driver_name',
        'fuel_date',
        'billing_month',
        'station',
        'km',
        'vehicle_km_reference',
        'distance_km',
        'diesel_average',
        'diesel_liters',
        'diesel_total_value',
        'arla_liters',
        'arla_total_value',
        'diesel_invoiced',
        'arla_invoiced',
        'diesel_invoiced_at',
        'arla_invoiced_at',
        'diesel_invoiced_by',
        'arla_invoiced_by',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected function casts(): array
    {
        return [
            'fuel_date' => 'date:Y-m-d',
            'billing_month' => 'date:Y-m-d',
            'km' => 'integer',
            'vehicle_km_reference' => 'integer',
            'distance_km' => 'integer',
            'diesel_average' => 'decimal:3',
            'diesel_liters' => 'decimal:3',
            'diesel_total_value' => 'decimal:2',
            'arla_liters' => 'decimal:3',
            'arla_total_value' => 'decimal:2',
            'diesel_invoiced' => 'boolean',
            'arla_invoiced' => 'boolean',
            'diesel_invoiced_at' => 'datetime',
            'arla_invoiced_at' => 'datetime',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'driver_id');
    }
}
