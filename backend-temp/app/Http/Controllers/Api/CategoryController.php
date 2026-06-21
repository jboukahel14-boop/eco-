<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function __construct(
        private CategoryRepositoryInterface $categoryRepository,
    ) {}

    public function index(): JsonResponse
    {
        try {
            $categories = $this->categoryRepository->getAllActive();

            return response()->json([
                'data' => $categories,
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'Failed to fetch categories.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
