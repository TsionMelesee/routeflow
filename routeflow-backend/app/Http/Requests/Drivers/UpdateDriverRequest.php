<?php

namespace App\Http\Requests\Drivers;

use App\Enums\DriverStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('driver'));
    }

    public function rules(): array
    {
        $organizationId = $this->user()->organization_id;
        $driverId = $this->route('driver')->id;

        return [
            'license_number' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('drivers')->where('organization_id', $organizationId)->ignore($driverId)],
            'license_expiry' => ['nullable', 'date'],
            'status' => ['sometimes', new Enum(DriverStatus::class)],
        ];
    }
}
