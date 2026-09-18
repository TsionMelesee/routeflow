<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvalidStatusTransitionException extends Exception
{
    public function __construct(
        private readonly string $from,
        private readonly string $to,
        private readonly string $field = 'status',
    ) {
        parent::__construct("Cannot transition from \"{$from}\" to \"{$to}\".");
    }

    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Invalid status transition.',
            'errors' => [
                $this->field => [$this->getMessage()],
            ],
        ], 422);
    }
}
