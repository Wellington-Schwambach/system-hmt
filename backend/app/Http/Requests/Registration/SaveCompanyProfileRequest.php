<?php

namespace App\Http\Requests\Registration;

use Illuminate\Foundation\Http\FormRequest;

class SaveCompanyProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $clean = static fn ($value) => is_string($value) ? preg_replace('/\s+/', ' ', trim($value)) : $value;

        $this->merge([
            'legal_name' => $clean($this->input('legal_name')),
            'trade_name' => $clean($this->input('trade_name')),
            'cnpj' => $clean($this->input('cnpj')),
            'state_registration' => $clean($this->input('state_registration')),
            'municipal_registration' => $clean($this->input('municipal_registration')),
            'rntrc' => $clean($this->input('rntrc')),
            'tax_regime' => $clean($this->input('tax_regime')),
            'email' => mb_strtolower((string) $clean($this->input('email'))),
            'email_secondary' => mb_strtolower((string) $clean($this->input('email_secondary'))),
            'state' => strtoupper((string) $clean($this->input('state'))),
            'responsible_email' => mb_strtolower((string) $clean($this->input('responsible_email'))),
            'responsible_two_name' => $clean($this->input('responsible_two_name')),
            'responsible_two_cpf' => $clean($this->input('responsible_two_cpf')),
            'responsible_two_phone' => $clean($this->input('responsible_two_phone')),
            'responsible_two_email' => mb_strtolower((string) $clean($this->input('responsible_two_email'))),
        ]);
    }

    public function rules(): array
    {
        return [
            'legal_name' => ['required', 'string', 'min:2', 'max:180'],
            'trade_name' => ['nullable', 'string', 'max:180'],
            'cnpj' => ['nullable', 'string', 'max:18'],
            'state_registration' => ['nullable', 'string', 'max:40'],
            'municipal_registration' => ['nullable', 'string', 'max:40'],
            'rntrc' => ['nullable', 'string', 'max:40'],
            'opening_date' => ['nullable', 'date_format:Y-m-d'],
            'tax_regime' => ['nullable', 'string', 'max:80'],
            'email' => ['nullable', 'email:rfc', 'max:180'],
            'email_secondary' => ['nullable', 'email:rfc', 'max:180'],
            'phone' => ['nullable', 'string', 'max:30'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'postal_code' => ['nullable', 'string', 'max:12'],
            'street' => ['nullable', 'string', 'max:180'],
            'number' => ['nullable', 'string', 'max:30'],
            'complement' => ['nullable', 'string', 'max:120'],
            'neighborhood' => ['nullable', 'string', 'max:120'],
            'city' => ['nullable', 'string', 'max:120'],
            'state' => ['nullable', 'string', 'size:2'],
            'responsible_name' => ['nullable', 'string', 'max:180'],
            'responsible_cpf' => ['nullable', 'string', 'max:14'],
            'responsible_phone' => ['nullable', 'string', 'max:30'],
            'responsible_email' => ['nullable', 'email:rfc', 'max:180'],
            'responsible_two_name' => ['nullable', 'string', 'max:180'],
            'responsible_two_cpf' => ['nullable', 'string', 'max:14'],
            'responsible_two_phone' => ['nullable', 'string', 'max:30'],
            'responsible_two_email' => ['nullable', 'email:rfc', 'max:180'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function messages(): array
    {
        return [
            'legal_name.required' => 'Informe a razão social da empresa.',
            'legal_name.min' => 'A razão social deve possuir pelo menos 2 caracteres.',
            'email.email' => 'Informe um primeiro e-mail válido para a empresa.',
            'email_secondary.email' => 'Informe um segundo e-mail válido para a empresa.',
            'responsible_email.email' => 'Informe um e-mail válido para o primeiro responsável.',
            'responsible_two_email.email' => 'Informe um e-mail válido para o segundo responsável.',
            'state.size' => 'Informe a UF com 2 letras.',
            'opening_date.date_format' => 'Informe uma data de abertura válida.',
        ];
    }
}
