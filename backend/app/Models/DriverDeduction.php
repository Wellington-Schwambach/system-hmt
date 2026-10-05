<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DriverDeduction extends Model
{
    use SoftDeletes;

    public const CATEGORY_ADVANCE = 'ADVANCE';
    public const CATEGORY_FINE = 'FINE';
    public const CATEGORY_LOAN = 'LOAN';
    public const CATEGORY_OTHER = 'OTHER_DISCOUNT';
    public const STATUS_PENDING = 'PENDING';
    public const STATUS_SETTLED = 'SETTLED';

    protected $fillable = [
        'employee_id',
        'category',
        'entry_date',
        'withdrawal_date',
        'advance_location',
        'boleto_due_date',
        'weekly_authorized_by',
        'weekly_authorized_at',
        'description',
        'fine_plate',
        'fine_location',
        'fine_number',
        'fine_infraction_code',
        'fine_infraction_at',
        'fine_original_amount',
        'fine_charge_amount',
        'fine_observation',
        'amount',
        'installment_group',
        'installment_number',
        'installments_total',
        'status',
        'driver_settlement_id',
        'invoiced',
        'invoiced_at',
        'invoiced_by',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected function casts(): array
    {
        return [
            'entry_date' => 'date:Y-m-d',
            'withdrawal_date' => 'date:Y-m-d',
            'boleto_due_date' => 'date:Y-m-d',
            'weekly_authorized_at' => 'immutable_datetime',
            'fine_infraction_at' => 'immutable_datetime',
            'fine_original_amount' => 'decimal:2',
            'fine_charge_amount' => 'decimal:2',
            'amount' => 'decimal:2',
            'invoiced' => 'boolean',
            'invoiced_at' => 'immutable_datetime',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function settlement(): BelongsTo
    {
        return $this->belongsTo(DriverSettlement::class, 'driver_settlement_id');
    }

    public function invoicedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invoiced_by');
    }
}
