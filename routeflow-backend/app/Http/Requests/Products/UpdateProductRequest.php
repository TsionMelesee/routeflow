<?php

namespace App\Http\Requests\Products;

use App\Enums\ProductStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('product'));
    }

    public function rules(): array
    {
        $organizationId = $this->user()->organization_id;
        $productId = $this->route('product')->id;

        return [
            'sku' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('products')->where('organization_id', $organizationId)->ignore($productId)],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'low_stock_threshold' => ['sometimes', 'integer', 'min:0'],
            'status' => ['sometimes', new Enum(ProductStatus::class)],
        ];
    }
}
