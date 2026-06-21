<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'sku', 'name', 'slug', 'description', 'images', 'price',
        'compare_at_price', 'cost_price', 'stock_quantity', 'low_stock_threshold',
        'is_active', 'attributes', 'weight', 'rating', 'review_count', 'sold_count',
    ];

    protected $casts = [
        'images' => 'array',
        'attributes' => 'array',
        'is_active' => 'boolean',
        'price' => 'float',
        'compare_at_price' => 'float',
        'cost_price' => 'float',
        'stock_quantity' => 'integer',
        'low_stock_threshold' => 'integer',
        'rating' => 'float',
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'category_product')
                    ->withTimestamps();
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function inventoryLogs(): HasMany
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                     ->where('stock_quantity', '>', 0);
    }

    public function scopeOutOfStock($query)
    {
        return $query->where('stock_quantity', '=', 0);
    }

    public function getDiscountPercentAttribute(): ?float
    {
        if ($this->compare_at_price && $this->compare_at_price > $this->price) {
            return round((($this->compare_at_price - $this->price) / $this->compare_at_price) * 100);
        }
        return null;
    }

    public function getMarginAttribute(): ?float
    {
        if ($this->cost_price) {
            return round($this->price - $this->cost_price, 2);
        }
        return null;
    }

    public function getMarginPercentAttribute(): ?float
    {
        if ($this->cost_price && $this->cost_price > 0) {
            return round((($this->price - $this->cost_price) / $this->price) * 100, 1);
        }
        return null;
    }

    public function isLowStock(): bool
    {
        return $this->stock_quantity <= $this->low_stock_threshold;
    }

    public function isOutOfStock(): bool
    {
        return $this->stock_quantity === 0;
    }
}
