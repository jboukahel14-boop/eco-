<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = [
        'session_id', 'user_id', 'product_id', 'quantity', 'selected_attributes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'selected_attributes' => 'array',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getSubtotalAttribute(): float
    {
        return round($this->product->price * $this->quantity, 2);
    }
}
