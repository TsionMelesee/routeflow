<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Drivers\CreateDriverAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Drivers\StoreDriverRequest;
use App\Http\Requests\Drivers\UpdateDriverRequest;
use App\Http\Resources\DriverResource;
use App\Models\Driver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Driver::class);

        $drivers = Driver::query()
            ->with('user')
            ->withCount('activeDeliveries')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->boolean('available'), fn ($q) => $q->where('status', 'available'))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => DriverResource::collection($drivers),
            'meta' => [
                'current_page' => $drivers->currentPage(),
                'per_page' => $drivers->perPage(),
                'total' => $drivers->total(),
                'last_page' => $drivers->lastPage(),
            ],
        ]);
    }

    public function store(StoreDriverRequest $request, CreateDriverAction $action): JsonResponse
    {
        $driver = $action->execute($request->only(['name', 'email', 'password', 'phone']), $request->only(['license_number', 'license_expiry']), $request->user());

        return response()->json(['data' => new DriverResource($driver)], 201);
    }

    public function show(Driver $driver): JsonResponse
    {
        $this->authorize('view', $driver);

        return response()->json(['data' => new DriverResource($driver->load('user')->loadCount('activeDeliveries'))]);
    }

    public function update(UpdateDriverRequest $request, Driver $driver): JsonResponse
    {
        $driver->update($request->validated());

        return response()->json(['data' => new DriverResource($driver->load('user'))]);
    }

    public function destroy(Driver $driver): JsonResponse
    {
        $this->authorize('delete', $driver);

        if ($driver->activeDeliveries()->exists()) {
            return response()->json(['message' => 'This driver has active deliveries and cannot be removed.'], 422);
        }

        $driver->delete();

        return response()->json(['message' => 'Driver removed.']);
    }
}
