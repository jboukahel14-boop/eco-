<?php

namespace App\Repositories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class OrderRepository implements OrderRepositoryInterface
{
    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Order::with('items')->orderBy('created_at', 'desc');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('shipping_name', 'like', "%{$search}%")
                  ->orWhere('shipping_email', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function findByOrderNumber(string $orderNumber): ?Order
    {
        return Order::with('items', 'user')
            ->where('order_number', $orderNumber)
            ->first();
    }

    public function findById(int $id): ?Order
    {
        return Order::with('items', 'user')->find($id);
    }

    public function getByUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Order::with('items')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getByStatus(string $status): iterable
    {
        return Order::with('items')
            ->where('status', $status)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function create(array $data, array $items)
    {
        return DB::transaction(function () use ($data, $items) {
            $order = Order::create($data);

            foreach ($items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'] ?? null,
                    'product_name' => $item['product_name'],
                    'product_sku' => $item['product_sku'],
                    'unit_price' => $item['unit_price'],
                    'cost_price' => $item['cost_price'] ?? null,
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['subtotal'],
                    'selected_attributes' => $item['selected_attributes'] ?? null,
                ]);
            }

            return $order->load('items');
        });
    }

    public function updateStatus(int $id, string $status): bool
    {
        $data = ['status' => $status];
        if ($status === Order::STATUS_CONFIRMED) {
            $data['confirmed_at'] = now();
        }
        return Order::where('id', $id)->update($data) > 0;
    }

    public function updatePaymentStatus(int $id, string $status, ?string $transactionId = null): bool
    {
        $data = ['payment_status' => $status];
        if ($transactionId) {
            $data['transaction_id'] = $transactionId;
        }
        return Order::where('id', $id)->update($data) > 0;
    }

    public function getRevenueRange(string $startDate, string $endDate): float
    {
        $cacheKey = "revenue:{$startDate}:{$endDate}";
        return Cache::remember($cacheKey, 600, function () use ($startDate, $endDate) {
            return (float) Order::where('payment_status', Order::PAYMENT_PAID)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('total');
        });
    }

    public function getTotalOrders(): int
    {
        return Cache::remember('metrics:total_orders', 300, function () {
            return Order::count();
        });
    }

    public function getPendingOrders(): int
    {
        return Cache::remember('metrics:pending_orders', 300, function () {
            return Order::whereIn('status', [Order::STATUS_PENDING, Order::STATUS_CONFIRMED])->count();
        });
    }

    public function getActiveOrders(): int
    {
        return Cache::remember('metrics:active_orders', 300, function () {
            return Order::whereIn('status', [
                Order::STATUS_CONFIRMED,
                Order::STATUS_PROCESSING,
                Order::STATUS_SHIPPED,
            ])->count();
        });
    }

    public function getTotalMargin(): float
    {
        return Cache::remember('metrics:total_margin', 300, function () {
            $orders = Order::where('payment_status', Order::PAYMENT_PAID)
                ->with('items')
                ->get();

            return $orders->sum(function ($order) {
                $cost = $order->items->sum(fn($item) => ($item->cost_price ?? 0) * $item->quantity);
                return $order->total - $cost;
            });
        });
    }
}
