<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Warehouses\StoreWarehouseRequest;
use App\Http\Requests\Warehouses\UpdateWarehouseRequest;
use App\Http\Resources\ProductStockResource;
use App\Http\Resources\WarehouseResource;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Warehouse::class);

        $warehouses = Warehouse::query()
            ->with('manager')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => WarehouseResource::collection($warehouses),
            'meta' => [
                'current_page' => $warehouses->currentPage(),
                'per_page' => $warehouses->perPage(),
                'total' => $warehouses->total(),
                'last_page' => $warehouses->lastPage(),
            ],
        ]);
    }

    public function store(StoreWarehouseRequest $request): JsonResponse
    {
        $warehouse = Warehouse::create($request->validated());

        return response()->json(['data' => new WarehouseResource($warehouse)], 201);
    }

    public function show(Warehouse $warehouse): JsonResponse
    {
        $this->authorize('view', $warehouse);

        return response()->json(['data' => new WarehouseResource($warehouse->load('manager'))]);
    }

    public function update(UpdateWarehouseRequest $request, Warehouse $warehouse): JsonResponse
    {
        $warehouse->update($request->validated());

        return response()->json(['data' => new WarehouseResource($warehouse)]);
    }

    public function destroy(Warehouse $warehouse): JsonResponse
    {
        $this->authorize('delete', $warehouse);

        if ($warehouse->warehouseProducts()->where('quantity', '>', 0)->exists()) {
            return response()->json([
                'message' => 'This warehouse still holds stock and cannot be deleted.',
            ], 422);
        }

        $warehouse->delete();

        return response()->json(['message' => 'Warehouse deleted.']);
    }

    /** GET /warehouses/{warehouse}/inventory — every product stocked here. */
    public function inventory(Warehouse $warehouse): JsonResponse
    {
        $this->authorize('view', $warehouse);

        $products = $warehouse->products()->get();

        return response()->json([
            'data' => ProductStockResource::collection($products),
        ]);
    }
}
