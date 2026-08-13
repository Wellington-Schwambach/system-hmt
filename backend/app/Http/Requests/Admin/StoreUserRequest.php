<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Validator;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'username' => mb_strtolower(trim((string) $this->input('username'))),
            'is_active' => $this->boolean('is_active'),
            'access_schedule_enabled' => $this->boolean('access_schedule_enabled'),
            'saturday_access_enabled' => $this->boolean('saturday_access_enabled'),
            'sunday_access_enabled' => $this->boolean('sunday_access_enabled'),
        ]);
    }

    public function rules(): array
    {
        $profiles = implode(',', array_keys((array) config('hmt.access.profiles', [])));
        $permissions = implode(',', array_keys((array) config('hmt.access.permissions', [])));

        return [
            'name' => ['required', 'string', 'max:150'],
            'username' => ['required', 'string', 'min:3', 'max:100', 'regex:/^[a-z0-9._-]+$/'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_active' => ['required', 'boolean'],
            'role' => ['required', 'string', 'in:'.$profiles],
            'password' => [
                'required',
                'string',
                Password::min(8)->letters()->mixedCase()->numbers(),
            ],
            'theme_preference' => ['required', 'string', 'in:light,dark'],
            'menu_permissions' => ['required', 'array'],
            'menu_permissions.*' => ['string', 'distinct', 'in:'.$permissions],
            'access_schedule_enabled' => ['required', 'boolean'],
            'access_start_time' => ['nullable', 'date_format:H:i'],
            'access_end_time' => ['nullable', 'date_format:H:i'],
            'access_days' => ['nullable', 'array'],
            'access_days.*' => ['integer', 'between:1,5', 'distinct'],
            'saturday_access_enabled' => ['required', 'boolean'],
            'saturday_start_time' => ['nullable', 'date_format:H:i'],
            'saturday_end_time' => ['nullable', 'date_format:H:i'],
            'sunday_access_enabled' => ['required', 'boolean'],
            'sunday_start_time' => ['nullable', 'date_format:H:i'],
            'sunday_end_time' => ['nullable', 'date_format:H:i'],
            'access_timezone' => ['required', 'string', 'timezone'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.regex' => 'O usuário pode conter apenas letras minúsculas, números, ponto, hífen e sublinhado.',
            'password.min' => 'A senha deve possuir pelo menos 8 caracteres.',
            'password.mixed' => 'A senha deve possuir letras maiúsculas e minúsculas.',
            'password.numbers' => 'A senha deve possuir pelo menos um número.',
            'access_timezone.timezone' => 'Informe um fuso horário válido.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (User::query()->whereRaw('LOWER(username) = ?', [$this->input('username')])->exists()) {
                    $validator->errors()->add('username', 'Este usuário já está cadastrado.');
                }

                $this->validateSchedules($validator);
            },
        ];
    }

    private function validateSchedules(Validator $validator): void
    {
        if (! $this->boolean('access_schedule_enabled')) {
            return;
        }

        $weekdays = array_values(array_filter((array) $this->input('access_days', [])));
        $hasSaturday = $this->boolean('saturday_access_enabled');
        $hasSunday = $this->boolean('sunday_access_enabled');

        if ($weekdays === [] && ! $hasSaturday && ! $hasSunday) {
            $validator->errors()->add(
                'access_days',
                'Selecione ao menos um dia da semana ou adicione um horário de sábado/domingo.'
            );
        }

        if ($weekdays !== []) {
            $this->validateTimePair(
                $validator,
                'access_start_time',
                'access_end_time',
                'Informe o horário inicial da semana.',
                'Informe o horário final da semana.'
            );
        }

        if ($hasSaturday) {
            $this->validateTimePair(
                $validator,
                'saturday_start_time',
                'saturday_end_time',
                'Informe o horário inicial de sábado.',
                'Informe o horário final de sábado.'
            );
        }

        if ($hasSunday) {
            $this->validateTimePair(
                $validator,
                'sunday_start_time',
                'sunday_end_time',
                'Informe o horário inicial de domingo.',
                'Informe o horário final de domingo.'
            );
        }
    }

    private function validateTimePair(
        Validator $validator,
        string $startField,
        string $endField,
        string $startMessage,
        string $endMessage
    ): void {
        $start = $this->input($startField);
        $end = $this->input($endField);

        if (! is_string($start) || $start === '') {
            $validator->errors()->add($startField, $startMessage);
        }

        if (! is_string($end) || $end === '') {
            $validator->errors()->add($endField, $endMessage);
        }

        if (is_string($start) && $start !== '' && $start === $end) {
            $validator->errors()->add($endField, 'O horário final deve ser diferente do inicial.');
        }
    }
}
