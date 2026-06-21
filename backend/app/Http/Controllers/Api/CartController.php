<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CartAddRequest;
use App\Http\Requests\CartUpdateRequest;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(
        private CartService $cartService,
    ) {}

    private function getSessionId(Request $request): string
    {
        return $request->header('X-Session-ID', $request->cookie('cart_session', session()->getId()));
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $sessionId = $this->getSessionId($request);
            $userId = $request->user()?->id;

            $cart = $this->cartService->getCart($sessionId, $userId);

            return response()->json(['data' => $cart]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'Failed to retrieve cart.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function add(CartAddRequest $request): JsonResponse
    {
        try {
            $sessionId = $this->getSessionId($request);
            $userId = $request->user()?->id;

            $item = $this->cartService->addItem(
                $sessionId,
                $request->validated('product_id'),
                $request->validated('quantity', 1),
                $request->validated('attributes'),
                $userId
            );

            return response()->json([
                'message' => 'Item added to cart.',
                'data' => $item,
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'Failed to add item to cart.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(CartUpdateRequest $request, int $itemId): JsonResponse
    {
        try {
            $sessionId = $this->getSessionId($request);

            $cart = $this->cartService->updateQuantity(
                $sessionId,
                $itemId,
                $request->validated('quantity')
            );

            return response()->json([
                'message' => 'Cart updated.',
                'data' => $cart,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'Failed to update cart.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function remove(Request $request, int $itemId): JsonResponse
    {
        try {
            $sessionId = $this->getSessionId($request);

            $cart = $this->cartService->removeItem($sessionId, $itemId);

            return response()->json([
                'message' => 'Item removed from cart.',
                'data' => $cart,
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'Failed to remove item.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function clear(Request $request): JsonResponse
    {
        try {
            $sessionId = $this->getSessionId($request);
            $userId = $request->user()?->id;

            $cart = $this->cartService->clearCart($sessionId, $userId);

            return response()->json([
                'message' => 'Cart cleared.',
                'data' => $cart,
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'Failed to clear cart.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function count(Request $request): JsonResponse
    {
        try {
            $sessionId = $this->getSessionId($request);
            $userId = $request->user()?->id;

            $count = $this->cartService->getCartCount($sessionId, $userId);

            return response()->json(['data' => ['count' => $count]]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'Failed to get cart count.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
