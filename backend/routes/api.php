<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public routes
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/search', [ProductController::class, 'search']);
    Route::get('products/{slug}', [ProductController::class, 'show']);

    Route::get('cart', [CartController::class, 'index']);
    Route::post('cart', [CartController::class, 'add']);
    Route::put('cart/{itemId}', [CartController::class, 'update']);
    Route::delete('cart/{itemId}', [CartController::class, 'remove']);
    Route::delete('cart', [CartController::class, 'clear']);
    Route::get('cart/count', [CartController::class, 'count']);

    // Checkout & Orders
    Route::post('checkout', [OrderController::class, 'checkout']);
    Route::post('payments/confirm', [OrderController::class, 'confirmPayment']);
    Route::get('orders/{orderNumber}', [OrderController::class, 'show']);

    // Authenticated user routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('orders', [OrderController::class, 'myOrders']);
    });

    // Admin routes
    Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
        Route::get('dashboard/metrics', [AdminController::class, 'metrics']);
        Route::get('orders', [AdminController::class, 'orders']);
        Route::put('orders/{orderId}/status', [AdminController::class, 'updateOrderStatus']);
        Route::get('products', [AdminController::class, 'products']);
    });
});
