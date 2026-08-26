<?php

namespace App\Http\Requests\Operation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SaveFuelRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'station' => trim((string) $this->input('station')),
            'km' => $this->filled('km') ? $this->input('km') : null,
            'arla_liters' => $this->filled('arla_liters') ? $this->input('arla_liters') : 0,
            'arla_total_value' => $this->filled('arla_total_value') ? $this->input('arla_total_value') : 0,
        ]);
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => [
                'required',
                'integer',
                Rule::exists('vehicles', 'id')->where(fn ($query) => $query
                    ->where('type', 'TRACTOR')
                    ->where('status', 'ACTIVE')),
            ],
            'driver_id' => [
                'required',
                'integer',
                Rule::exists('employees', 'id')->where(fn ($query) => $query
                    ->where('status', 'ACTIVE')),
            ],
            'fuel_date' => ['required', 'date_format:Y-m-d'],
            'billing_month' => ['required', 'date_format:Y-m'],
            'station' => ['required', 'string', 'max:120'],
            'km' => ['nullable', 'integer', 'min:0', 'max:999999999'],
            'diesel_liters' => ['required', 'numeric', 'gt:0', 'max:999999999.999'],
            'diesel_total_value' => ['required', 'numeric', 'gt:0', 'max:999999999999.99'],
            'arla_liters' => ['nullable', 'numeric', 'min:0', 'max:999999999.999'],
            'arla_total_value' => ['nullable', 'numeric', 'min:0', 'max:999999999999.99'],
        ];
    }

    public function messages(): array
    {
        return [
            'vehicle_id.required' => 'Selecione um cavalo.',
            'vehicle_id.exists' => 'O cavalo selecionado não está mais disponível.',
            'driver_id.required' => 'Selecione um motorista.',
            'driver_id.exists' => 'O motorista selecionado não está mais disponível.',
            'fuel_date.required' => 'Informe a data do abastecimento.',
            'billing_month.required' => 'Informe o mês de faturamento.',
            'billing_month.date_format' => 'Informe um mês de faturamento válido.',
            'station.required' => 'Informe o posto.',
            'diesel_liters.required' => 'Informe os litros de Diesel.',
            'diesel_liters.gt' => 'Os litros de Diesel devem ser maiores que zero.',
            'diesel_total_value.required' => 'Informe o valor total do Diesel.',
            'diesel_total_value.gt' => 'O valor total do Diesel deve ser maior que zero.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $arlaLiters = (float) $this->input('arla_liters', 0);
                $arlaValue = (float) $this->input('arla_total_value', 0);

                if (($arlaLiters > 0 && $arlaValue <= 0) || ($arlaValue > 0 && $arlaLiters <= 0)) {
                    $validator->errors()->add(
                        'arla_liters',
                        'Para informar ARLA, preencha a litragem e o valor total.'
                    );
                }

                if ($this->filled('driver_id')) {
                    $isDriver = \App\Models\Employee::query()
                        ->whereKey((int) $this->input('driver_id'))
                        ->where('status', 'ACTIVE')
                        ->whereRaw('LOWER(job_title) LIKE ?', ['%motorista%'])
                        ->exists();

                    if (! $isDriver) {
                        $validator->errors()->add('driver_id', 'Selecione um motorista ativo.');
                    }
                }
            },
        ];
    }
}
