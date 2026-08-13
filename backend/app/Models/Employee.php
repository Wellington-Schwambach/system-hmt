<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_code',
        'full_name',
        'cpf',
        'rg',
        'birth_date',
        'phone',
        'email',
        'full_address',
        'job_title',
        'admission_date',
        'termination_date',
        'family_contact',
        'probation_end_date',
        'status',
        'cnh_number',
        'cnh_category',
        'cnh_issued_at',
        'cnh_first_license_date',
        'cnh_expiry_date',
        'cnh_state',
        'cnh_security_code',
        'aso_expiry_date',
        'opentech_expiry_date',
        'angellira_expiry_date',
        'toxicological_expiry_date',
        'trainings',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date:Y-m-d',
            'admission_date' => 'date:Y-m-d',
            'termination_date' => 'date:Y-m-d',
            'probation_end_date' => 'date:Y-m-d',
            'cnh_issued_at' => 'date:Y-m-d',
            'cnh_first_license_date' => 'date:Y-m-d',
            'cnh_expiry_date' => 'date:Y-m-d',
            'aso_expiry_date' => 'date:Y-m-d',
            'opentech_expiry_date' => 'date:Y-m-d',
            'angellira_expiry_date' => 'date:Y-m-d',
            'toxicological_expiry_date' => 'date:Y-m-d',
        ];
    }

    public function documents(): HasMany
    {
        return $this->hasMany(EmployeeDocument::class);
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
