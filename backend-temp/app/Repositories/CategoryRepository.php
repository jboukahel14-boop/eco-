<?php

namespace App\Repositories;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Support\Facades\Cache;

class CategoryRepository implements CategoryRepositoryInterface
{
    public function getAllActive(): iterable
    {
        return Cache::remember('categories:active', 600, function () {
            return Category::active()
                ->withCount('products')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get();
        });
    }

    public function findBySlug(string $slug): ?Category
    {
        return Cache::remember("categories:slug:{$slug}", 600, function () use ($slug) {
            return Category::active()->where('slug', $slug)->first();
        });
    }

    public function findById(int $id): ?Category
    {
        return Cache::remember("categories:id:{$id}", 600, function () use ($id) {
            return Category::find($id);
        });
    }

    public function getTree(): iterable
    {
        return Cache::remember('categories:tree', 600, function () {
            return Category::active()
                ->with('children')
                ->whereNull('parent_id')
                ->orderBy('sort_order')
                ->get();
        });
    }

    public function create(array $data)
    {
        $category = Category::create($data);
        Cache::forget('categories:active');
        Cache::forget('categories:tree');
        return $category;
    }

    public function update(int $id, array $data): bool
    {
        $category = Category::find($id);
        if (!$category) {
            return false;
        }
        $category->update($data);
        Cache::forget('categories:active');
        Cache::forget('categories:tree');
        Cache::forget("categories:id:{$id}");
        Cache::forget("categories:slug:{$category->slug}");
        return true;
    }

    public function delete(int $id): bool
    {
        $category = Category::find($id);
        if (!$category) {
            return false;
        }
        $category->products()->detach();
        $category->delete();
        Cache::forget('categories:active');
        Cache::forget('categories:tree');
        Cache::forget("categories:id:{$id}");
        return true;
    }
}
