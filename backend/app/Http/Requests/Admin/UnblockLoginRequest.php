<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UnblockLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'username' => mb_strtolower(trim((string) $this->input('username'))),
            'duration_minutes' => (int) $this->input('duration_minutes', 120),
        ]);
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:100'],
            'ip_address' => ['required', 'ip'],
            'duration_minutes' => ['required', 'integer', 'min:120', 'max:10080'],
        ];
    }

    public function messages(): array
    {
        return [
            'duration_minutes.min' => 'A liberação temporária deve ser de pelo menos 2 horas.',
            'duration_minutes.max' => 'A liberação temporária pode ser de no máximo 7 dias.',
        ];
    }
}
