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

    protected function prepareForValidation(): void
    {
        $plateMode = strtoupper(trim((string) $this->input('plate_mode', 'FLEET')));
        if (! in_array($plateMode, ['FLEET', 'THIRD_PARTY'], true)) {
            $plateMode = 'FLEET';
        }

        $normalizeThirdPartyPlate = static function ($value): ?string {
            $normalized = preg_replace('/\s+/', ' ', strtoupper(trim((string) $value)));
            return $normalized === '' ? null : $normalized;
        };

        $containerNumber = strtoupper(trim((string) $this->input('container_number', '')));
        $driverId = $this->input('driver_id');
        $driverTwoId = $this->input('driver_two_id');
        if (empty($driverId) || (string) $driverId === (string) $driverTwoId) {
            $driverTwoId = null;
        }

        $this->merge([
            'container_number' => $containerNumber === '' ? null : $containerNumber,
            'plate_mode' => $plateMode,
            'driver_two_id' => $driverTwoId,
            'tractor_id' => $plateMode === 'FLEET' ? $this->input('tractor_id') : null,
            'trailer_id' => $plateMode === 'FLEET' ? $this->input('trailer_id') : null,
            'third_party_tractor_plate' => $plateMode === 'THIRD_PARTY'
                ? $normalizeThirdPartyPlate($this->input('third_party_tractor_plate'))
                : null,
            'third_party_trailer_plate' => $plateMode === 'THIRD_PARTY'
                ? $normalizeThirdPartyPlate($this->input('third_party_trailer_plate'))
                : null,
        ]);
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
            'load_number' => ['exclude_unless:load_mode,LOAD', 'nullable', 'string', 'max:100'],
            'shipowner' => ['nullable', 'string', 'max:140'],
            'booking_number' => ['nullable', 'string', 'max:100'],
            'collection_booking_number' => ['nullable', 'string', 'max:100'],
            'grade_number' => ['nullable', 'string', 'max:100'],
            'grade_at' => ['nullable', 'date'],
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
                'integer',
                Rule::exists('employees', 'id')->where(fn ($query) => $query->where('status', 'ACTIVE')),
            ],
            'plate_mode' => ['nullable', Rule::in(['FLEET', 'THIRD_PARTY'])],
            'tractor_id' => [
                Rule::excludeIf(fn (): bool => $this->input('plate_mode') === 'THIRD_PARTY'),
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
                Rule::excludeIf(fn (): bool => $this->input('plate_mode') === 'THIRD_PARTY'),
                'nullable',
                'integer',
                Rule::exists('vehicles', 'id')->where(fn ($query) => $query->where('type', 'TRAILER')->where('status', 'ACTIVE')),
            ],
            'third_party_tractor_plate' => [
                Rule::excludeIf(fn (): bool => $this->input('plate_mode') !== 'THIRD_PARTY'),
                'nullable',
                'string',
                'max:40',
            ],
            'third_party_trailer_plate' => [
                Rule::excludeIf(fn (): bool => $this->input('plate_mode') !== 'THIRD_PARTY'),
                'nullable',
                'string',
                'max:40',
            ],
            'collection_terminal' => ['nullable', 'string', 'max:180'],
            'collection_at' => ['nullable', 'date'],
            'loading_location' => ['nullable', 'string', 'max:180'],
            'loading_at' => ['nullable', 'date'],
            'delivery_location' => ['nullable', 'string', 'max:180'],
            'delivery_at' => ['nullable', 'date'],
            'plan' => ['nullable', 'string', 'max:120'],
            'load_mode' => ['nullable', Rule::in(['CARGO', 'LOAD'])],
            'load_status' => ['exclude_unless:load_mode,LOAD', 'nullable', Rule::in(['EMPTY', 'FULL'])],
            'cargo_number' => ['exclude_unless:load_mode,CARGO', 'nullable', 'string', 'max:100'],
            'load_entries' => ['exclude_unless:load_mode,LOAD', 'nullable', 'array', 'max:10'],
            'load_entries.*.status' => ['required', Rule::in(['EMPTY', 'FULL'])],
            'load_entries.*.number' => ['nullable', 'string', 'max:100'],
            'container_number' => ['nullable', 'string', 'size:11', 'regex:/^[A-Z]{4}[0-9]{7}$/'],
            'container_tare_kg' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'container_payload_kg' => ['nullable', 'integer', 'min:0', 'max:99999'],
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
            'plate_mode.in' => 'Selecione uma opção válida para as placas.',
            'third_party_tractor_plate.max' => 'A descrição da placa principal do terceiro deve possuir no máximo 40 caracteres.',
            'third_party_trailer_plate.max' => 'A descrição da placa da carreta do terceiro deve possuir no máximo 40 caracteres.',
            'shipper_id.required' => 'Selecione o embarcador da carga.',
            'shipper_id.exists' => 'O embarcador selecionado não está ativo.',
            'collection_at.date' => 'A data da coleta realizada é inválida.',
            'grade_at.date' => 'A data/hora da grade é inválida.',
            'load_entries.*.status.required' => 'Informe se cada Load está vazia ou cheia.',
            'container_number.size' => 'O número do container deve ter exatamente 11 caracteres.',
            'container_number.regex' => 'O número do container deve conter 4 letras seguidas de 7 números.',
            'container_tare_kg.integer' => 'A tara deve conter somente números inteiros.',
            'container_tare_kg.max' => 'A tara deve ter no máximo 4 dígitos.',
            'container_payload_kg.integer' => 'O payload deve conter somente números inteiros.',
            'container_payload_kg.max' => 'O payload deve ter no máximo 5 dígitos.',
            'loading_at.date' => 'A data do carregamento é inválida.',
            'delivery_at.date' => 'A data da baixa/entrega é inválida.',
        ];
    }
}
