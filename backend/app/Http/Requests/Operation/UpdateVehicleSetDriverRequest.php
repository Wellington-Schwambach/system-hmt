<?php

namespace App\Http\Requests\Operation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleSetDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'driver_id' => [
                'required',
                'integer',
                Rule::exists('employees', 'id')->where(fn ($query) => $query->where('status', 'ACTIVE')),
            ],
            'assigned_at' => ['required', 'date'],
            'released_at' => ['nullable', 'date'],
            'slot' => ['nullable', Rule::in(['PRIMARY', 'SECONDARY'])],
        ];
    }

    public function messages(): array
    {
        return [
            'driver_id.required' => 'Selecione o novo motorista.',
            'driver_id.exists' => 'O motorista selecionado não está disponível ou não está ativo.',
            'assigned_at.required' => 'Informe a data e o horário de entrada do novo motorista.',
            'released_at.date' => 'Informe uma data e horário de saída válidos para o motorista atual.',
            'slot.in' => 'Informe uma posição de motorista válida.',
        ];
    }
}
