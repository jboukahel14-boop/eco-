import type { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-surface-200 bg-white p-4">
            <div className="mb-4 aspect-square rounded-xl bg-surface-200" />
            <div className="h-4 w-24 rounded bg-surface-200" />
            <div className="mt-2 h-5 w-40 rounded bg-surface-200" />
            <div className="mt-3 h-6 w-28 rounded bg-surface-200" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <ShoppingBag className="mb-4 h-16 w-16 text-surface-300" />
        <h3 className="text-xl font-semibold text-surface-700">No products found</h3>
        <p className="mt-2 text-surface-500">Try adjusting your filters or search query</p>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  );
}
