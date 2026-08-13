<?php

namespace App\Http\Requests\Operation;

use App\Models\Employee;
use App\Models\Shipper;
use App\Models\Vehicle;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreTravelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $ctes = $this->input('ctes');

        // Compatibilidade com versões anteriores do frontend.
        if (! is_array($ctes) || count($ctes) === 0) {
            $ctes = [[
                'cte_type' => $this->input('cte_type', 'NORMAL'),
                'cte_number' => $this->input('cte_number'),
                'cte_series' => $this->input('cte_series', '1'),
                'net_freight' => $this->input('net_freight'),
                'insurance_amount' => $this->input('insurance_amount', 0),
                'toll_amount' => $this->input('toll_amount', 0),
                'icms_amount' => $this->input('icms_amount', 0),
            ]];
        }

        $normalizedCtes = array_map(function ($cte): array {
            $cte = is_array($cte) ? $cte : [];

            return [
                'cte_type' => strtoupper(trim((string) ($cte['cte_type'] ?? 'NORMAL'))),
                'cte_number' => trim((string) ($cte['cte_number'] ?? '')),
                'cte_series' => trim((string) ($cte['cte_series'] ?? '1')),
                'net_freight' => $cte['net_freight'] ?? null,
                'insurance_amount' => $cte['insurance_amount'] ?? 0,
                'toll_amount' => $cte['toll_amount'] ?? 0,
                'icms_amount' => $cte['icms_amount'] ?? 0,
            ];
        }, $ctes);

        $this->merge([
            'ctes' => $normalizedCtes,
            'operation_type' => strtoupper(trim((string) $this->input('operation_type', 'FLEET'))),
            'third_party_name' => $this->nullableTrim('third_party_name'),
            'third_party_plate' => $this->nullableUppercasePlate('third_party_plate'),
        ]);
    }

    public function rules(): array
    {
        return [
            'travel_date' => ['required', 'date_format:Y-m-d'],
            'receipt_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:travel_date'],
            'origin' => ['required', 'string', 'max:150'],
            'destination' => ['required', 'string', 'max:150'],
            'shipper_id' => ['required', 'integer', 'exists:shippers,id'],
            'operation_type' => ['required', Rule::in(['FLEET', 'THIRD_PARTY'])],

            'vehicle_id' => ['nullable', 'integer', 'exists:vehicles,id', 'required_if:operation_type,FLEET'],
            'driver_one_id' => ['nullable', 'integer', 'exists:employees,id', 'required_if:operation_type,FLEET'],
            'driver_two_id' => ['nullable', 'integer', 'different:driver_one_id', 'exists:employees,id'],

            'third_party_name' => ['nullable', 'string', 'max:150', 'required_if:operation_type,THIRD_PARTY'],
            'third_party_plate' => ['nullable', 'string', 'between:7,8', 'regex:/^[A-Z0-9]+$/', 'required_if:operation_type,THIRD_PARTY'],
            'third_party_payout_amount' => ['nullable', 'numeric', 'min:0', 'max:999999999999.99', 'required_if:operation_type,THIRD_PARTY'],

            'detached_trailer_id' => ['nullable', 'integer', 'exists:vehicles,id'],

            'ctes' => ['required', 'array', 'min:1', 'max:20'],
            'ctes.*.cte_type' => ['required', Rule::in(['NORMAL', 'FREIGHT_COMPLEMENT'])],
            'ctes.*.cte_number' => ['required', 'string', 'max:30'],
            'ctes.*.cte_series' => ['required', 'string', 'max:10'],
            'ctes.*.net_freight' => ['required', 'numeric', 'min:0', 'max:999999999999.99'],
            'ctes.*.insurance_amount' => ['nullable', 'numeric', 'min:0', 'max:999999999999.99'],
            'ctes.*.toll_amount' => ['nullable', 'numeric', 'min:0', 'max:999999999999.99'],
            'ctes.*.icms_amount' => ['nullable', 'numeric', 'min:0', 'max:999999999999.99'],
        ];
    }

    public function messages(): array
    {
        return [
            'travel_date.required' => 'Informe a data da viagem.',
            'receipt_date.after_or_equal' => 'A data de recebimento não pode ser anterior à data da viagem.',
            'origin.required' => 'Informe a origem da viagem.',
            'destination.required' => 'Informe o destino da viagem.',
            'shipper_id.required' => 'Selecione o embarcador.',
            'shipper_id.exists' => 'O embarcador selecionado não existe mais. Atualize as opções e tente novamente.',
            'vehicle_id.required_if' => 'Selecione o cavalo utilizado na viagem.',
            'vehicle_id.exists' => 'O cavalo selecionado não existe mais no cadastro.',
            'driver_one_id.required_if' => 'Selecione pelo menos um motorista para a viagem da frota.',
            'driver_one_id.exists' => 'O motorista selecionado não existe mais no cadastro.',
            'driver_two_id.different' => 'O segundo motorista deve ser diferente do primeiro.',
            'driver_two_id.exists' => 'O segundo motorista selecionado não existe mais no cadastro.',
            'third_party_name.required_if' => 'Informe o terceiro contratado.',
            'third_party_plate.required_if' => 'Informe a placa utilizada pelo terceiro.',
            'third_party_plate.regex' => 'Informe uma placa válida para o terceiro.',
            'third_party_payout_amount.required_if' => 'Informe o valor de repasse ao terceiro.',
            'detached_trailer_id.exists' => 'A carreta selecionada não existe mais no cadastro.',
            'ctes.required' => 'Adicione pelo menos um CT-e à viagem.',
            'ctes.array' => 'Os CT-es informados não estão em um formato válido.',
            'ctes.min' => 'Adicione pelo menos um CT-e à viagem.',
            'ctes.max' => 'Uma viagem pode possuir no máximo 20 CT-es por lançamento.',
            'ctes.*.cte_type.required' => 'Selecione o tipo de todos os CT-es.',
            'ctes.*.cte_type.in' => 'Existe um CT-e com tipo inválido.',
            'ctes.*.cte_number.required' => 'Informe o número de todos os CT-es.',
            'ctes.*.cte_series.required' => 'Informe a série de todos os CT-es.',
            'ctes.*.net_freight.required' => 'Informe o frete líquido de todos os CT-es.',
            'ctes.*.net_freight.numeric' => 'Existe um CT-e com frete líquido inválido.',
            'ctes.*.insurance_amount.numeric' => 'Existe um CT-e com valor de seguro inválido.',
            'ctes.*.toll_amount.numeric' => 'Existe um CT-e com valor de pedágio inválido.',
            'ctes.*.icms_amount.numeric' => 'Existe um CT-e com valor de ICMS inválido.',
        ];
    }

    public function attributes(): array
    {
        return [
            'ctes.*.cte_type' => 'tipo do CT-e',
            'ctes.*.cte_number' => 'número do CT-e',
            'ctes.*.cte_series' => 'série do CT-e',
            'ctes.*.net_freight' => 'frete líquido',
            'ctes.*.insurance_amount' => 'seguro',
            'ctes.*.toll_amount' => 'pedágio',
            'ctes.*.icms_amount' => 'ICMS',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $this->validateCteUniqueness($validator);

                if ($this->filled('shipper_id')) {
                    $shipper = Shipper::query()->find($this->integer('shipper_id'));
                    if ($shipper && $shipper->status !== 'ACTIVE') {
                        $validator->errors()->add('shipper_id', 'O embarcador selecionado está inativo.');
                    }
                }

                $operationType = $this->input('operation_type');

                if ($operationType === 'FLEET' && $this->filled('vehicle_id')) {
                    $vehicle = Vehicle::query()->find($this->integer('vehicle_id'));
                    if ($vehicle && $vehicle->type !== 'TRACTOR') {
                        $validator->errors()->add('vehicle_id', 'A placa principal da viagem deve ser um cavalo.');
                    }
                    if ($vehicle && $vehicle->status !== 'ACTIVE') {
                        $validator->errors()->add('vehicle_id', 'O cavalo selecionado não está ativo.');
                    }
                }

                if ($this->filled('detached_trailer_id')) {
                    $trailer = Vehicle::query()->find($this->integer('detached_trailer_id'));
                    if ($trailer && $trailer->type !== 'TRAILER') {
                        $validator->errors()->add('detached_trailer_id', 'O desengate deve utilizar uma carreta cadastrada.');
                    }
                    if ($trailer && $trailer->status !== 'ACTIVE') {
                        $validator->errors()->add('detached_trailer_id', 'A carreta selecionada para o desengate não está ativa.');
                    }
                }

                foreach (['driver_one_id', 'driver_two_id'] as $field) {
                    if (! $this->filled($field)) {
                        continue;
                    }

                    $driver = Employee::query()->find($this->integer($field));
                    if ($driver && $driver->status !== 'ACTIVE') {
                        $validator->errors()->add($field, 'O motorista selecionado não está ativo.');
                    }
                    if ($driver && ! str_contains(strtolower($driver->job_title), 'motorista')) {
                        $validator->errors()->add($field, 'O colaborador selecionado não está cadastrado como motorista.');
                    }
                }
            },
        ];
    }

    private function validateCteUniqueness(Validator $validator): void
    {
        $ctes = $this->input('ctes', []);
        if (! is_array($ctes)) {
            return;
        }

        $travel = $this->route('travel');
        $travelId = is_object($travel) ? (int) $travel->getKey() : (int) ($travel ?: 0);
        $seen = [];

        foreach ($ctes as $index => $cte) {
            if (! is_array($cte)) {
                continue;
            }

            $number = trim((string) ($cte['cte_number'] ?? ''));
            $series = trim((string) ($cte['cte_series'] ?? ''));

            if ($number === '' || $series === '') {
                continue;
            }

            $keySource = $number.'|'.$series;
            $key = function_exists('mb_strtoupper') ? mb_strtoupper($keySource, 'UTF-8') : strtoupper($keySource);
            if (isset($seen[$key])) {
                $validator->errors()->add(
                    "ctes.$index.cte_number",
                    "O CT-e {$number}, série {$series}, foi informado mais de uma vez nesta viagem."
                );
                continue;
            }
            $seen[$key] = true;

            if (Schema::hasTable('travel_ctes')) {
                $query = DB::table('travel_ctes')
                    ->where('cte_number', $number)
                    ->where('cte_series', $series);

                if ($travelId > 0) {
                    $query->where('travel_id', '<>', $travelId);
                }

                if ($query->exists()) {
                    $validator->errors()->add(
                        "ctes.$index.cte_number",
                        "Já existe uma viagem com o CT-e {$number}, série {$series}."
                    );
                }
            }
        }
    }

    private function nullableTrim(string $field): ?string
    {
        $value = trim((string) $this->input($field));
        return $value === '' ? null : $value;
    }

    private function nullableUppercasePlate(string $field): ?string
    {
        $value = strtoupper((string) preg_replace('/[^A-Za-z0-9]/', '', (string) $this->input($field)));
        return $value === '' ? null : $value;
    }
}
