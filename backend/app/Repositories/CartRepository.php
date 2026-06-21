<?php

namespace App\Repositories;

use App\Models\CartItem;
use App\Models\Product;
use App\Repositories\Contracts\CartRepositoryInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class CartRepository implements CartRepositoryInterface
{
    private function redisKey(string $sessionId): string
    {
        return "cart:{$sessionId}";
    }

    public function getCart(string $sessionId, ?int $userId = null): iterable
    {
        $query = CartItem::with('product.categories')
            ->where('session_id', $sessionId);

        if ($userId) {
            $query->orWhere('user_id', $userId);
        }

        $items = $query->get();

        return $items->filter(fn($item) => $item->product !== null);
    }

    public function addItem(string $sessionId, int $productId, int $quantity, ?array $attributes = null, ?int $userId = null)
    {
        $product = Product::findOrFail($productId);

        if ($product->stock_quantity < $quantity) {
            throw new \RuntimeException("Insufficient stock for product: {$product->name}");
        }

        $existing = CartItem::where('session_id', $sessionId)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            $newQty = $existing->quantity + $quantity;
            if ($product->stock_quantity < $newQty) {
                throw new \RuntimeException("Insufficient stock for product: {$product->name}");
            }
            $existing->update(['quantity' => $newQty]);
            $this->invalidateRedisCache($sessionId);
            return $existing;
        }

        $item = CartItem::create([
            'session_id' => $sessionId,
            'user_id' => $userId,
            'product_id' => $productId,
            'quantity' => $quantity,
            'selected_attributes' => $attributes,
        ]);

        $this->invalidateRedisCache($sessionId);
        return $item;
    }

    public function updateItemQuantity(int $itemId, int $quantity): bool
    {
        $item = CartItem::with('product')->findOrFail($itemId);

        if ($item->product->stock_quantity < $quantity) {
            throw new \RuntimeException("Insufficient stock for product: {$item->product->name}");
        }

        if ($quantity < 1) {
            return $this->removeItem($itemId);
        }

        $item->update(['quantity' => $quantity]);
        $this->invalidateRedisCache($item->session_id);
        return true;
    }

    public function removeItem(int $itemId): bool
    {
        $item = CartItem::findOrFail($itemId);
        $sessionId = $item->session_id;
        $item->delete();
        $this->invalidateRedisCache($sessionId);
        return true;
    }

    public function clearCart(string $sessionId, ?int $userId = null): bool
    {
        CartItem::where('session_id', $sessionId)->delete();
        if ($userId) {
            CartItem::where('user_id', $userId)->delete();
        }
        Redis::del($this->redisKey($sessionId));
        return true;
    }

    public function getCartCount(string $sessionId, ?int $userId = null): int
    {
        $cached = Redis::get($this->redisKey($sessionId) . ':count');
        if ($cached !== false && $cached !== null) {
            return (int) $cached;
        }

        $count = CartItem::where('session_id', $sessionId)->sum('quantity');
        Redis::setex($this->redisKey($sessionId) . ':count', 3600, $count);
        return $count;
    }

    public function getCartTotal(string $sessionId, ?int $userId = null): float
    {
        $cached = Redis::get($this->redisKey($sessionId) . ':total');
        if ($cached !== false && $cached !== null) {
            return (float) $cached;
        }

        $items = CartItem::with('product')
            ->where('session_id', $sessionId)
            ->get();

        $total = $items->sum(fn($item) => $item->product?->price * $item->quantity ?? 0);

        Redis::setex($this->redisKey($sessionId) . ':total', 3600, $total);
        return round($total, 2);
    }

    public function mergeGuestCart(int $userId, string $sessionId): void
    {
        $guestItems = CartItem::where('session_id', $sessionId)
            ->whereNull('user_id')
            ->get();

        foreach ($guestItems as $item) {
            $existing = CartItem::where('user_id', $userId)
                ->where('product_id', $item->product_id)
                ->first();

            if ($existing) {
                $existing->update(['quantity' => $existing->quantity + $item->quantity]);
                $item->delete();
            } else {
                $item->update(['user_id' => $userId]);
            }
        }

        Redis::del($this->redisKey($sessionId));
        Redis::del($this->redisKey($sessionId) . ':count');
        Redis::del($this->redisKey($sessionId) . ':total');
    }

    private function invalidateRedisCache(string $sessionId): void
    {
        Redis::del($this->redisKey($sessionId));
        Redis::del($this->redisKey($sessionId) . ':count');
        Redis::del($this->redisKey($sessionId) . ':total');
    }
}
