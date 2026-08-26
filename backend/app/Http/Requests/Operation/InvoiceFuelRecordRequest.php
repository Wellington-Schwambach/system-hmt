<?php

namespace App\Http\Requests\Operation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InvoiceFuelRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'target' => strtoupper(trim((string) $this->input('target'))),
        ]);
    }

    public function rules(): array
    {
        return [
            'target' => ['required', Rule::in(['DIESEL', 'ARLA'])],
        ];
    }
}
