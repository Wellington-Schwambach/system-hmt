<?php

namespace App\Http\Requests\Registration;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveShipperRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $name = preg_replace('/\s+/', ' ', trim((string) $this->input('name')));
        $color = strtoupper(trim((string) $this->input('display_color', '#009E60')));

        $this->merge([
            'name' => $name,
            'normalized_name' => function_exists('mb_strtoupper')
                ? mb_strtoupper($name, 'UTF-8')
                : strtoupper($name),
            'display_color' => $color,
            'status' => strtoupper(trim((string) $this->input('status', 'ACTIVE'))),
            'receipt_term_days' => $this->input('receipt_term_days') === '' ? null : $this->input('receipt_term_days'),
        ]);
    }

    public function rules(): array
    {
        $shipper = $this->route('shipper');
        $shipperId = is_object($shipper) ? $shipper->getKey() : $shipper;

        return [
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'normalized_name' => [
                'required', 'string', 'max:100',
                Rule::unique('shippers', 'normalized_name')->ignore($shipperId),
            ],
            'display_color' => ['required', 'string', 'regex:/^#[0-9A-F]{6}$/'],
            'status' => ['required', 'string', Rule::in(['ACTIVE', 'INACTIVE'])],
            'receipt_term_days' => ['nullable', 'integer', 'min:0', 'max:3650'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Informe o nome do embarcador.',
            'name.min' => 'O nome do embarcador deve possuir pelo menos 2 caracteres.',
            'name.max' => 'O nome do embarcador deve possuir no máximo 100 caracteres.',
            'normalized_name.unique' => 'Este embarcador já está cadastrado.',
            'display_color.required' => 'Selecione uma cor para o embarcador.',
            'display_color.regex' => 'Selecione uma cor válida para o embarcador.',
            'status.in' => 'Selecione uma situação válida para o embarcador.',
            'receipt_term_days.integer' => 'Informe o prazo de recebimento em dias inteiros.',
            'receipt_term_days.min' => 'O prazo de recebimento não pode ser negativo.',
            'receipt_term_days.max' => 'O prazo de recebimento deve ser de no máximo 3650 dias.',
        ];
    }
}
