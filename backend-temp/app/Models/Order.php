<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'user_id', 'status', 'session_id',
        'shipping_name', 'shipping_email', 'shipping_phone',
        'shipping_address_line1', 'shipping_address_line2',
        'shipping_city', 'shipping_state', 'shipping_postal_code', 'shipping_country',
        'subtotal', 'tax_amount', 'shipping_amount', 'discount_amount', 'total',
        'payment_method', 'payment_status', 'transaction_id', 'payment_metadata',
        'notes', 'metadata', 'confirmed_at',
    ];

    protected $casts = [
        'payment_metadata' => 'array',
        'metadata' => 'array',
        'confirmed_at' => 'datetime',
        'subtotal' => 'float',
        'tax_amount' => 'float',
        'shipping_amount' => 'float',
        'discount_amount' => 'float',
        'total' => 'float',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_PROCESSING = 'processing';
    const STATUS_SHIPPED = 'shipped';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REFUNDED = 'refunded';

    const PAYMENT_PENDING = 'pending';
    const PAYMENT_PAID = 'paid';
    const PAYMENT_FAILED = 'failed';
    const PAYMENT_REFUNDED = 'refunded';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function getItemCountAttribute(): int
    {
        return $this->items->sum('quantity');
    }

    public function getMarginAttribute(): ?float
    {
        $cost = $this->items->sum(fn($item) => ($item->cost_price ?? 0) * $item->quantity);
        return round($this->total - $cost, 2);
    }

    public function getMarginPercentAttribute(): ?float
    {
        if ($this->total > 0) {
            $cost = $this->items->sum(fn($item) => ($item->cost_price ?? 0) * $item->quantity);
            return round((($this->total - $cost) / $this->total) * 100, 1);
        }
        return 0;
    }
}
