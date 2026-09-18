<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransferInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermission('inventory.transfer');
    }

    public function rules(): array
    {
        $organizationId = $this->user()->organization_id;

        return [
            'product_id' => ['required', 'integer', Rule::exists('products', 'id')->where('organization_id', $organizationId)],
            'from_warehouse_id' => ['required', 'integer', 'different:to_warehouse_id', Rule::exists('warehouses', 'id')->where('organization_id', $organizationId)],
            'to_warehouse_id' => ['required', 'integer', Rule::exists('warehouses', 'id')->where('organization_id', $organizationId)],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
