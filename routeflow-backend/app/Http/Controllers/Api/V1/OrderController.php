<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Orders\CreateOrderAction;
use App\Enums\OrderStatus;
use App\Exceptions\InvalidStatusTransitionException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Order::class);

        $orders = Order::query()
            ->with('customer')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('customer_id'), fn ($q) => $q->where('customer_id', $request->input('customer_id')))
            ->when($request->filled('search'), fn ($q) => $q->where('order_number', 'like', '%'.$request->input('search').'%'))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
                'last_page' => $orders->lastPage(),
            ],
        ]);
    }

    public function store(StoreOrderRequest $request, CreateOrderAction $action): JsonResponse
    {
        $customer = Customer::findOrFail($request->input('customer_id'));

        $order = $action->execute(
            $customer,
            $request->input('items'),
            $request->safe()->except(['customer_id', 'items']),
            $request->user(),
        );

        return response()->json(['data' => new OrderResource($order)], 201);
    }

    public function show(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        return response()->json(['data' => new OrderResource($order->load(['customer', 'items.product', 'shipment']))]);
    }

    /** POST /orders/{order}/process — PENDING -> PROCESSING. */
    public function process(Order $order): JsonResponse
    {
        $this->authorize('process', $order);

        $order->update(['status' => OrderStatus::PROCESSING]);

        return response()->json(['data' => new OrderResource($order), 'message' => 'Order is now processing.']);
    }

    /** POST /orders/{order}/cancel */
    public function cancel(Request $request, Order $order): JsonResponse
    {
        $this->authorize('cancel', $order);

        if (! $order->status->canTransitionTo(OrderStatus::CANCELLED)) {
            throw new InvalidStatusTransitionException($order->status->value, OrderStatus::CANCELLED->value);
        }

        $order->update(['status' => OrderStatus::CANCELLED, 'notes' => $request->input('reason') ?? $order->notes]);

        return response()->json(['data' => new OrderResource($order), 'message' => 'Order cancelled.']);
    }
}
