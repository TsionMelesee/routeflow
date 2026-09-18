<?php

namespace App\Http\Requests\Vehicles;

use App\Enums\VehicleStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('vehicle'));
    }

    public function rules(): array
    {
        $organizationId = $this->user()->organization_id;
        $vehicleId = $this->route('vehicle')->id;

        return [
            'plate_number' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('vehicles')->where('organization_id', $organizationId)->ignore($vehicleId)],
            'type' => ['nullable', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'year' => ['nullable', 'integer', 'min:1980', 'max:'.(date('Y') + 1)],
            'capacity' => ['nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', new Enum(VehicleStatus::class)],
        ];
    }
}
