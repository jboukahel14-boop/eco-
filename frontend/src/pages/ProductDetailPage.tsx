import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Check, ChevronLeft, Package, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { useCartStore } from '@/store/cart-store';
import { api } from '@/lib/api';
import { formatCurrency, getImageUrl, cn } from '@/lib/utils';
import type { Product } from '@/types';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const cartLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    api
      .getProduct(slug)
      .then((res) => {
        setProduct(res.data);
        setSelectedImage(0);
      })
      .catch(() => setProduct(null))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse grid gap-12 lg:grid-cols-2">
            <div className="aspect-square rounded-2xl bg-surface-200" />
            <div className="space-y-4">
              <div className="h-6 w-32 rounded bg-surface-200" />
              <div className="h-10 w-3/4 rounded bg-surface-200" />
              <div className="h-8 w-40 rounded bg-surface-200" />
              <div className="h-24 rounded bg-surface-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-surface-900">Product Not Found</h2>
          <Link to="/catalog" className="mt-4 inline-flex items-center gap-1 text-primary-600 hover:text-primary-700">
            <ChevronLeft className="h-4 w-4" />
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ['/placeholder.svg'];
  const inStock = product.stock_quantity > 0;

  const handleAddToCart = () => {
    addItem(product.id, quantity);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/catalog"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-surface-500 transition-colors hover:text-primary-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Catalog
        </Link>

        <div className="grid gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="overflow-hidden rounded-2xl bg-surface-100">
              <img
                src={getImageUrl(images[selectedImage])}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'h-20 w-20 overflow-hidden rounded-xl border-2 transition-all',
                      i === selectedImage
                        ? 'border-primary-500 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={getImageUrl(img)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.categories?.map((cat) => (
                <Link key={cat.id} to={`/catalog?category=${cat.slug}`}>
                  <Badge variant="info">{cat.name}</Badge>
                </Link>
              ))}
            </div>

            <h1 className="text-3xl font-bold text-surface-900 lg:text-4xl">{product.name}</h1>

            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-surface-900">{product.rating.toFixed(1)}</span>
                <span className="text-surface-400">({product.review_count} reviews)</span>
              </div>
              <span className="text-surface-300">|</span>
              <span className="text-sm text-surface-500">{product.sold_count} sold</span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-surface-900">{formatCurrency(product.price)}</span>
              {product.compare_at_price && (
                <span className="text-xl text-surface-400 line-through">
                  {formatCurrency(product.compare_at_price)}
                </span>
              )}
              {product.discount_percent && (
                <Badge variant="danger">Save {product.discount_percent}%</Badge>
              )}
            </div>

            <hr className="my-6 border-surface-200" />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {inStock ? (
                  <>
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-700">In Stock</span>
                    {product.is_low_stock && (
                      <span className="text-sm text-yellow-600">({product.stock_quantity} left)</span>
                    )}
                  </>
                ) : (
                  <Badge variant="danger">Out of Stock</Badge>
                )}
              </div>

              {product.sku && (
                <p className="text-sm text-surface-400">SKU: {product.sku}</p>
              )}
            </div>

            {product.description && (
              <p className="mt-6 leading-relaxed text-surface-600">{product.description}</p>
            )}

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-surface-200 px-4 py-2.5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!inStock}
                  className="text-surface-500 transition-colors hover:text-surface-700 disabled:opacity-50"
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  disabled={!inStock || quantity >= product.stock_quantity}
                  className="text-surface-500 transition-colors hover:text-surface-700 disabled:opacity-50"
                >
                  +
                </button>
              </div>

              <Button
                variant="primary"
                size="lg"
                disabled={!inStock}
                loading={cartLoading}
                onClick={handleAddToCart}
                className="flex-1"
              >
                <ShoppingCart className="h-5 w-5" />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl bg-surface-50 p-5">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-surface-400" />
                <div>
                  <p className="text-sm font-medium text-surface-900">Free Shipping</p>
                  <p className="text-xs text-surface-500">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-surface-400" />
                <div>
                  <p className="text-sm font-medium text-surface-900">Secure Payment</p>
                  <p className="text-xs text-surface-500">SSL encrypted checkout</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
