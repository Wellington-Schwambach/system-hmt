<?php

namespace App\Http\Requests\Operation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreShipperRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $name = preg_replace('/\s+/', ' ', trim((string) $this->input('name')));

        $this->merge([
            'name' => $name,
            'normalized_name' => function_exists('mb_strtoupper') ? mb_strtoupper($name, 'UTF-8') : strtoupper($name),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'normalized_name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('shippers', 'normalized_name'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Informe o nome do embarcador.',
            'name.min' => 'O nome do embarcador deve possuir pelo menos 2 caracteres.',
            'name.max' => 'O nome do embarcador deve possuir no máximo 100 caracteres.',
            'normalized_name.unique' => 'Este embarcador já está cadastrado.',
        ];
    }
}
