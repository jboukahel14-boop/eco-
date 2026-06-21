<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontReport = [
        \RuntimeException::class,
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            if ($this->shouldReport($e)) {
                logger()->error($e->getMessage(), [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        });
    }

    public function render($request, Throwable $e): JsonResponse|\Illuminate\Http\Response
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return $this->renderApiException($e);
        }

        return parent::render($request, $e);
    }

    private function renderApiException(Throwable $e): JsonResponse
    {
        if ($e instanceof ValidationException) {
            return response()->json([
                'error' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        }

        if ($e instanceof NotFoundHttpException) {
            return response()->json([
                'error' => 'Resource not found.',
            ], 404);
        }

        if ($e instanceof HttpException) {
            return response()->json([
                'error' => $e->getMessage() ?: 'Request error.',
            ], $e->getStatusCode());
        }

        if ($e instanceof \RuntimeException) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }

        report($e);

        return response()->json([
            'error' => 'An unexpected error occurred.',
            'message' => config('app.debug') ? $e->getMessage() : null,
        ], 500);
    }
}
