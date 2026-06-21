<?php

namespace App\Repositories\Contracts;

interface CategoryRepositoryInterface
{
    public function getAllActive(): iterable;
    public function findBySlug(string $slug): ?Category;
    public function findById(int $id): ?Category;
    public function getTree(): iterable;
    public function create(array $data);
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}
