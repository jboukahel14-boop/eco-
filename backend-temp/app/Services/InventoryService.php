<?php

namespace App\Services;

use App\Events\InventoryUpdated;
use App\Models\InventoryLog;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class InventoryService
{
    const TYPE_ORDER = 'order';
    const TYPE_RESTOCK = 'restock';
    const TYPE_ADJUSTMENT = 'adjustment';
    const TYPE_REFUND = 'refund';
    const TYPE_CANCELLATION = 'cancellation';

    public function __construct(
        private ProductRepositoryInterface $productRepository,
    ) {}

    public function decrementStock(int $productId, int $quantity, string $type, ?int $orderId = null, string $reason = null): void
    {
        DB::transaction(function () use ($productId, $quantity, $type, $orderId, $reason) {
            $product = $this->productRepository->findById($productId);

            if (!$product) {
                throw new \RuntimeException("Product #{$productId} not found.");
            }

            if ($product->stock_quantity < $quantity) {
                throw new \RuntimeException(
                    "Insufficient stock for '{$product->name}': have {$product->stock_quantity}, need {$quantity}."
                );
            }

            $quantityBefore = $product->stock_quantity;
            $quantityAfter = $quantityBefore - $quantity;

            $this->productRepository->updateStock($productId, $quantityAfter);

            InventoryLog::create([
                'product_id' => $productId,
                'order_id' => $orderId,
                'type' => $type,
                'quantity_change' => -$quantity,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityAfter,
                'reason' => $reason,
            ]);

            $this->broadcastStockUpdate($productId, $quantityAfter, $product->low_stock_threshold);
        });
    }

    public function incrementStock(int $productId, int $quantity, string $type, ?int $orderId = null, string $reason = null): void
    {
        DB::transaction(function () use ($productId, $quantity, $type, $orderId, $reason) {
            $product = $this->productRepository->findById($productId);

            if (!$product) {
                throw new \RuntimeException("Product #{$productId} not found.");
            }

            $quantityBefore = $product->stock_quantity;
            $quantityAfter = $quantityBefore + $quantity;

            $this->productRepository->updateStock($productId, $quantityAfter);

            InventoryLog::create([
                'product_id' => $productId,
                'order_id' => $orderId,
                'type' => $type,
                'quantity_change' => $quantity,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityAfter,
                'reason' => $reason,
            ]);

            $this->broadcastStockUpdate($productId, $quantityAfter, $product->low_stock_threshold);
        });
    }

    public function getStockLevel(int $productId): int
    {
        $cached = Redis::get("stock:{$productId}");
        if ($cached !== null) {
            return (int) $cached;
        }

        $product = $this->productRepository->findById($productId);
        $stock = $product?->stock_quantity ?? 0;

        Redis::setex("stock:{$productId}", 60, $stock);
        return $stock;
    }

    public function getLowStockProducts(): iterable
    {
        return $this->productRepository->getLowStock();
    }

    public function getOutOfStockProducts(): iterable
    {
        return $this->productRepository->getOutOfStock();
    }

    private function broadcastStockUpdate(int $productId, int $newStock, int $threshold): void
    {
        try {
            $payload = json_encode([
                'product_id' => $productId,
                'stock_quantity' => $newStock,
                'is_low_stock' => $newStock <= $threshold && $newStock > 0,
                'is_out_of_stock' => $newStock === 0,
                'timestamp' => now()->toIso8601String(),
            ]);

            Redis::publish('inventory-updates', $payload);

            event(new InventoryUpdated($productId, $newStock));
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
