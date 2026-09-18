<?php

namespace App\Http\Requests\Deliveries;

use App\Enums\DeliveryFailureReason;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class ReportDeliveryFailureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('updateStatus', $this->route('delivery'));
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', new Enum(DeliveryFailureReason::class)],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
