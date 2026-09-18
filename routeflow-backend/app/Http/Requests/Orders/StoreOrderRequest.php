<?php

namespace App\Http\Requests\Orders;

use App\Enums\OrderPriority;
use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Order::class);
    }

    public function rules(): array
    {
        $organizationId = $this->user()->organization_id;

        return [
            'customer_id' => ['required', 'integer', Rule::exists('customers', 'id')->where('organization_id', $organizationId)],
            'priority' => ['sometimes', new Enum(OrderPriority::class)],
            'pickup_address' => ['nullable', 'string', 'max:255'],
            'pickup_city' => ['nullable', 'string', 'max:255'],
            'delivery_address' => ['required', 'string', 'max:255'],
            'delivery_city' => ['nullable', 'string', 'max:255'],
            'requested_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', Rule::exists('products', 'id')->where('organization_id', $organizationId)],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.notes' => ['nullable', 'string', 'max:255'],
        ];
    }
}
