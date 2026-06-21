<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductIndexRequest;
use App\Http\Requests\ProductSearchRequest;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function __construct(
        private ProductRepositoryInterface $productRepository,
        private CategoryRepositoryInterface $categoryRepository,
    ) {}

    public function index(ProductIndexRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();

            $categories = $this->categoryRepository->getAllActive();

            $products = $this->productRepository->getAllActive(
                $filters,
                (int) $request->input('per_page', 12)
            );

            return response()->json([
                'data' => $products->items(),
                'meta' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                ],
                'filters' => [
                    'categories' => $categories,
                ],
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'Failed to fetch products.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(string $slug): JsonResponse
    {
        try {
            $product = $this->productRepository->findBySlug($slug);

            if (!$product) {
                return response()->json([
                    'error' => 'Product not found.',
                ], 404);
            }

            return response()->json([
                'data' => $product->load('categories'),
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'Failed to fetch product.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function search(ProductSearchRequest $request): JsonResponse
    {
        try {
            $query = $request->validated('query', '');

            if (strlen($query) < 2) {
                return response()->json([
                    'data' => [],
                    'meta' => ['total' => 0],
                ]);
            }

            $products = $this->productRepository->search($query);

            return response()->json([
                'data' => $products->items(),
                'meta' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                ],
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'Search failed.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
