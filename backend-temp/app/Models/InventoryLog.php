<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryLog extends Model
{
    protected $fillable = [
        'product_id', 'order_id', 'type', 'quantity_change',
        'quantity_before', 'quantity_after', 'reason',
    ];

    protected $casts = [
        'quantity_change' => 'integer',
        'quantity_before' => 'integer',
        'quantity_after' => 'integer',
    ];

    const TYPE_ORDER = 'order';
    const TYPE_RESTOCK = 'restock';
    const TYPE_ADJUSTMENT = 'adjustment';
    const TYPE_REFUND = 'refund';
    const TYPE_CANCELLATION = 'cancellation';

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
