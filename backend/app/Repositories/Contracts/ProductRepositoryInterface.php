<?php

namespace App\Repositories\Contracts;

use Illuminate\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    public function getAllActive(array $filters = [], int $perPage = 12): LengthAwarePaginator;
    public function findBySlug(string $slug): ?Product;
    public function findById(int $id): ?Product;
    public function findByIds(array $ids): iterable;
    public function search(string $query, int $perPage = 12): LengthAwarePaginator;
    public function getLowStock(): iterable;
    public function getOutOfStock(): iterable;
    public function updateStock(int $id, int $quantity): bool;
    public function decrementStock(int $id, int $quantity): bool;
    public function incrementStock(int $id, int $quantity): bool;
    public function create(array $data);
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}
