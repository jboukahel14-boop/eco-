<?php

namespace App\Events;

use App\Models\Product;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LowStockAlert implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Product $product,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('admin');
    }

    public function broadcastAs(): string
    {
        return 'low.stock.alert';
    }

    public function broadcastWith(): array
    {
        return [
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'product_sku' => $this->product->sku,
            'stock_quantity' => $this->product->stock_quantity,
            'low_stock_threshold' => $this->product->low_stock_threshold,
            'is_out_of_stock' => $this->product->isOutOfStock(),
            'alert' => $this->product->isOutOfStock()
                ? "OUT OF STOCK: {$this->product->name}"
                : "LOW STOCK: {$this->product->name} ({$this->product->stock_quantity} remaining)",
        ];
    }
}
