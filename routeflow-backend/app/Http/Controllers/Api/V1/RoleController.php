<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Roles\StoreRoleRequest;
use App\Http\Requests\Roles\UpdateRolePermissionsRequest;
use App\Http\Requests\Roles\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /** Global template roles + this organization's own custom roles. */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Role::class);

        $roles = Role::query()
            ->with('permissions')
            ->where(fn ($q) => $q->whereNull('organization_id')->orWhere('organization_id', $request->user()->organization_id))
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => RoleResource::collection($roles)]);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = Role::create([
            'organization_id' => $request->user()->organization_id,
            'name' => $request->input('name'),
            'slug' => $request->input('slug'),
            'description' => $request->input('description'),
            'is_system' => false,
        ]);

        if ($request->filled('permissions')) {
            $ids = Permission::whereIn('slug', $request->input('permissions'))->pluck('id');
            $role->permissions()->sync($ids);
        }

        return response()->json(['data' => new RoleResource($role->load('permissions'))], 201);
    }

    public function show(Request $request, Role $role): JsonResponse
    {
        $this->authorize('view', $role);

        return response()->json(['data' => new RoleResource($role->load('permissions'))]);
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $role->update($request->validated());

        return response()->json(['data' => new RoleResource($role->load('permissions'))]);
    }

    public function destroy(Request $request, Role $role): JsonResponse
    {
        $this->authorize('delete', $role);

        if ($role->users()->exists()) {
            return response()->json(['message' => 'This role is still assigned to users and cannot be deleted.'], 422);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted.']);
    }

    /** PUT /roles/{role}/permissions */
    public function updatePermissions(UpdateRolePermissionsRequest $request, Role $role): JsonResponse
    {
        $ids = Permission::whereIn('slug', $request->input('permissions'))->pluck('id');
        $role->permissions()->sync($ids);

        return response()->json(['data' => new RoleResource($role->load('permissions'))]);
    }
}
