<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Travel extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * `travel` é uma palavra incontável para o pluralizador do Laravel.
     * Sem esta definição explícita, o Eloquent tenta consultar a tabela
     * `travel`, enquanto a migration cria corretamente `travels`.
     */
    protected $table = 'travels';

    protected $fillable = [
        'cte_type',
        'travel_date',
        'receipt_date',
        'origin',
        'destination',
        'cte_number',
        'cte_series',
        'shipper',
        'shipper_id',
        'operation_type',
        'freight_type',
        'cst',
        'vehicle_id',
        'plate_snapshot',
        'driver_one_id',
        'driver_one_name',
        'driver_two_id',
        'driver_two_name',
        'third_party_name',
        'third_party_plate',
        'third_party_payout_amount',
        'third_party_payout_date',
        'detached_trailer_id',
        'detached_trailer_plate_snapshot',
        'net_freight',
        'insurance_amount',
        'toll_amount',
        'icms_amount',
        'bonus_amount',
        'gross_freight',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected function casts(): array
    {
        return [
            'travel_date' => 'date:Y-m-d',
            'receipt_date' => 'date:Y-m-d',
            'net_freight' => 'decimal:2',
            'insurance_amount' => 'decimal:2',
            'toll_amount' => 'decimal:2',
            'icms_amount' => 'decimal:2',
            'bonus_amount' => 'decimal:2',
            'gross_freight' => 'decimal:2',
            'third_party_payout_amount' => 'decimal:2',
            'third_party_payout_date' => 'date:Y-m-d',
        ];
    }


    public function ctes(): HasMany
    {
        return $this->hasMany(TravelCte::class)->orderBy('id');
    }

    public function shipperRelation(): BelongsTo
    {
        return $this->belongsTo(Shipper::class, 'shipper_id');
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driverOne(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'driver_one_id');
    }

    public function driverTwo(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'driver_two_id');
    }

    public function detachedTrailer(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'detached_trailer_id');
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
