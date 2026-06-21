<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@shopwave.test'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        $electronics = Category::firstOrCreate(['slug' => 'electronics'], ['name' => 'Electronics', 'description' => 'Gadgets and devices', 'sort_order' => 1]);
        $clothing = Category::firstOrCreate(['slug' => 'clothing'], ['name' => 'Clothing', 'description' => 'Apparel and fashion', 'sort_order' => 2]);
        $home = Category::firstOrCreate(['slug' => 'home-living'], ['name' => 'Home & Living', 'description' => 'Home decor and essentials', 'sort_order' => 3]);
        $accessories = Category::firstOrCreate(['slug' => 'accessories'], ['name' => 'Accessories', 'description' => 'Bags, watches, and more', 'sort_order' => 4]);
        $newArrivals = Category::firstOrCreate(['slug' => 'new-arrivals'], ['name' => 'New Arrivals', 'description' => 'Latest products', 'sort_order' => 0]);

        $products = [
            [
                'sku' => 'ELEC-001', 'name' => 'Wireless Noise-Cancelling Headphones',
                'slug' => 'wireless-noise-cancelling-headphones', 'description' => 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.',
                'price' => 299.99, 'compare_at_price' => 399.99, 'cost_price' => 180.00,
                'stock_quantity' => 45, 'low_stock_threshold' => 10, 'rating' => 4.8, 'review_count' => 243, 'sold_count' => 1200,
                'images' => json_encode(['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600']),
                'categories' => [$electronics->id, $newArrivals->id],
            ],
            [
                'sku' => 'ELEC-002', 'name' => 'Smart Watch Pro',
                'slug' => 'smart-watch-pro', 'description' => 'Advanced fitness tracking, heart rate monitor, GPS, and 7-day battery life in a sleek design.',
                'price' => 449.99, 'compare_at_price' => 549.99, 'cost_price' => 260.00,
                'stock_quantity' => 28, 'low_stock_threshold' => 10, 'rating' => 4.6, 'review_count' => 187, 'sold_count' => 890,
                'images' => json_encode(['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600']),
                'categories' => [$electronics->id],
            ],
            [
                'sku' => 'CLTH-001', 'name' => 'Premium Cotton T-Shirt',
                'slug' => 'premium-cotton-tshirt', 'description' => 'Ultra-soft 100% organic cotton t-shirt. Pre-shrunk, breathable, and available in multiple colors.',
                'price' => 39.99, 'compare_at_price' => null, 'cost_price' => 12.00,
                'stock_quantity' => 200, 'low_stock_threshold' => 20, 'rating' => 4.5, 'review_count' => 512, 'sold_count' => 3500,
                'images' => json_encode(['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600']),
                'categories' => [$clothing->id],
            ],
            [
                'sku' => 'CLTH-002', 'name' => 'Slim Fit Denim Jacket',
                'slug' => 'slim-fit-denim-jacket', 'description' => 'Classic denim jacket with a modern slim fit. Durable denim with slight stretch for comfort.',
                'price' => 89.99, 'compare_at_price' => 119.99, 'cost_price' => 45.00,
                'stock_quantity' => 5, 'low_stock_threshold' => 10, 'rating' => 4.7, 'review_count' => 98, 'sold_count' => 420,
                'images' => json_encode(['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600']),
                'categories' => [$clothing->id],
            ],
            [
                'sku' => 'HOME-001', 'name' => 'Minimalist Desk Lamp',
                'slug' => 'minimalist-desk-lamp', 'description' => 'LED desk lamp with adjustable brightness, color temperature, and a sleek matte finish.',
                'price' => 59.99, 'compare_at_price' => null, 'cost_price' => 28.00,
                'stock_quantity' => 0, 'low_stock_threshold' => 10, 'rating' => 4.3, 'review_count' => 76, 'sold_count' => 310,
                'images' => json_encode(['https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600']),
                'categories' => [$home->id],
            ],
            [
                'sku' => 'ACCS-001', 'name' => 'Leather Crossbody Bag',
                'slug' => 'leather-crossbody-bag', 'description' => 'Genuine leather crossbody bag with adjustable strap, multiple compartments, and brass hardware.',
                'price' => 129.99, 'compare_at_price' => 169.99, 'cost_price' => 65.00,
                'stock_quantity' => 18, 'low_stock_threshold' => 10, 'rating' => 4.9, 'review_count' => 134, 'sold_count' => 670,
                'images' => json_encode(['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600']),
                'categories' => [$accessories->id, $newArrivals->id],
            ],
            [
                'sku' => 'ELEC-003', 'name' => 'Bluetooth Portable Speaker',
                'slug' => 'bluetooth-portable-speaker', 'description' => 'Waterproof portable speaker with 360° sound, 20-hour battery, and built-in microphone.',
                'price' => 79.99, 'compare_at_price' => 99.99, 'cost_price' => 40.00,
                'stock_quantity' => 3, 'low_stock_threshold' => 10, 'rating' => 4.4, 'review_count' => 201, 'sold_count' => 1500,
                'images' => json_encode(['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600']),
                'categories' => [$electronics->id],
            ],
            [
                'sku' => 'CLTH-003', 'name' => 'Cashmere Blend Scarf',
                'slug' => 'cashmere-blend-scarf', 'description' => 'Luxuriously soft cashmere blend scarf. Perfect for cooler weather with a timeless design.',
                'price' => 69.99, 'compare_at_price' => null, 'cost_price' => 30.00,
                'stock_quantity' => 12, 'low_stock_threshold' => 15, 'rating' => 4.6, 'review_count' => 45, 'sold_count' => 180,
                'images' => json_encode(['https://images.unsplash.com/photo-1601924994987-69e26d50fdc8?w=600']),
                'categories' => [$clothing->id, $accessories->id],
            ],
            [
                'sku' => 'HOME-002', 'name' => 'Ceramic Plant Pot Set',
                'slug' => 'ceramic-plant-pot-set', 'description' => 'Set of 3 handcrafted ceramic plant pots with drainage holes and bamboo trays.',
                'price' => 44.99, 'compare_at_price' => 54.99, 'cost_price' => 20.00,
                'stock_quantity' => 35, 'low_stock_threshold' => 10, 'rating' => 4.2, 'review_count' => 67, 'sold_count' => 290,
                'images' => json_encode(['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600']),
                'categories' => [$home->id, $newArrivals->id],
            ],
            [
                'sku' => 'ELEC-004', 'name' => 'USB-C Charging Hub',
                'slug' => 'usb-c-charging-hub', 'description' => '7-in-1 USB-C hub with 4K HDMI, 100W PD charging, SD card reader, and USB 3.0 ports.',
                'price' => 49.99, 'compare_at_price' => null, 'cost_price' => 22.00,
                'stock_quantity' => 60, 'low_stock_threshold' => 15, 'rating' => 4.5, 'review_count' => 312, 'sold_count' => 2100,
                'images' => json_encode(['https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=600']),
                'categories' => [$electronics->id],
            ],
        ];

        foreach ($products as $data) {
            $categories = $data['categories'];
            unset($data['categories']);
            $product = Product::firstOrCreate(['slug' => $data['slug']], $data);
            $product->categories()->sync($categories);
        }
    }
}
