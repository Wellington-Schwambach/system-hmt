<?php

namespace App\Http\Requests\Registration;

use Illuminate\Foundation\Http\FormRequest;

class StoreShipperDocumentRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Informe o nome ou a descrição do documento.',
            'name.min' => 'O nome do documento deve possuir pelo menos 2 caracteres.',
            'name.max' => 'O nome do documento deve possuir no máximo 120 caracteres.',
            'file.required' => 'Selecione o arquivo que será anexado.',
            'file.uploaded' => 'Não foi possível enviar o documento. Verifique o tamanho do arquivo e tente novamente.',
            'file.mimes' => 'O documento deve ser PDF, JPG, PNG, Word ou Excel.',
            'file.max' => 'O documento deve possuir no máximo 10 MB.',
        ];
    }
}
