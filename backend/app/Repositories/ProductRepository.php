<?php

namespace App\Repositories;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class ProductRepository implements ProductRepositoryInterface
{
    public function getAllActive(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        $cacheKey = 'products:active:' . md5(serialize($filters) . $perPage . request('page', 1));

        return Cache::remember($cacheKey, 300, function () use ($filters, $perPage) {
            $query = Product::active()->with('categories');

            if (!empty($filters['category'])) {
                $query->whereHas('categories', fn($q) => $q->where('slug', $filters['category']));
            }

            if (!empty($filters['min_price'])) {
                $query->where('price', '>=', (float) $filters['min_price']);
            }

            if (!empty($filters['max_price'])) {
                $query->where('price', '<=', (float) $filters['max_price']);
            }

            if (!empty($filters['in_stock'])) {
                $query->where('stock_quantity', '>', 0);
            }

            if (!empty($filters['on_sale'])) {
                $query->whereNotNull('compare_at_price')
                      ->whereColumn('compare_at_price', '>', 'price');
            }

            $sortField = $filters['sort'] ?? 'created_at';
            $sortDir = $filters['direction'] ?? 'desc';

            $allowedSorts = ['price', 'name', 'created_at', 'rating', 'sold_count'];
            if (in_array($sortField, $allowedSorts)) {
                $query->orderBy($sortField, $sortDir === 'asc' ? 'asc' : 'desc');
            }

            return $query->paginate($perPage);
        });
    }

    public function findBySlug(string $slug): ?Product
    {
        return Cache::remember("products:slug:{$slug}", 300, function () use ($slug) {
            return Product::active()
                ->with(['categories'])
                ->where('slug', $slug)
                ->first();
        });
    }

    public function findById(int $id): ?Product
    {
        return Cache::remember("products:id:{$id}", 300, function () use ($id) {
            return Product::with('categories')->find($id);
        });
    }

    public function findByIds(array $ids): iterable
    {
        return Product::whereIn('id', $ids)->get();
    }

    public function search(string $query, int $perPage = 12): LengthAwarePaginator
    {
        return Product::active()
            ->with('categories')
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%")
                  ->orWhere('sku', 'like', "%{$query}%");
            })
            ->paginate($perPage);
    }

    public function getLowStock(): iterable
    {
        return Product::lowStock()
            ->orderBy('stock_quantity')
            ->get();
    }

    public function getOutOfStock(): iterable
    {
        return Product::outOfStock()
            ->orderBy('name')
            ->get();
    }

    public function updateStock(int $id, int $quantity): bool
    {
        $updated = Product::where('id', $id)->update(['stock_quantity' => $quantity]);
        $this->clearProductCache($id);
        return $updated > 0;
    }

    public function decrementStock(int $id, int $quantity): bool
    {
        $updated = Product::where('id', $id)
            ->where('stock_quantity', '>=', $quantity)
            ->decrement('stock_quantity', $quantity);
        $this->clearProductCache($id);
        return $updated > 0;
    }

    public function incrementStock(int $id, int $quantity): bool
    {
        $updated = Product::where('id', $id)->increment('stock_quantity', $quantity);
        $this->clearProductCache($id);
        return $updated > 0;
    }

    public function create(array $data)
    {
        $product = Product::create($data);
        if (!empty($data['categories'])) {
            $product->categories()->sync($data['categories']);
        }
        Cache::forget('products:active:*');
        return $product;
    }

    public function update(int $id, array $data): bool
    {
        $product = Product::find($id);
        if (!$product) {
            return false;
        }
        $product->update($data);
        if (isset($data['categories'])) {
            $product->categories()->sync($data['categories']);
        }
        $this->clearProductCache($id);
        return true;
    }

    public function delete(int $id): bool
    {
        $product = Product::find($id);
        if (!$product) {
            return false;
        }
        $product->categories()->detach();
        $product->delete();
        $this->clearProductCache($id);
        return true;
    }

    private function clearProductCache(int $id): void
    {
        Cache::forget("products:id:{$id}");
        Cache::forget('products:active:*');
    }
}
