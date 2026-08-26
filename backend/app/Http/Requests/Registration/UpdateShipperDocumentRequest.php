<?php

namespace App\Http\Requests\Registration;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShipperDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => preg_replace('/\s+/', ' ', trim((string) $this->input('name'))),
        ]);
    }

    public function rules(): array
    {
        return ['name' => ['required', 'string', 'min:2', 'max:120']];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Informe o nome ou a descrição do documento.',
            'name.min' => 'O nome do documento deve possuir pelo menos 2 caracteres.',
            'name.max' => 'O nome do documento deve possuir no máximo 120 caracteres.',
        ];
    }
}
