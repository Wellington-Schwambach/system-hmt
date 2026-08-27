<?php

namespace App\Http\Requests\Operation;

use App\Models\LogisticsLoad;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MoveLogisticsLoadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stage' => ['required', Rule::in(LogisticsLoad::STAGES)],
            'position' => ['required', 'integer', 'min:0'],
        ];
    }
}
