<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LogisticsLoad extends Model
{
    use SoftDeletes;
    public const STAGE_PROGRAMMING = 'PROGRAMMING';
    public const STAGE_COLLECTION = 'COLLECTION';
    public const STAGE_LOADING = 'LOADING';
    public const STAGE_DELIVERY = 'DELIVERY';

    public const STAGES = [
        self::STAGE_PROGRAMMING,
        self::STAGE_COLLECTION,
        self::STAGE_LOADING,
        self::STAGE_DELIVERY,
    ];

    protected $fillable = [
        'reference_code',
        'shipment_number',
        'load_number',
        'shipowner',
        'booking_number',
        'collection_booking_number',
        'grade_number',
        'grade_at',
        'shipper_id',
        'cargo_type_id',
        'container_type_id',
        'shipowner_id',
        'driver_id',
        'driver_two_id',
        'plate_mode',
        'tractor_id',
        'trailer_id',
        'third_party_tractor_plate',
        'third_party_trailer_plate',
        'collection_city_id',
        'loading_city_id',
        'delivery_city_id',
        'collection_location_type_id',
        'delivery_location_type_id',
        'container_number',
        'container_tare_kg',
        'container_payload_kg',
        'shipowner_seal',
        'vessel',
        'deadline',
        'country',
        'temperature',
        'sif_seal',
        'plan',
        'load_mode',
        'load_status',
        'cargo_number',
        'load_entries',
        'collection_city',
        'loading_city',
        'delivery_city',
        'collection_terminal',
        'collection_scheduled_at',
        'collection_at',
        'collection_appointments',
        'loading_location',
        'loading_at',
        'delivery_location',
        'delivery_at',
        'delivery_appointments',
        'scheduled_at',
        'stage',
        'position',
        'notes',
        'completed_at',
        'completed_by',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'immutable_datetime',
            'collection_scheduled_at' => 'immutable_datetime',
            'collection_at' => 'immutable_datetime',
            'collection_appointments' => 'array',
            'grade_at' => 'immutable_datetime',
            'loading_at' => 'immutable_datetime',
            'delivery_at' => 'immutable_datetime',
            'delivery_appointments' => 'array',
            'deadline' => 'date:Y-m-d',
            'container_tare_kg' => 'decimal:2',
            'container_payload_kg' => 'decimal:2',
            'load_entries' => 'array',
            'completed_at' => 'immutable_datetime',
            'position' => 'integer',
        ];
    }

    public function shipper(): BelongsTo
    {
        return $this->belongsTo(Shipper::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'driver_id');
    }

    public function driverTwo(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'driver_two_id');
    }

    public function tractor(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'tractor_id');
    }

    public function trailer(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'trailer_id');
    }

    public function cargoType(): BelongsTo
    {
        return $this->belongsTo(LogisticsCargoType::class, 'cargo_type_id');
    }

    public function containerType(): BelongsTo
    {
        return $this->belongsTo(LogisticsContainerType::class, 'container_type_id');
    }

    public function shipownerRelation(): BelongsTo
    {
        return $this->belongsTo(LogisticsShipowner::class, 'shipowner_id');
    }

    public function collectionCityRelation(): BelongsTo
    {
        return $this->belongsTo(BrazilCity::class, 'collection_city_id');
    }

    public function loadingCityRelation(): BelongsTo
    {
        return $this->belongsTo(BrazilCity::class, 'loading_city_id');
    }

    public function deliveryCityRelation(): BelongsTo
    {
        return $this->belongsTo(BrazilCity::class, 'delivery_city_id');
    }

    public function collectionLocationType(): BelongsTo
    {
        return $this->belongsTo(LogisticsLocationType::class, 'collection_location_type_id');
    }

    public function deliveryLocationType(): BelongsTo
    {
        return $this->belongsTo(LogisticsLocationType::class, 'delivery_location_type_id');
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function events(): HasMany
    {
        return $this->hasMany(LogisticsLoadEvent::class)->orderByDesc('occurred_at')->orderByDesc('id');
    }

    public function statusNotes(): HasMany
    {
        return $this->hasMany(LogisticsLoadStatusNote::class)->orderByDesc('created_at')->orderByDesc('id');
    }
}
