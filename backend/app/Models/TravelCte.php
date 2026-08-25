<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TravelCte extends Model
{
    use HasFactory;

    protected $fillable = [
        'travel_id',
        'cte_type',
        'cte_number',
        'cte_series',
        'complemented_cte_number',
        'net_freight',
        'insurance_amount',
        'toll_amount',
        'icms_amount',
        'bonus_amount',
        'gross_freight',
    ];

    protected function casts(): array
    {
        return [
            'net_freight' => 'decimal:2',
            'insurance_amount' => 'decimal:2',
            'toll_amount' => 'decimal:2',
            'icms_amount' => 'decimal:2',
            'bonus_amount' => 'decimal:2',
            'gross_freight' => 'decimal:2',
        ];
    }

    public function travel(): BelongsTo
    {
        return $this->belongsTo(Travel::class);
    }
}
