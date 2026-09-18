<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Inventory\AdjustInventoryAction;
use App\Actions\Inventory\TransferInventoryAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\AdjustInventoryRequest;
use App\Http\Requests\Inventory\TransferInventoryRequest;
use App\Http\Resources\ProductStockResource;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;

class InventoryController extends Controller
{
    public function adjust(AdjustInventoryRequest $request, AdjustInventoryAction $action): JsonResponse
    {
        $warehouse = Warehouse::findOrFail($request->integer('warehouse_id'));
        $product = Product::findOrFail($request->integer('product_id'));

        $stock = $action->execute($warehouse, $product, $request->integer('quantity'), $request->user(), $request->input('notes'));

        return response()->json([
            'data' => new ProductStockResource($product->setRelation('pivot', $stock)),
            'message' => 'Inventory adjusted.',
        ]);
    }

    public function transfer(TransferInventoryRequest $request, TransferInventoryAction $action): JsonResponse
    {
        $product = Product::findOrFail($request->integer('product_id'));
        $from = Warehouse::findOrFail($request->integer('from_warehouse_id'));
        $to = Warehouse::findOrFail($request->integer('to_warehouse_id'));

        $result = $action->execute($product, $from, $to, $request->integer('quantity'), $request->user(), $request->input('notes'));

        return response()->json([
            'data' => [
                'from' => new ProductStockResource($product->setRelation('pivot', $result['from'])),
                'to' => new ProductStockResource($product->setRelation('pivot', $result['to'])),
            ],
            'message' => 'Inventory transferred.',
        ]);
    }
}
