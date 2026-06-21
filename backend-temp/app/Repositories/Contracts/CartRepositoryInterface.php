<?php

namespace App\Repositories\Contracts;

interface CartRepositoryInterface
{
    public function getCart(string $sessionId, ?int $userId = null): iterable;
    public function addItem(string $sessionId, int $productId, int $quantity, ?array $attributes = null, ?int $userId = null);
    public function updateItemQuantity(int $itemId, int $quantity): bool;
    public function removeItem(int $itemId): bool;
    public function clearCart(string $sessionId, ?int $userId = null): bool;
    public function getCartCount(string $sessionId, ?int $userId = null): int;
    public function getCartTotal(string $sessionId, ?int $userId = null): float;
    public function mergeGuestCart(int $userId, string $sessionId): void;
}
