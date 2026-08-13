<?php

namespace App\Http\Requests\Fleet;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'fleet_number' => $this->nullableUppercase('fleet_number'),
            'plate' => strtoupper(preg_replace('/[^A-Za-z0-9]/', '', (string) $this->input('plate'))),
            'chassis' => $this->nullableUppercase('chassis'),
            'renavam' => $this->nullableDigits('renavam'),
            'remove_crlv' => $this->boolean('remove_crlv'),
        ]);
    }

    public function rules(): array
    {
        $vehicle = $this->route('vehicle');
        $vehicleId = is_object($vehicle) ? $vehicle->getKey() : $vehicle;

        return [
            'fleet_number' => [
                'nullable', 'string', 'max:30',
                Rule::unique('vehicles', 'fleet_number')->ignore($vehicleId),
            ],
            'plate' => [
                'required', 'string', 'size:7', 'regex:/^[A-Z0-9]{7}$/',
                Rule::unique('vehicles', 'plate')->ignore($vehicleId),
            ],
            'type' => ['required', 'string', Rule::in(['TRACTOR', 'TRAILER'])],
            'brand' => ['required', 'string', 'max:80'],
            'model' => ['required', 'string', 'max:100'],
            'manufacture_year' => ['required', 'integer', 'between:1900,2100'],
            'model_year' => ['required', 'integer', 'between:1900,2100'],
            'color' => ['nullable', 'string', 'max:50'],
            'chassis' => [
                'nullable', 'string', 'size:17', 'regex:/^[A-Z0-9]{17}$/',
                Rule::unique('vehicles', 'chassis')->ignore($vehicleId),
            ],
            'renavam' => [
                'nullable', 'string', 'between:9,11', 'regex:/^\d+$/',
                Rule::unique('vehicles', 'renavam')->ignore($vehicleId),
            ],
            'fuel_type' => ['required', 'string', Rule::in(['DIESEL', 'FLEX', 'GASOLINE', 'ELECTRIC', 'OTHER'])],
            'load_capacity_kg' => ['nullable', 'integer', 'min:0', 'max:99999999'],
            'tare_kg' => ['nullable', 'integer', 'min:0', 'max:99999999'],
            'current_km' => ['nullable', 'integer', 'min:0', 'max:999999999'],
            'status' => ['required', 'string', Rule::in(['ACTIVE', 'MAINTENANCE', 'INACTIVE'])],
            'opentech_expiry_date' => ['nullable', 'date_format:Y-m-d'],
            'angellira_expiry_date' => ['nullable', 'date_format:Y-m-d'],
            'licensing_expiry_date' => ['nullable', 'date_format:Y-m-d'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'crlv' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'crlv_valid_until' => ['nullable', 'date_format:Y-m-d'],
            'remove_crlv' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'plate.size' => 'A placa deve possuir 7 caracteres.',
            'plate.unique' => 'Esta placa já está cadastrada.',
            'fleet_number.unique' => 'Este número de frota já está cadastrado.',
            'chassis.size' => 'O chassi deve possuir 17 caracteres.',
            'chassis.unique' => 'Este chassi já está cadastrado.',
            'renavam.unique' => 'Este RENAVAM já está cadastrado.',
            'model_year.between' => 'Informe um ano de modelo válido.',
            'manufacture_year.between' => 'Informe um ano de fabricação válido.',
            'crlv.uploaded' => 'Não foi possível enviar o CRLV. Use PDF, JPG ou PNG de até 10 MB e tente novamente.',
            'crlv.file' => 'O CRLV não foi reconhecido como um arquivo válido.',
            'crlv.mimes' => 'O CRLV deve ser um arquivo PDF, JPG ou PNG.',
            'crlv.max' => 'O CRLV deve possuir no máximo 10 MB.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $manufactureYear = (int) $this->input('manufacture_year');
                $modelYear = (int) $this->input('model_year');

                if ($manufactureYear > 0 && $modelYear > 0 && $modelYear < $manufactureYear) {
                    $validator->errors()->add(
                        'model_year',
                        'O ano do modelo não pode ser menor que o ano de fabricação.'
                    );
                }

                $vehicle = $this->route('vehicle');
                $hasStoredCrlv = is_object($vehicle) && filled($vehicle->crlv_path);
                $willRemoveCrlv = $this->boolean('remove_crlv');
                $hasNewCrlv = $this->hasFile('crlv');
                $hasCrlvAfterSave = $hasNewCrlv || ($hasStoredCrlv && ! $willRemoveCrlv);

                if ($this->filled('crlv_valid_until') && ! $hasCrlvAfterSave) {
                    $validator->errors()->add(
                        'crlv',
                        'Anexe o CRLV antes de informar a vigência.'
                    );
                }
            },
        ];
    }

    private function nullableUppercase(string $field): ?string
    {
        $value = trim((string) $this->input($field));

        return $value === '' ? null : strtoupper($value);
    }

    private function nullableDigits(string $field): ?string
    {
        $value = preg_replace('/\D/', '', (string) $this->input($field));

        return $value === '' ? null : $value;
    }
}
