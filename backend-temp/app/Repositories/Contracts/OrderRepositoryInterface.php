<?php

namespace App\Repositories\Contracts;

use Illuminate\Pagination\LengthAwarePaginator;

interface OrderRepositoryInterface
{
    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator;
    public function findByOrderNumber(string $orderNumber): ?Order;
    public function findById(int $id): ?Order;
    public function getByUser(int $userId, int $perPage = 15): LengthAwarePaginator;
    public function getByStatus(string $status): iterable;
    public function create(array $data, array $items);
    public function updateStatus(int $id, string $status): bool;
    public function updatePaymentStatus(int $id, string $status, ?string $transactionId = null): bool;
    public function getRevenueRange(string $startDate, string $endDate): float;
    public function getTotalOrders(): int;
    public function getPendingOrders(): int;
    public function getActiveOrders(): int;
    public function getTotalMargin(): float;
}
