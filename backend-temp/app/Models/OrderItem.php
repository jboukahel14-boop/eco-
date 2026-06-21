<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 'product_id', 'product_name', 'product_sku',
        'unit_price', 'cost_price', 'quantity', 'subtotal', 'selected_attributes',
    ];

    protected $casts = [
        'unit_price' => 'float',
        'cost_price' => 'float',
        'quantity' => 'integer',
        'subtotal' => 'float',
        'selected_attributes' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
