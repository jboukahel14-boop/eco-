import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import type { Product } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, getImageUrl, cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const xVal = (e.clientX - rect.left) / rect.width - 0.5;
    const yVal = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xVal);
    y.set(yVal);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/products/${product.slug}`} className="group block">
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformPerspective: 800 }}
          className="relative overflow-hidden rounded-2xl border border-white/20 bg-white shadow-lg backdrop-blur-xl transition-shadow duration-300 hover:shadow-xl"
        >
          <div className="relative aspect-square overflow-hidden bg-surface-100">
            <motion.img
              src={getImageUrl(product.images?.[0])}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />

            {product.discount_percent && (
              <div className="absolute left-3 top-3">
                <Badge variant="danger">-{product.discount_percent}%</Badge>
              </div>
            )}

            {product.is_out_of_stock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <Badge variant="danger" className="px-4 py-2 text-sm">
                  Out of Stock
                </Badge>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute bottom-3 right-3 flex gap-2"
            >
              {!product.is_out_of_stock && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleQuickAdd}
                  disabled={isLoading}
                  className="shadow-lg backdrop-blur-md"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 text-surface-700 shadow-lg backdrop-blur-md"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          <div className="p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-surface-400">
              {product.categories?.[0]?.name || 'General'}
            </p>
            <h3 className="font-semibold text-surface-900 transition-colors group-hover:text-primary-600">
              {product.name}
            </h3>

            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-surface-600">
                  {product.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-surface-400">({product.review_count})</span>
              {product.sold_count > 0 && (
                <>
                  <span className="text-surface-300">|</span>
                  <span className="text-xs text-surface-400">{product.sold_count} sold</span>
                </>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-lg font-bold text-surface-900">
                {formatCurrency(product.price)}
              </span>
              {product.compare_at_price && (
                <span className="text-sm text-surface-400 line-through">
                  {formatCurrency(product.compare_at_price)}
                </span>
              )}
            </div>

            <div className="mt-2">
              {product.is_out_of_stock ? (
                <Badge variant="danger">Out of Stock</Badge>
              ) : product.is_low_stock ? (
                <Badge variant="warning">Only {product.stock_quantity} left</Badge>
              ) : null}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
