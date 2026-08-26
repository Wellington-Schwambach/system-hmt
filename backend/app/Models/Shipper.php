<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shipper extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'normalized_name',
        'status',
        'display_color',
        'receipt_term_days',
        'created_by',
        'updated_by',
    ];

    public static function suggestedColor(string $name): string
    {
        $normalized = function_exists('mb_strtoupper')
            ? mb_strtoupper(trim($name), 'UTF-8')
            : strtoupper(trim($name));

        $known = [
            'BRF' => '#2563EB',
            'AURORA' => '#16A34A',
            'MILIA' => '#7C3AED',
            'GEO' => '#EA580C',
            'ITRACON' => '#0891B2',
        ];

        if (isset($known[$normalized])) {
            return $known[$normalized];
        }

        $palette = ['#0F766E', '#9333EA', '#DC2626', '#CA8A04', '#0284C7', '#C026D3', '#4F46E5', '#65A30D'];
        $index = abs(crc32($normalized)) % count($palette);

        return $palette[$index];
    }

    protected function casts(): array
    {
        return ['receipt_term_days' => 'integer'];
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ShipperDocument::class)->orderBy('position')->orderBy('id');
    }

    public function travels(): HasMany
    {
        return $this->hasMany(Travel::class);
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
