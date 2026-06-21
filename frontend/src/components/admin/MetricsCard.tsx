import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; isPositive: boolean };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'bg-white border-surface-200',
  success: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200',
  danger: 'bg-red-50 border-red-200',
};

export function MetricsCard({ title, value, subtitle, icon, trend, variant = 'default' }: MetricsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border p-6 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-md',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-surface-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-surface-400">{subtitle}</p>}
          {trend && (
            <p className={cn('mt-2 text-sm font-medium', trend.isPositive ? 'text-green-600' : 'text-red-600')}>
              {trend.isPositive ? '+' : ''}{trend.value}% {trend.isPositive ? '↑' : '↓'}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-surface-100 p-3 text-surface-500">{icon}</div>
      </div>
    </motion.div>
  );
}
