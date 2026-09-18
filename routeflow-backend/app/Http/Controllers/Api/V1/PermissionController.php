<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Role::class);

        $permissions = Permission::orderBy('group')->orderBy('slug')->get()->groupBy('group');

        return response()->json([
            'data' => $permissions->map(fn ($group) => PermissionResource::collection($group)),
        ]);
    }
}
