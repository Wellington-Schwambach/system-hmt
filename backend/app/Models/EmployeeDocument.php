<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeDocument extends Model
{
    use HasFactory;

    public const TYPE_CNH = 'CNH';
    public const TYPE_ASO = 'ASO';
    public const TYPE_TOXICOLOGICAL = 'TOXICOLOGICAL';
    public const TYPE_REGISTRATION_FORM = 'REGISTRATION_FORM';

    /** @var array<string, string> */
    public const INPUTS = [
        self::TYPE_CNH => 'cnh_file',
        self::TYPE_ASO => 'aso_file',
        self::TYPE_TOXICOLOGICAL => 'toxicological_file',
        self::TYPE_REGISTRATION_FORM => 'registration_form_file',
    ];

    protected $fillable = [
        'employee_id',
        'type',
        'path',
        'original_name',
        'mime_type',
        'size',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
