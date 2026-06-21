<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 30)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status', 40)->default('pending');
            $table->string('session_id', 100)->nullable();

            $table->string('shipping_name', 255);
            $table->string('shipping_email', 255);
            $table->string('shipping_phone', 30)->nullable();
            $table->string('shipping_address_line1', 255);
            $table->string('shipping_address_line2', 255)->nullable();
            $table->string('shipping_city', 120);
            $table->string('shipping_state', 120)->nullable();
            $table->string('shipping_postal_code', 20);
            $table->string('shipping_country', 100);

            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('shipping_amount', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);

            $table->string('payment_method', 60)->nullable();
            $table->string('payment_status', 40)->default('pending');
            $table->string('transaction_id', 255)->nullable();
            $table->json('payment_metadata')->nullable();

            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('user_id');
            $table->index('order_number');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name', 255);
            $table->string('product_sku', 60);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('cost_price', 12, 2)->nullable();
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->decimal('subtotal', 12, 2);
            $table->json('selected_attributes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
