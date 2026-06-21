import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Category, ProductFilters as Filters } from '@/types';
import { cn } from '@/lib/utils';

interface ProductFiltersProps {
  categories: Category[];
  filters: Filters;
  onChange: (filters: Filters) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const sortOptions = [
  { value: 'created_at', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: 'price', label: 'Price: High to Low', direction: 'desc' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'sold_count', label: 'Best Selling' },
] as const;

export function ProductFilters({ categories, filters, onChange, isOpen, onToggle }: ProductFiltersProps) {
  const updateFilter = (key: keyof Filters, value: string | number | boolean | undefined) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    onChange({ page: 1 });
  };

  const hasFilters = filters.category || filters.min_price || filters.max_price || filters.in_stock || filters.on_sale;

  return (
    <>
      <button
        onClick={onToggle}
        className="mb-4 flex items-center gap-2 rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {hasFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
            !
          </span>
        )}
      </button>

      <motion.aside
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        className="overflow-hidden lg:h-auto lg:opacity-100"
      >
        <div className="space-y-6 pb-6 lg:pb-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-500">Filters</h3>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-surface-700">Category</h4>
            <div className="space-y-2">
              <button
                onClick={() => updateFilter('category', undefined)}
                className={cn(
                  'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  !filters.category
                    ? 'bg-primary-50 font-medium text-primary-700'
                    : 'text-surface-600 hover:bg-surface-50'
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilter('category', cat.slug)}
                  className={cn(
                    'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    filters.category === cat.slug
                      ? 'bg-primary-50 font-medium text-primary-700'
                      : 'text-surface-600 hover:bg-surface-50'
                  )}
                >
                  {cat.name}
                  {cat.products_count !== undefined && (
                    <span className="ml-2 text-xs text-surface-400">({cat.products_count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-surface-700">Price Range</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.min_price || ''}
                onChange={(e) => updateFilter('min_price', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
              />
              <span className="text-surface-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.max_price || ''}
                onChange={(e) => updateFilter('max_price', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-surface-700">Availability</h4>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-50">
              <input
                type="checkbox"
                checked={!!filters.in_stock}
                onChange={(e) => updateFilter('in_stock', e.target.checked || undefined)}
                className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-surface-700">In Stock Only</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-50">
              <input
                type="checkbox"
                checked={!!filters.on_sale}
                onChange={(e) => updateFilter('on_sale', e.target.checked || undefined)}
                className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-accent-600">On Sale</span>
            </label>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-surface-700">Sort By</h4>
            <select
              value={`${filters.sort || 'created_at'}-${filters.direction || 'desc'}`}
              onChange={(e) => {
                const [sort, direction] = e.target.value.split('-');
                updateFilter('sort', sort as Filters['sort']);
                updateFilter('direction', (direction || 'desc') as Filters['direction']);
              }}
              className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
            >
              {sortOptions.map((opt) => (
                <option key={`${opt.value}-${opt.direction || 'desc'}`} value={`${opt.value}-${opt.direction || 'desc'}`}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
