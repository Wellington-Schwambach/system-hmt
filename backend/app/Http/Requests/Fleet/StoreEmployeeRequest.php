<?php

namespace App\Http\Requests\Fleet;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'employee_code' => strtoupper(trim((string) $this->input('employee_code'))),
            'cpf' => $this->digits('cpf'),
            'phone' => $this->nullableDigits('phone'),
            'cnh_number' => $this->nullableDigits('cnh_number'),
            'cnh_category' => $this->nullableUppercase('cnh_category'),
            'cnh_state' => $this->nullableUppercase('cnh_state'),
            'email' => $this->nullableLowercase('email'),
            'remove_cnh_file' => $this->boolean('remove_cnh_file'),
            'remove_aso_file' => $this->boolean('remove_aso_file'),
            'remove_toxicological_file' => $this->boolean('remove_toxicological_file'),
            'remove_registration_form_file' => $this->boolean('remove_registration_form_file'),
        ]);
    }

    public function rules(): array
    {
        $employee = $this->route('employee');
        $employeeId = is_object($employee) ? $employee->getKey() : $employee;
        $fileRules = ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'];

        return [
            'employee_code' => [
                'required', 'string', 'max:30',
                Rule::unique('employees', 'employee_code')->ignore($employeeId),
            ],
            'full_name' => ['required', 'string', 'max:150'],
            'cpf' => [
                'required', 'string', 'size:11', 'regex:/^\d{11}$/',
                Rule::unique('employees', 'cpf')->ignore($employeeId),
            ],
            'rg' => ['nullable', 'string', 'max:30'],
            'birth_date' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'phone' => ['nullable', 'string', 'between:10,11', 'regex:/^\d+$/'],
            'email' => ['nullable', 'email:rfc', 'max:150'],
            'full_address' => ['nullable', 'string', 'max:1000'],
            'job_title' => ['required', 'string', 'max:80'],
            'admission_date' => ['required', 'date_format:Y-m-d'],
            'termination_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:admission_date'],
            'family_contact' => ['nullable', 'string', 'max:200'],
            'probation_end_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:admission_date'],
            'status' => ['required', 'string', Rule::in(['ACTIVE', 'LEAVE', 'INACTIVE'])],

            'cnh_number' => [
                'nullable', 'string', 'between:9,20', 'regex:/^\d+$/',
                Rule::unique('employees', 'cnh_number')->ignore($employeeId),
            ],
            'cnh_category' => ['nullable', 'string', Rule::in(['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'])],
            'cnh_issued_at' => ['nullable', 'date_format:Y-m-d'],
            'cnh_first_license_date' => ['nullable', 'date_format:Y-m-d'],
            'cnh_expiry_date' => ['nullable', 'date_format:Y-m-d'],
            'cnh_state' => ['nullable', 'string', 'size:2', 'regex:/^[A-Z]{2}$/'],
            'cnh_security_code' => ['nullable', 'string', 'max:20'],

            'aso_expiry_date' => ['nullable', 'date_format:Y-m-d'],
            'opentech_expiry_date' => ['nullable', 'date_format:Y-m-d'],
            'angellira_expiry_date' => ['nullable', 'date_format:Y-m-d'],
            'toxicological_expiry_date' => ['nullable', 'date_format:Y-m-d'],
            'trainings' => ['nullable', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:2000'],

            'cnh_file' => $fileRules,
            'aso_file' => $fileRules,
            'toxicological_file' => $fileRules,
            'registration_form_file' => $fileRules,
            'remove_cnh_file' => ['sometimes', 'boolean'],
            'remove_aso_file' => ['sometimes', 'boolean'],
            'remove_toxicological_file' => ['sometimes', 'boolean'],
            'remove_registration_form_file' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'employee_code.required' => 'Informe a matrícula.',
            'employee_code.unique' => 'Esta matrícula já está cadastrada.',
            'full_name.required' => 'Informe o nome do colaborador.',
            'cpf.size' => 'O CPF deve possuir 11 dígitos.',
            'cpf.unique' => 'Este CPF já está cadastrado.',
            'birth_date.before_or_equal' => 'A data de nascimento não pode estar no futuro.',
            'termination_date.after_or_equal' => 'A rescisão não pode ser anterior à admissão.',
            'probation_end_date.after_or_equal' => 'O fim da experiência não pode ser anterior à admissão.',
            'cnh_number.unique' => 'Esta CNH já está cadastrada.',
            'cnh_state.size' => 'A UF da CNH deve possuir 2 letras.',

            'cnh_file.uploaded' => 'Não foi possível enviar o anexo da CNH. Use PDF, JPG ou PNG de até 10 MB e tente novamente.',
            'cnh_file.file' => 'O anexo da CNH não foi reconhecido como um arquivo válido.',
            'cnh_file.mimes' => 'O anexo da CNH deve ser PDF, JPG ou PNG.',
            'cnh_file.max' => 'O anexo da CNH deve possuir no máximo 10 MB.',

            'aso_file.uploaded' => 'Não foi possível enviar o anexo do ASO. Use PDF, JPG ou PNG de até 10 MB e tente novamente.',
            'aso_file.file' => 'O anexo do ASO não foi reconhecido como um arquivo válido.',
            'aso_file.mimes' => 'O anexo do ASO deve ser PDF, JPG ou PNG.',
            'aso_file.max' => 'O anexo do ASO deve possuir no máximo 10 MB.',

            'toxicological_file.uploaded' => 'Não foi possível enviar o anexo toxicológico. Use PDF, JPG ou PNG de até 10 MB e tente novamente.',
            'toxicological_file.file' => 'O anexo toxicológico não foi reconhecido como um arquivo válido.',
            'toxicological_file.mimes' => 'O anexo toxicológico deve ser PDF, JPG ou PNG.',
            'toxicological_file.max' => 'O anexo toxicológico deve possuir no máximo 10 MB.',

            'registration_form_file.uploaded' => 'Não foi possível enviar a ficha de registro. Use PDF, JPG ou PNG de até 10 MB e tente novamente.',
            'registration_form_file.file' => 'A ficha de registro não foi reconhecida como um arquivo válido.',
            'registration_form_file.mimes' => 'A ficha de registro deve ser PDF, JPG ou PNG.',
            'registration_form_file.max' => 'A ficha de registro deve possuir no máximo 10 MB.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $issuedAt = $this->input('cnh_issued_at');
                $expiry = $this->input('cnh_expiry_date');

                if ($issuedAt && $expiry && $expiry < $issuedAt) {
                    $validator->errors()->add(
                        'cnh_expiry_date',
                        'O vencimento da CNH não pode ser anterior à emissão.'
                    );
                }
            },
        ];
    }

    private function digits(string $field): string
    {
        return (string) preg_replace('/\D/', '', (string) $this->input($field));
    }

    private function nullableDigits(string $field): ?string
    {
        $value = $this->digits($field);

        return $value === '' ? null : $value;
    }

    private function nullableUppercase(string $field): ?string
    {
        $value = trim((string) $this->input($field));

        return $value === '' ? null : strtoupper($value);
    }

    private function nullableLowercase(string $field): ?string
    {
        $value = trim((string) $this->input($field));

        return $value === '' ? null : mb_strtolower($value);
    }
}
