import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getImageUrl(path: string | null | undefined, fallback = '/placeholder.svg'): string {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  return `/storage/${path}`;
}

export function getStockLabel(quantity: number, threshold: number): {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'default';
} {
  if (quantity === 0) return { label: 'Out of Stock', variant: 'danger' };
  if (quantity <= threshold) return { label: `Only ${quantity} left`, variant: 'warning' };
  if (quantity <= threshold * 3) return { label: 'Low Stock', variant: 'warning' };
  return { label: 'In Stock', variant: 'success' };
}

export function getOrderStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
}
