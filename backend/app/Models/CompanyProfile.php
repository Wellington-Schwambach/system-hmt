<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompanyProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'legal_name',
        'trade_name',
        'cnpj',
        'state_registration',
        'municipal_registration',
        'rntrc',
        'opening_date',
        'tax_regime',
        'email',
        'email_secondary',
        'phone',
        'whatsapp',
        'postal_code',
        'street',
        'number',
        'complement',
        'neighborhood',
        'city',
        'state',
        'responsible_name',
        'responsible_cpf',
        'responsible_phone',
        'responsible_email',
        'responsible_two_name',
        'responsible_two_cpf',
        'responsible_two_phone',
        'responsible_two_email',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'opening_date' => 'date:Y-m-d',
        ];
    }

    public function documents(): HasMany
    {
        return $this->hasMany(CompanyDocument::class)->orderBy('position')->orderBy('id');
    }
}
