<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Models\Order;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Services\OrderService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService,
        private OrderRepositoryInterface $orderRepository,
        private PaymentService $paymentService,
    ) {}

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        try {
            $sessionId = $request->header('X-Session-ID', session()->getId());
            $userId = $request->user()?->id;

            $order = $this->orderService->placeOrder(
                $sessionId,
                $request->validated(),
                $request->input('payment_method', 'stripe'),
                $userId
            );

            $paymentResult = $this->paymentService->processPayment($order, $request->input('payment', []));

            if (!$paymentResult['success']) {
                return response()->json([
                    'error' => 'Payment processing failed.',
                    'details' => $paymentResult['error'],
                    'order' => $order->load('items'),
                ], 422);
            }

            return response()->json([
                'message' => 'Order placed successfully.',
                'data' => [
                    'order' => $order->load('items'),
                    'payment' => $paymentResult,
                ],
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'Checkout failed. Please try again.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $order = $this->orderRepository->findByOrderNumber($orderNumber);

            if (!$order) {
                return response()->json(['error' => 'Order not found.'], 404);
            }

            if ($request->user() && $request->user()->id !== $order->user_id && !$request->user()->isAdmin()) {
                return response()->json(['error' => 'Unauthorized.'], 403);
            }

            return response()->json(['data' => $order]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'Failed to fetch order.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function myOrders(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated.'], 401);
            }

            $orders = $this->orderRepository->getByUser($user->id);

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

    public function confirmPayment(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'payment_intent_id' => 'required|string',
                'order_number' => 'required|string',
            ]);

            $paymentResult = $this->paymentService->confirmStripePayment(
                $request->input('payment_intent_id')
            );

            if (!$paymentResult['success']) {
                return response()->json([
                    'error' => 'Payment confirmation failed.',
                    'details' => $paymentResult['error'],
                ], 422);
            }

            $order = $this->orderRepository->findByOrderNumber($request->input('order_number'));

            if ($order) {
                $this->orderService->confirmOrder($order->id, $paymentResult['transaction_id']);
            }

            return response()->json([
                'message' => 'Payment confirmed.',
                'data' => $paymentResult,
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'Payment confirmation failed.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
