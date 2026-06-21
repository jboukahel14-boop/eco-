import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Menu, X, Store } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const cartCount = useCartStore((s) => s.count);
  const toggleCart = useCartStore((s) => s.toggle);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-surface-900">
          <Store className="h-6 w-6 text-primary-600" />
          <span>ShopWave</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link to="/catalog" className="text-sm font-medium text-surface-600 transition-colors hover:text-surface-900">
            Catalog
          </Link>
          <Link to="/catalog?category=new-arrivals" className="text-sm font-medium text-surface-600 transition-colors hover:text-surface-900">
            New Arrivals
          </Link>
          <Link to="/catalog?on_sale=true" className="text-sm font-medium text-accent-600 transition-colors hover:text-accent-700">
            Sale
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="rounded-xl p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            onClick={toggleCart}
            className="relative rounded-xl p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white"
              >
                {cartCount > 99 ? '99+' : cartCount}
              </motion.span>
            )}
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-xl p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 md:hidden"
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="mx-auto max-w-2xl px-4 py-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full rounded-xl border border-surface-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 md:hidden"
          >
            <div className="flex flex-col gap-2 px-4 py-4">
              <Link
                to="/catalog"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100"
              >
                Catalog
              </Link>
              <Link
                to="/catalog?category=new-arrivals"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100"
              >
                New Arrivals
              </Link>
              <Link
                to="/catalog?on_sale=true"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-accent-600 transition-colors hover:bg-surface-100"
              >
                Sale
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
