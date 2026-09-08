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
        $effectiveStage = (string) ($this->input('stage') ?? (is_object($load) ? $load->stage : LogisticsLoad::STAGE_PROGRAMMING));

        return [
            'reference_code' => [
                'nullable',
                'string',
                'max:40',
                Rule::unique('logistics_loads', 'reference_code')->ignore($loadId),
            ],
            'shipment_number' => ['nullable', 'string', 'max:100'],
            'load_number' => ['exclude_unless:load_mode,LOAD', 'nullable', 'string', 'max:100'],
            'shipowner' => ['nullable', 'string', 'max:140'],
            'booking_number' => ['nullable', 'string', 'max:100'],
            'collection_booking_number' => ['nullable', 'string', 'max:100'],
            'cargo_type_id' => ['nullable', 'integer', 'exists:logistics_cargo_types,id'],
            'container_type_id' => ['nullable', 'integer', 'exists:logistics_container_types,id'],
            'shipowner_id' => ['nullable', 'integer', 'exists:logistics_shipowners,id'],
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
                Rule::prohibitedIf(fn (): bool => ! $this->filled('driver_id')),
                'integer',
                'different:driver_id',
                Rule::exists('employees', 'id')->where(fn ($query) => $query->where('status', 'ACTIVE')),
            ],
            'tractor_id' => [
                'nullable',
                'integer',
                Rule::exists('vehicles', 'id')->where(fn ($query) => $query->where('type', 'TRACTOR')->where('status', 'ACTIVE')),
            ],
            'collection_city_id' => ['nullable', 'integer', 'exists:brazil_cities,id'],
            'loading_city_id' => ['nullable', 'integer', 'exists:brazil_cities,id'],
            'delivery_city_id' => ['nullable', 'integer', 'exists:brazil_cities,id'],
            'collection_location_type_id' => ['nullable', 'integer', Rule::exists('logistics_location_types', 'id')->where(fn ($query) => $query->where('scope', 'C')->where('active', true))],
            'delivery_location_type_id' => ['nullable', 'integer', Rule::exists('logistics_location_types', 'id')->where(fn ($query) => $query->where('scope', 'B')->where('active', true))],
            'trailer_id' => [
                'nullable',
                'integer',
                Rule::exists('vehicles', 'id')->where(fn ($query) => $query->where('type', 'TRAILER')->where('status', 'ACTIVE')),
            ],
            'collection_terminal' => ['nullable', 'string', 'max:180'],
            'collection_scheduled_at' => ['nullable', 'date', Rule::requiredIf($effectiveStage === LogisticsLoad::STAGE_PROGRAMMING)],
            'collection_at' => ['nullable', 'date'],
            'loading_location' => ['nullable', 'string', 'max:180'],
            'loading_at' => ['nullable', 'date'],
            'delivery_location' => ['nullable', 'string', 'max:180'],
            'delivery_at' => ['nullable', 'date'],
            'plan' => ['nullable', 'string', 'max:120'],
            'load_mode' => ['nullable', Rule::in(['CARGO', 'LOAD'])],
            'load_status' => ['exclude_unless:load_mode,LOAD', 'nullable', Rule::in(['EMPTY', 'FULL'])],
            'cargo_number' => ['exclude_unless:load_mode,CARGO', 'nullable', 'string', 'max:100'],
            'load_entries' => ['exclude_unless:load_mode,LOAD', 'required', 'array', 'min:1', 'max:10'],
            'load_entries.*.status' => ['required', Rule::in(['EMPTY', 'FULL'])],
            'load_entries.*.number' => ['nullable', 'string', 'max:100'],
            'container_number' => ['nullable', 'string', 'max:40'],
            'container_tare_kg' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
            'container_payload_kg' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
            'shipowner_seal' => ['nullable', 'string', 'max:100'],
            'vessel' => ['nullable', 'string', 'max:140'],
            'deadline' => ['nullable', 'date_format:Y-m-d'],
            'country' => ['nullable', 'string', 'max:100'],
            'temperature' => ['nullable', 'string', 'max:40'],
            'sif_seal' => ['nullable', 'string', 'max:100'],
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
            'driver_two_id.prohibited' => 'Selecione o primeiro motorista antes de informar o segundo.',
            'driver_two_id.different' => 'O segundo motorista deve ser diferente do primeiro.',
            'collection_scheduled_at.required' => 'Informe a data do agendamento da coleta.',
            'collection_scheduled_at.date' => 'A data do agendamento da coleta é inválida.',
            'collection_at.date' => 'A data da coleta realizada é inválida.',
            'load_entries.required' => 'Adicione ao menos uma Load quando selecionar o tipo Load.',
            'load_entries.min' => 'Adicione ao menos uma Load.',
            'load_entries.*.status.required' => 'Informe se cada Load está vazia ou cheia.',
            'loading_at.date' => 'A data do carregamento é inválida.',
            'delivery_at.date' => 'A data da baixa/entrega é inválida.',
        ];
    }
}
