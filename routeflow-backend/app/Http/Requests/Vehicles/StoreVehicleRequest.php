<?php

namespace App\Http\Requests\Vehicles;

use App\Models\Vehicle;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Vehicle::class);
    }

    public function rules(): array
    {
        $organizationId = $this->user()->organization_id;

        return [
            'plate_number' => ['required', 'string', 'max:50', Rule::unique('vehicles')->where('organization_id', $organizationId)],
            'type' => ['nullable', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'year' => ['nullable', 'integer', 'min:1980', 'max:'.(date('Y') + 1)],
            'capacity' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
