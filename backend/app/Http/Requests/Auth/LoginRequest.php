<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'username' => Str::lower(trim((string) $this->input('username'))),
            'remember' => $this->boolean('remember'),
        ]);
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'username' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-z0-9._-]+$/',
            ],
            'password' => [
                'required',
                'string',
                'max:255',
            ],
            'remember' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'username.required' => 'Informe o usuário.',
            'username.regex' => 'O usuário pode conter apenas letras, números, ponto, hífen e sublinhado.',
            'password.required' => 'Informe a senha.',
        ];
    }
}
