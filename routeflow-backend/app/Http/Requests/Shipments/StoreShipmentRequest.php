<?php

namespace App\Http\Requests\Shipments;

use App\Enums\OrderPriority;
use App\Models\Shipment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreShipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Shipment::class);
    }

    public function rules(): array
    {
        $organizationId = $this->user()->organization_id;

        return [
            'origin_warehouse_id' => ['required', 'integer', Rule::exists('warehouses', 'id')->where('organization_id', $organizationId)],
            'destination_address' => ['required', 'string', 'max:255'],
            'destination_city' => ['nullable', 'string', 'max:255'],
            'priority' => ['sometimes', new Enum(OrderPriority::class)],
            'expected_delivery_at' => ['nullable', 'date'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', Rule::exists('products', 'id')->where('organization_id', $organizationId)],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
