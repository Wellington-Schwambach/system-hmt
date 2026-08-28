<?php

namespace App\Http\Requests\Operation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVehicleSetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tractor_id' => [
                'required',
                'integer',
                Rule::exists('vehicles', 'id')->where(fn ($query) => $query->where('type', 'TRACTOR')->where('status', 'ACTIVE')),
            ],
            'trailer_id' => [
                'nullable',
                'integer',
                Rule::exists('vehicles', 'id')->where(fn ($query) => $query->where('type', 'TRAILER')->where('status', 'ACTIVE')),
            ],
            'driver_id' => [
                'required',
                'integer',
                Rule::exists('employees', 'id')->where(fn ($query) => $query->where('status', 'ACTIVE')),
            ],
            'driver_two_id' => [
                'nullable',
                'integer',
                'different:driver_id',
                Rule::exists('employees', 'id')->where(fn ($query) => $query->where('status', 'ACTIVE')),
            ],
            'coupled_at' => ['required', 'date'],
            'driver_assigned_at' => ['required', 'date', 'after_or_equal:coupled_at'],
            'driver_two_assigned_at' => ['nullable', 'required_with:driver_two_id', 'date', 'after_or_equal:coupled_at'],
        ];
    }

    public function messages(): array
    {
        return [
            'tractor_id.required' => 'Selecione o cavalo do conjunto.',
            'tractor_id.exists' => 'O cavalo selecionado não está disponível ou não está ativo.',
            'trailer_id.exists' => 'A carreta selecionada não está disponível ou não está ativa.',
            'driver_id.required' => 'Selecione o motorista que ficará vinculado ao conjunto.',
            'driver_id.exists' => 'O motorista selecionado não está disponível ou não está ativo.',
            'driver_two_id.different' => 'O segundo motorista deve ser diferente do primeiro.',
            'driver_two_id.exists' => 'O segundo motorista selecionado não está disponível ou não está ativo.',
            'coupled_at.required' => 'Informe a data e o horário do atrelamento.',
            'driver_assigned_at.required' => 'Informe a data e o horário do vínculo do motorista.',
            'driver_assigned_at.after_or_equal' => 'O motorista não pode ser vinculado antes do atrelamento do conjunto.',
            'driver_two_assigned_at.required_with' => 'Informe a data e o horário do vínculo do segundo motorista.',
            'driver_two_assigned_at.after_or_equal' => 'O segundo motorista não pode ser vinculado antes do atrelamento do conjunto.',
        ];
    }
}
