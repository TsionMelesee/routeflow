<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdjustInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermission('inventory.adjust');
    }

    public function rules(): array
    {
        $organizationId = $this->user()->organization_id;

        return [
            'warehouse_id' => ['required', 'integer', Rule::exists('warehouses', 'id')->where('organization_id', $organizationId)],
            'product_id' => ['required', 'integer', Rule::exists('products', 'id')->where('organization_id', $organizationId)],
            'quantity' => ['required', 'integer', 'not_in:0'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
