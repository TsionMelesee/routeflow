<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasPermission('audit-logs.view'), 403);

        $logs = AuditLog::query()
            ->with('user')
            ->when($request->filled('entity_type'), fn ($q) => $q->where('entity_type', 'like', '%'.$request->input('entity_type')))
            ->when($request->filled('action'), fn ($q) => $q->where('action', $request->input('action')))
            ->when($request->filled('user_id'), fn ($q) => $q->where('user_id', $request->input('user_id')))
            ->latest('created_at')
            ->paginate($request->integer('per_page', 30));

        return response()->json([
            'data' => AuditLogResource::collection($logs),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }

    public function show(Request $request, AuditLog $auditLog): JsonResponse
    {
        abort_unless($request->user()->hasPermission('audit-logs.view'), 403);

        return response()->json(['data' => new AuditLogResource($auditLog->load('user'))]);
    }
}
