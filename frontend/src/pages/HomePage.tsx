import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Truck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { GlassCard } from '@/components/ui/GlassCard';
import { api } from '@/lib/api';
import type { Product } from '@/types';

const features = [
  { icon: Zap, title: 'Lightning Fast', description: 'Same-day dispatch on all orders' },
  { icon: Shield, title: 'Secure Checkout', description: '256-bit SSL encrypted payments' },
  { icon: Truck, title: 'Free Shipping', description: 'On orders over $100' },
  { icon: RefreshCw, title: 'Easy Returns', description: '30-day no-questions refund' },
];

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .getProducts({ sort: 'sold_count', direction: 'desc', per_page: 8 })
      .then((res) => setFeaturedProducts(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-surface-900 to-surface-900 pb-20 pt-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-block rounded-full bg-primary-500/20 px-4 py-1.5 text-sm font-medium text-primary-300 backdrop-blur-sm">
              New Season Collection
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Elevate Your{' '}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Shopping Experience
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-surface-300">
              Discover premium products curated for quality and style. Every purchase comes with fast shipping and exceptional support.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/catalog">
                <Button variant="primary" size="lg">
                  Shop Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/catalog?on_sale=true">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                >
                  View Sale
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative -mt-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <GlassCard className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-900">{feature.title}</h3>
                    <p className="text-sm text-surface-500">{feature.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-surface-900">Featured Products</h2>
              <p className="mt-2 text-surface-500">Our best-selling picks curated for you</p>
            </div>
            <Link
              to="/catalog"
              className="hidden items-center gap-1 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 sm:flex"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid products={featuredProducts} isLoading={isLoading} />
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary-600 to-accent-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className="text-3xl font-bold text-white">Ready to Upgrade Your Style?</h2>
            <p className="mx-auto mt-3 max-w-lg text-primary-100">
              Join thousands of happy customers. Free shipping on your first order.
            </p>
            <Link to="/catalog">
              <Button
                variant="secondary"
                size="lg"
                className="mt-8 bg-white text-primary-700 hover:bg-primary-50"
              >
                Start Shopping
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
