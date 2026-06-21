import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { ProductFilters } from '@/components/catalog/ProductFilters';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import type { Product, Category, ProductFilters as Filters } from '@/types';

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const filters: Filters = {
    category: searchParams.get('category') || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    in_stock: searchParams.get('in_stock') === 'true' || undefined,
    on_sale: searchParams.get('on_sale') === 'true' || undefined,
    sort: (searchParams.get('sort') as Filters['sort']) || undefined,
    direction: (searchParams.get('direction') as Filters['direction']) || undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  };

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getProducts(filters);
      setProducts(res.data);
      setTotal(res.meta.total);
      setLastPage(res.meta.last_page);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api
      .getProducts({ per_page: 1 })
      .then((res) => setCategories(res.filters?.categories || []))
      .catch(() => {});
  }, []);

  const updateFilters = (newFilters: Filters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.set(key, String(val));
      }
    });
    setSearchParams(params);
  };

  const loadMore = () => {
    updateFilters({ ...filters, page: (filters.page || 1) + 1 });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-surface-900">Catalog</h1>
          <p className="mt-1 text-surface-500">{total} products available</p>
        </motion.div>

        <div className="mt-8 lg:flex lg:gap-8">
          <div className="lg:w-64 lg:flex-shrink-0">
            <ProductFilters
              categories={categories}
              filters={filters}
              onChange={updateFilters}
              isOpen={isFiltersOpen}
              onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
            />
          </div>

          <div className="flex-1">
            <ProductGrid products={products} isLoading={isLoading} />

            {!isLoading && products.length > 0 && (filters.page || 1) < lastPage && (
              <div className="mt-10 text-center">
                <Button variant="outline" onClick={loadMore} size="lg">
                  Load More Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
