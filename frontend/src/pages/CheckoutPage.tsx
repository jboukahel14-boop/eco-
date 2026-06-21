import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart-store';
import { api } from '@/lib/api';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import type { CheckoutForm as CheckoutFormType, Order } from '@/types';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, count, fetchCart, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (count === 0) {
      fetchCart();
    }
  }, [count, fetchCart]);

  const handleSubmit = async (form: CheckoutFormType) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.checkout({
        ...form,
        payment_method: form.payment_method,
      });
      setOrder(res.data.order);
      await clearCart();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (order) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center"
        >
          <GlassCard className="p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-surface-900">Order Placed!</h2>
            <p className="mt-2 text-surface-500">
              Your order <span className="font-semibold text-surface-700">{order.order_number}</span> has been confirmed.
            </p>
            <p className="mt-1 text-sm text-surface-400">
              We'll send a confirmation to your email shortly.
            </p>

            <div className="mt-6 rounded-xl bg-surface-50 p-4 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Order Total</span>
                <span className="font-bold text-surface-900">{formatCurrency(order.total)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-surface-500">Payment</span>
                <span className="font-medium capitalize text-green-600">Paid</span>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/catalog')}>
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => navigate(`/orders/${order.order_number}`)}>
                View Order
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 pt-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-surface-900">Your Cart is Empty</h2>
          <p className="mt-2 text-surface-500">Add some items before checking out</p>
          <Link to="/catalog">
            <Button variant="primary" className="mt-6">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-surface-900">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CheckoutForm onSubmit={handleSubmit} isLoading={isLoading} />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-1">
            <GlassCard>
              <h3 className="mb-4 text-lg font-semibold text-surface-900">Order Summary</h3>

              <div className="space-y-4">
                {items.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-surface-100">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-surface-900">{item.name}</p>
                      <p className="text-xs text-surface-400">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium text-primary-600">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}

                {items.length > 5 && (
                  <p className="text-center text-sm text-surface-400">+{items.length - 5} more items</p>
                )}
              </div>

              <hr className="my-4 border-surface-200" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-500">Subtotal</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Shipping</span>
                  <span className="font-medium">{total >= 100 ? 'Free' : formatCurrency(9.99)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Tax</span>
                  <span className="font-medium">{formatCurrency(total * 0.1)}</span>
                </div>
              </div>

              <hr className="my-4 border-surface-200" />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(total + (total >= 100 ? 0 : 9.99) + total * 0.1)}</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
