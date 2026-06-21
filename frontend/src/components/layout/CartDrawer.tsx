import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/Button';
import { formatCurrency, getImageUrl } from '@/lib/utils';

export function CartDrawer() {
  const { isOpen, setOpen, items, total, count, isLoading, fetchCart, updateQuantity, removeItem } = useCartStore();

  useEffect(() => {
    if (isOpen && count === 0) {
      fetchCart();
    }
  }, [isOpen, fetchCart, count]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/20 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-surface-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold">Cart ({count})</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-surface-400 transition-colors hover:bg-surface-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag className="mb-4 h-12 w-12 text-surface-300" />
                  <p className="text-lg font-medium text-surface-500">Your cart is empty</p>
                  <p className="mt-1 text-sm text-surface-400">Add some items to get started</p>
                  <Button
                    variant="primary"
                    className="mt-6"
                    onClick={() => { setOpen(false); }}
                  >
                    <Link to="/catalog">Browse Products</Link>
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-surface-100">
                  {items.map((item) => (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 py-4"
                    >
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface-100">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <Link
                            to={`/products/${item.slug}`}
                            onClick={() => setOpen(false)}
                            className="text-sm font-medium text-surface-900 transition-colors hover:text-primary-600"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-0.5 text-sm font-semibold text-primary-600">
                            {formatCurrency(item.price)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-lg border border-surface-200 p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={isLoading}
                              className="rounded-md p-1 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-[24px] text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isLoading || item.quantity >= item.max_purchasable}
                              className="rounded-md p-1 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={isLoading}
                            className="rounded-xl p-2 text-surface-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-surface-200 px-6 py-4">
                <div className="mb-1 flex items-center justify-between text-sm text-surface-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="mb-4 flex items-center justify-between text-sm text-surface-500">
                  <span>Shipping</span>
                  <span>{total >= 100 ? 'Free' : formatCurrency(9.99)}</span>
                </div>
                <div className="mb-4 flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total >= 100 ? total : total + 9.99)}</span>
                </div>
                <Link to="/checkout" onClick={() => setOpen(false)}>
                  <Button variant="primary" className="w-full" size="lg">
                    Checkout
                  </Button>
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
