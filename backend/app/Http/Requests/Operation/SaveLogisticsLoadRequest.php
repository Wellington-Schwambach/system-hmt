<?php

namespace App\Http\Requests\Operation;

use App\Models\LogisticsLoad;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveLogisticsLoadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $load = $this->route('logisticsLoad');
        $loadId = is_object($load) ? $load->id : null;

        return [
            'reference_code' => [
                'nullable',
                'string',
                'max:40',
                Rule::unique('logistics_loads', 'reference_code')->ignore($loadId),
            ],
            'shipment_number' => ['nullable', 'string', 'max:100'],
            'load_number' => ['nullable', 'string', 'max:100'],
            'shipowner' => ['nullable', 'string', 'max:140'],
            'booking_number' => ['nullable', 'string', 'max:100'],
            'shipper_id' => [
                'required',
                'integer',
                Rule::exists('shippers', 'id')->where(fn ($query) => $query->where('status', 'ACTIVE')),
            ],
            'driver_id' => [
                'nullable',
                'integer',
                Rule::exists('employees', 'id')->where(fn ($query) => $query->where('status', 'ACTIVE')),
            ],
            'driver_two_id' => [
                'nullable',
                'integer',
                'different:driver_id',
                Rule::exists('employees', 'id')->where(fn ($query) => $query->where('status', 'ACTIVE')),
            ],
            'tractor_id' => [
                'nullable',
                'integer',
                Rule::exists('vehicles', 'id')->where(fn ($query) => $query->where('type', 'TRACTOR')->where('status', 'ACTIVE')),
            ],
            'trailer_id' => [
                'nullable',
                'integer',
                Rule::exists('vehicles', 'id')->where(fn ($query) => $query->where('type', 'TRAILER')->where('status', 'ACTIVE')),
            ],
            'collection_terminal' => ['nullable', 'string', 'max:180'],
            'collection_at' => ['nullable', 'date'],
            'loading_location' => ['nullable', 'string', 'max:180'],
            'loading_at' => ['nullable', 'date'],
            'delivery_location' => ['nullable', 'string', 'max:180'],
            'delivery_at' => ['nullable', 'date'],
            'stage' => ['nullable', Rule::in(LogisticsLoad::STAGES)],
            'notes' => ['nullable', 'string', 'max:4000'],
        ];
    }

    public function messages(): array
    {
        return [
            'reference_code.unique' => 'Já existe uma carga com esta referência.',
            'shipper_id.required' => 'Selecione o embarcador da carga.',
            'shipper_id.exists' => 'O embarcador selecionado não está ativo.',
            'driver_two_id.different' => 'O segundo motorista deve ser diferente do primeiro.',
            'collection_at.date' => 'A data da coleta é inválida.',
            'loading_at.date' => 'A data do carregamento é inválida.',
            'delivery_at.date' => 'A data da baixa/entrega é inválida.',
        ];
    }
}
