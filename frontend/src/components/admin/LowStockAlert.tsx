import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, PackageX } from 'lucide-react';
import type { Product } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, getImageUrl } from '@/lib/utils';

interface LowStockAlertProps {
  lowStock: Product[];
  outOfStock: Product[];
}

export function LowStockAlerts({ lowStock, outOfStock }: LowStockAlertProps) {
  const alerts = [
    ...outOfStock.map((p) => ({ ...p, alertType: 'out_of_stock' as const })),
    ...lowStock.map((p) => ({ ...p, alertType: 'low_stock' as const })),
  ];

  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-sm font-medium text-green-700">All products are well-stocked</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {alerts.slice(0, 10).map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-4 rounded-xl border border-surface-200 bg-white p-4"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                product.alertType === 'out_of_stock' ? 'bg-red-100' : 'bg-yellow-100'
              }`}
            >
              {product.alertType === 'out_of_stock' ? (
                <PackageX className="h-5 w-5 text-red-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-surface-900">{product.name}</p>
                {product.alertType === 'out_of_stock' ? (
                  <Badge variant="danger">Out of Stock</Badge>
                ) : (
                  <Badge variant="warning">Low Stock</Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-surface-400">SKU: {product.sku}</p>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-surface-900">{formatCurrency(product.price)}</p>
              <p className="text-xs text-surface-400">{product.sold_count} sold</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
