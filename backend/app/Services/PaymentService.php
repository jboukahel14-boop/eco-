<?php

namespace App\Services;

use App\Models\Order;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
    ) {}

    public function processPayment(Order $order, array $paymentData): array
    {
        $method = $order->payment_method;

        return match ($method) {
            'stripe' => $this->processStripePayment($order, $paymentData),
            'mock' => $this->processMockPayment($order, $paymentData),
            default => throw new \RuntimeException("Unsupported payment method: {$method}"),
        };
    }

    private function processStripePayment(Order $order, array $paymentData): array
    {
        try {
            if (!config('services.stripe.secret')) {
                Log::warning('Stripe secret not configured, falling back to mock payment.');
                return $this->processMockPayment($order, $paymentData);
            }

            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

            $paymentIntent = \Stripe\PaymentIntent::create([
                'amount' => (int) ($order->total * 100),
                'currency' => 'usd',
                'metadata' => [
                    'order_number' => $order->order_number,
                    'order_id' => $order->id,
                ],
                'description' => "Order #{$order->order_number}",
            ]);

            return [
                'success' => true,
                'transaction_id' => $paymentIntent->id,
                'client_secret' => $paymentIntent->client_secret,
                'status' => $paymentIntent->status,
            ];
        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error('Stripe payment failed: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'status' => 'failed',
            ];
        }
    }

    public function confirmStripePayment(string $paymentIntentId): array
    {
        try {
            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
            $intent = \Stripe\PaymentIntent::retrieve($paymentIntentId);

            if ($intent->status === 'succeeded') {
                return [
                    'success' => true,
                    'transaction_id' => $intent->id,
                    'status' => 'succeeded',
                ];
            }

            return [
                'success' => false,
                'status' => $intent->status,
                'error' => 'Payment has not succeeded yet.',
            ];
        } catch (\Stripe\Exception\ApiErrorException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'status' => 'error',
            ];
        }
    }

    private function processMockPayment(Order $order, array $paymentData): array
    {
        $transactionId = 'MOCK-' . strtoupper(\Illuminate\Support\Str::random(12));

        DB::transaction(function () use ($order, $transactionId) {
            $this->orderRepository->updatePaymentStatus(
                $order->id,
                Order::PAYMENT_PAID,
                $transactionId
            );
            $this->orderRepository->updateStatus($order->id, Order::STATUS_CONFIRMED);
        });

        return [
            'success' => true,
            'transaction_id' => $transactionId,
            'status' => 'succeeded',
        ];
    }

    public function processRefund(Order $order, ?float $amount = null): array
    {
        try {
            if (!$order->transaction_id) {
                throw new \RuntimeException('Order has no transaction to refund.');
            }

            $refundAmount = $amount ?? $order->total;

            if (config('services.stripe.secret')) {
                \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

                $refund = \Stripe\Refund::create([
                    'payment_intent' => $order->transaction_id,
                    'amount' => (int) ($refundAmount * 100),
                ]);

                $transactionId = $refund->id;
            } else {
                $transactionId = 'REF-' . strtoupper(\Illuminate\Support\Str::random(12));
            }

            DB::transaction(function () use ($order, $transactionId) {
                $this->orderRepository->updatePaymentStatus(
                    $order->id,
                    Order::PAYMENT_REFUNDED,
                    $transactionId
                );
                $this->orderRepository->updateStatus($order->id, Order::STATUS_REFUNDED);
            });

            return [
                'success' => true,
                'transaction_id' => $transactionId,
                'amount' => $refundAmount,
                'status' => 'succeeded',
            ];
        } catch (\Throwable $e) {
            Log::error('Refund failed: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'status' => 'failed',
            ];
        }
    }
}
