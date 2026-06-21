<?php

namespace App\Services;

use App\Repositories\Contracts\CartRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Support\Facades\Redis;

class CartService
{
    public function __construct(
        private CartRepositoryInterface $cartRepository,
        private ProductRepositoryInterface $productRepository,
    ) {}

    public function getCart(string $sessionId, ?int $userId = null): array
    {
        $items = $this->cartRepository->getCart($sessionId, $userId);
        $total = $this->cartRepository->getCartTotal($sessionId, $userId);
        $count = $this->cartRepository->getCartCount($sessionId, $userId);

        return [
            'items' => $items->values()->map(fn($item) => $this->formatItem($item)),
            'total' => $total,
            'count' => count($items),
            'item_count' => $count,
        ];
    }

    public function addItem(string $sessionId, int $productId, int $quantity = 1, ?array $attributes = null, ?int $userId = null): array
    {
        $product = $this->productRepository->findById($productId);

        if (!$product || !$product->is_active) {
            throw new \RuntimeException('Product not found or inactive.');
        }

        $item = $this->cartRepository->addItem($sessionId, $productId, $quantity, $attributes, $userId);

        $this->publishCartUpdate($sessionId);

        return $this->formatItem($item);
    }

    public function updateQuantity(string $sessionId, int $itemId, int $quantity): array
    {
        $this->cartRepository->updateItemQuantity($itemId, $quantity);
        $this->publishCartUpdate($sessionId);

        return $this->getCart($sessionId);
    }

    public function removeItem(string $sessionId, int $itemId): array
    {
        $this->cartRepository->removeItem($itemId);
        $this->publishCartUpdate($sessionId);

        return $this->getCart($sessionId);
    }

    public function clearCart(string $sessionId, ?int $userId = null): array
    {
        $this->cartRepository->clearCart($sessionId, $userId);
        $this->publishCartUpdate($sessionId);

        return ['items' => [], 'total' => 0, 'count' => 0, 'item_count' => 0];
    }

    public function getCartCount(string $sessionId, ?int $userId = null): int
    {
        return $this->cartRepository->getCartCount($sessionId, $userId);
    }

    public function mergeGuestCart(int $userId, string $sessionId): void
    {
        $this->cartRepository->mergeGuestCart($userId, $sessionId);
        $this->publishCartUpdate($sessionId);
    }

    private function formatItem($item): array
    {
        $product = $item->product;

        return [
            'id' => $item->id,
            'product_id' => $product->id,
            'sku' => $product->sku,
            'name' => $product->name,
            'slug' => $product->slug,
            'image' => $product->images[0] ?? null,
            'price' => $product->price,
            'compare_at_price' => $product->compare_at_price,
            'quantity' => $item->quantity,
            'subtotal' => round($product->price * $item->quantity, 2),
            'stock_quantity' => $product->stock_quantity,
            'selected_attributes' => $item->selected_attributes,
            'max_purchasable' => $product->stock_quantity,
        ];
    }

    private function publishCartUpdate(string $sessionId): void
    {
        try {
            Redis::publish('cart-updates', json_encode([
                'session_id' => $sessionId,
                'timestamp' => now()->toIso8601String(),
            ]));
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
