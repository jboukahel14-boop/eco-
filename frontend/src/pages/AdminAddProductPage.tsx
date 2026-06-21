import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, ImagePlus, X } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import type { Category } from '@/types';

interface FormData {
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  compare_at_price: string;
  cost_price: string;
  stock_quantity: string;
  low_stock_threshold: string;
  weight: string;
  is_active: boolean;
  images: string[];
  categories: number[];
}

const emptyForm: FormData = {
  sku: '',
  name: '',
  slug: '',
  description: '',
  price: '',
  compare_at_price: '',
  cost_price: '',
  stock_quantity: '0',
  low_stock_threshold: '10',
  weight: '',
  is_active: true,
  images: [],
  categories: [],
};

export function AdminAddProductPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    api.getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'name' && !form.slug) {
      setForm((prev) => ({
        ...prev,
        name: value as string,
        slug: (value as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }));
    }
  };

  const addImage = () => {
    if (newImage.trim()) {
      setForm((prev) => ({ ...prev, images: [...prev.images, newImage.trim()] }));
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const toggleCategory = (categoryId: number) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.createProduct({
        sku: form.sku,
        name: form.name,
        slug: form.slug || undefined,
        description: form.description || undefined,
        images: form.images.length > 0 ? form.images : undefined,
        price: parseFloat(form.price),
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : undefined,
        cost_price: form.cost_price ? parseFloat(form.cost_price) : undefined,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        low_stock_threshold: parseInt(form.low_stock_threshold) || 10,
        is_active: form.is_active,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        categories: form.categories.length > 0 ? form.categories : undefined,
      });

      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Link
            to="/admin"
            className="rounded-xl p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-surface-900">Add Product</h1>
            <p className="mt-1 text-sm text-surface-400">Create a new product in your catalog</p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <GlassCard>
            <h2 className="mb-6 text-lg font-semibold text-surface-900">Basic Information</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-surface-700">SKU *</label>
                <input
                  type="text"
                  required
                  value={form.sku}
                  onChange={(e) => updateField('sku', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="e.g. ELEC-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="e.g. Wireless Bluetooth Headphones"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Auto-generated from name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700">Price *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-surface-700">Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="mt-1 w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                placeholder="Product description..."
              />
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="mb-6 text-lg font-semibold text-surface-900">Pricing & Inventory</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-surface-700">Compare-at Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.compare_at_price}
                  onChange={(e) => updateField('compare_at_price', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Original price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700">Cost Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cost_price}
                  onChange={(e) => updateField('cost_price', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Cost per unit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700">Weight (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.weight}
                  onChange={(e) => updateField('weight', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock_quantity}
                  onChange={(e) => updateField('stock_quantity', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700">Low Stock Threshold</label>
                <input
                  type="number"
                  min="0"
                  value={form.low_stock_threshold}
                  onChange={(e) => updateField('low_stock_threshold', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="mb-6 text-lg font-semibold text-surface-900">Images</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                className="flex-1 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                placeholder="Paste image URL..."
              />
              <Button type="button" variant="outline" size="sm" onClick={addImage}>
                <ImagePlus className="h-4 w-4" />
                Add
              </Button>
            </div>
            {form.images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {form.images.map((url, i) => (
                  <div key={i} className="group relative">
                    <img
                      src={url}
                      alt={`Product ${i + 1}`}
                      className="h-20 w-20 rounded-xl object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/e2e8f0/94a3b8?text=Error';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <h2 className="mb-6 text-lg font-semibold text-surface-900">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="focus:outline-none"
                >
                  <Badge
                    variant={form.categories.includes(cat.id) ? 'success' : 'default'}
                    className="cursor-pointer transition-all hover:opacity-80"
                  >
                    {cat.name}
                  </Badge>
                </button>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-surface-400">No categories available</p>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="mb-6 text-lg font-semibold text-surface-900">Visibility</h2>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => updateField('is_active', e.target.checked)}
                className="h-5 w-5 rounded-lg border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-surface-700">Product is active and visible to customers</span>
            </label>
          </GlassCard>

          <div className="flex items-center gap-4">
            <Button type="submit" loading={isLoading} size="lg">
              <Save className="h-4 w-4" />
              {isLoading ? 'Creating...' : 'Create Product'}
            </Button>
            <Link to="/admin">
              <Button type="button" variant="ghost" size="lg">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
