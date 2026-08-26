<?php

namespace App\Http\Requests\Operation;

use Illuminate\Foundation\Http\FormRequest;

class DetachVehicleSetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'detached_at' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'detached_at.required' => 'Informe a data e o horário do desatrelamento.',
        ];
    }
}
