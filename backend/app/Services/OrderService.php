<?php

namespace App\Services;

use App\Events\OrderConfirmed;
use App\Events\LowStockAlert;
use App\Models\Order;
use App\Repositories\Contracts\CartRepositoryInterface;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
        private CartRepositoryInterface $cartRepository,
        private ProductRepositoryInterface $productRepository,
        private InventoryService $inventoryService,
    ) {}

    public function placeOrder(string $sessionId, array $shippingData, string $paymentMethod = 'stripe', ?int $userId = null): Order
    {
        $cartItems = $this->cartRepository->getCart($sessionId, $userId);

        if ($cartItems->isEmpty()) {
            throw new \RuntimeException('Cart is empty.');
        }

        return DB::transaction(function () use ($cartItems, $shippingData, $paymentMethod, $sessionId, $userId) {
            $subtotal = 0;
            $orderItems = [];

            foreach ($cartItems as $cartItem) {
                $product = $cartItem->product;

                if (!$product || !$product->is_active) {
                    throw new \RuntimeException("Product '{$cartItem->product->name}' is no longer available.");
                }

                if ($product->stock_quantity < $cartItem->quantity) {
                    throw new \RuntimeException(
                        "Insufficient stock for '{$product->name}'. Available: {$product->stock_quantity}, requested: {$cartItem->quantity}."
                    );
                }

                $itemSubtotal = round($product->price * $cartItem->quantity, 2);
                $subtotal += $itemSubtotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'unit_price' => $product->price,
                    'cost_price' => $product->cost_price,
                    'quantity' => $cartItem->quantity,
                    'subtotal' => $itemSubtotal,
                    'selected_attributes' => $cartItem->selected_attributes,
                ];
            }

            $taxAmount = round($subtotal * 0.10, 2);
            $shippingAmount = $subtotal >= 100 ? 0 : 9.99;
            $discountAmount = 0;
            $total = round($subtotal + $taxAmount + $shippingAmount - $discountAmount, 2);

            $orderData = [
                'order_number' => $this->generateOrderNumber(),
                'user_id' => $userId,
                'status' => Order::STATUS_PENDING,
                'session_id' => $sessionId,
                'shipping_name' => $shippingData['shipping_name'],
                'shipping_email' => $shippingData['shipping_email'],
                'shipping_phone' => $shippingData['shipping_phone'] ?? null,
                'shipping_address_line1' => $shippingData['shipping_address_line1'],
                'shipping_address_line2' => $shippingData['shipping_address_line2'] ?? null,
                'shipping_city' => $shippingData['shipping_city'],
                'shipping_state' => $shippingData['shipping_state'] ?? null,
                'shipping_postal_code' => $shippingData['shipping_postal_code'],
                'shipping_country' => $shippingData['shipping_country'],
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'shipping_amount' => $shippingAmount,
                'discount_amount' => $discountAmount,
                'total' => $total,
                'payment_method' => $paymentMethod,
                'payment_status' => Order::PAYMENT_PENDING,
            ];

            $order = $this->orderRepository->create($orderData, $orderItems);

            foreach ($cartItems as $cartItem) {
                $this->inventoryService->decrementStock(
                    $cartItem->product_id,
                    $cartItem->quantity,
                    InventoryService::TYPE_ORDER,
                    $order->id,
                    "Order #{$order->order_number}"
                );
            }

            $this->cartRepository->clearCart($sessionId, $userId);

            try {
                event(new OrderConfirmed($order));
            } catch (\Throwable $e) {
                report($e);
            }

            return $order;
        });
    }

    public function confirmOrder(int $orderId, string $transactionId = null): Order
    {
        return DB::transaction(function () use ($orderId, $transactionId) {
            $order = $this->orderRepository->findById($orderId);

            if (!$order) {
                throw new \RuntimeException('Order not found.');
            }

            $this->orderRepository->updateStatus($orderId, Order::STATUS_CONFIRMED);
            $this->orderRepository->updatePaymentStatus($orderId, Order::PAYMENT_PAID, $transactionId);

            $order->refresh();

            foreach ($order->items as $item) {
                if ($item->product_id && $this->productRepository->findById($item->product_id)?->isLowStock()) {
                    try {
                        event(new LowStockAlert($item->product));
                    } catch (\Throwable $e) {
                        report($e);
                    }
                }
            }

            return $order;
        });
    }

    public function cancelOrder(int $orderId, string $reason = null): Order
    {
        return DB::transaction(function () use ($orderId, $reason) {
            $order = $this->orderRepository->findById($orderId);

            if (!$order) {
                throw new \RuntimeException('Order not found.');
            }

            if (in_array($order->status, [Order::STATUS_DELIVERED, Order::STATUS_REFUNDED])) {
                throw new \RuntimeException('Order cannot be cancelled in its current state.');
            }

            $this->orderRepository->updateStatus($orderId, Order::STATUS_CANCELLED);

            foreach ($order->items as $item) {
                if ($item->product_id) {
                    $this->inventoryService->incrementStock(
                        $item->product_id,
                        $item->quantity,
                        InventoryService::TYPE_CANCELLATION,
                        $order->id,
                        $reason ?? "Order #{$order->order_number} cancelled"
                    );
                }
            }

            return $order->fresh()->load('items');
        });
    }

    private function generateOrderNumber(): string
    {
        $prefix = 'ORD-' . now()->format('Ymd');
        $random = strtoupper(Str::random(6));

        return "{$prefix}-{$random}";
    }
}
