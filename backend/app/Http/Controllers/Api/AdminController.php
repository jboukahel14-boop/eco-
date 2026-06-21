<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminController extends Controller
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
        private ProductRepositoryInterface $productRepository,
        private InventoryService $inventoryService,
    ) {}

    public function metrics(): JsonResponse
    {
        try {
            $data = Cache::remember('admin:dashboard:metrics', 300, function () {
                $totalRevenue = $this->orderRepository->getRevenueRange(
                    now()->startOfMonth()->toDateString(),
                    now()->toDateString()
                );

                $totalRevenueAllTime = $this->orderRepository->getRevenueRange(
                    '2020-01-01',
                    now()->toDateString()
                );

                $totalOrders = $this->orderRepository->getTotalOrders();
                $activeOrders = $this->orderRepository->getActiveOrders();
                $pendingOrders = $this->orderRepository->getPendingOrders();
                $totalMargin = $this->orderRepository->getTotalMargin();

                $lowStockProducts = $this->inventoryService->getLowStockProducts();
                $outOfStockProducts = $this->inventoryService->getOutOfStockProducts();

                return [
                    'revenue' => [
                        'monthly' => round($totalRevenue, 2),
                        'all_time' => round($totalRevenueAllTime, 2),
                        'margin' => round($totalMargin, 2),
                        'margin_percent' => $totalRevenueAllTime > 0
                            ? round(($totalMargin / $totalRevenueAllTime) * 100, 1)
                            : 0,
                    ],
                    'orders' => [
                        'total' => $totalOrders,
                        'active' => $activeOrders,
                        'pending' => $pendingOrders,
                    ],
                    'inventory' => [
                        'low_stock_count' => count($lowStockProducts),
                        'out_of_stock_count' => count($outOfStockProducts),
                        'low_stock' => $lowStockProducts->values(),
                        'out_of_stock' => $outOfStockProducts->values(),
                    ],
                ];
            });

            return response()->json(['data' => $data]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'Failed to fetch dashboard metrics.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function orders(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['status', 'payment_status', 'date_from', 'date_to', 'search']);
            $orders = $this->orderRepository->getAll($filters);

            return response()->json([
                'data' => $orders->items(),
                'meta' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'total' => $orders->total(),
                ],
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'Failed to fetch orders.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function products(Request $request): JsonResponse
    {
        try {
            $products = $this->productRepository->getAllActive(
                $request->only(['category', 'in_stock']),
                (int) $request->input('per_page', 20)
            );

            return response()->json([
                'data' => $products->items(),
                'meta' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'total' => $products->total(),
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

    public function updateOrderStatus(Request $request, int $orderId): JsonResponse
    {
        try {
            $request->validate(['status' => 'required|string|in:pending,confirmed,processing,shipped,delivered,cancelled,refunded']);

            $updated = $this->orderRepository->updateStatus($orderId, $request->input('status'));

            if (!$updated) {
                return response()->json(['error' => 'Order not found.'], 404);
            }

            Cache::forget('admin:dashboard:metrics');

            return response()->json(['message' => 'Order status updated.']);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'Failed to update order status.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
