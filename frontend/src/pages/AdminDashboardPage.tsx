import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp, RefreshCw, Plus } from 'lucide-react';
import { MetricsCard } from '@/components/admin/MetricsCard';
import { LowStockAlerts } from '@/components/admin/LowStockAlert';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useWebSocket } from '@/hooks/use-websocket';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { AdminMetrics } from '@/types';

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchMetrics = async () => {
    try {
      const res = await api.getAdminMetrics();
      setMetrics(res.data);
      setLastUpdated(new Date());
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useWebSocket({
    onInventoryUpdate: () => fetchMetrics(),
    onLowStockAlert: () => fetchMetrics(),
    onOrderConfirmed: () => fetchMetrics(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid animate-pulse gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-surface-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-surface-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/products/new">
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={fetchMetrics}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            title="Monthly Revenue"
            value={formatCurrency(metrics?.revenue.monthly || 0)}
            subtitle="This month"
            icon={<DollarSign className="h-5 w-5" />}
            variant="success"
          />
          <MetricsCard
            title="All-Time Revenue"
            value={formatCurrency(metrics?.revenue.all_time || 0)}
            subtitle={`Margin: ${formatCurrency(metrics?.revenue.margin || 0)}`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricsCard
            title="Active Orders"
            value={metrics?.orders.active || 0}
            subtitle={`${metrics?.orders.pending || 0} pending`}
            icon={<ShoppingBag className="h-5 w-5" />}
            variant={metrics && metrics.orders.active > 10 ? 'warning' : 'default'}
          />
          <MetricsCard
            title="Total Orders"
            value={metrics?.orders.total || 0}
            icon={<Package className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard>
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-surface-900">Inventory Alerts</h2>
                {(metrics?.inventory.low_stock_count || 0) + (metrics?.inventory.out_of_stock_count || 0) > 0 && (
                  <span className="ml-auto text-sm font-medium text-surface-500">
                    {metrics!.inventory.low_stock_count + metrics!.inventory.out_of_stock_count} issues
                  </span>
                )}
              </div>
              <LowStockAlerts
                lowStock={metrics?.inventory.low_stock || []}
                outOfStock={metrics?.inventory.out_of_stock || []}
              />
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard>
              <div className="mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-surface-900">Revenue & Margin</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-500">Margin</span>
                    <span className="font-semibold text-surface-900">
                      {formatCurrency(metrics?.revenue.margin || 0)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-surface-200">
                    <div
                      className="h-2 rounded-full bg-green-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(metrics?.revenue.margin_percent || 0, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-right text-xs text-surface-400">
                    {metrics?.revenue.margin_percent || 0}% margin
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-500">Margin Rate</span>
                    <span className="font-semibold text-surface-900">
                      {metrics?.revenue.margin_percent || 0}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-surface-200">
                    <div
                      className="h-2 rounded-full bg-primary-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(metrics?.revenue.margin_percent || 0, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-right text-xs text-surface-400">
                    Target: 30%
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-xl bg-surface-50 p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-surface-900">{metrics?.orders.active || 0}</p>
                    <p className="text-xs text-surface-500">Active Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-surface-900">{metrics?.orders.pending || 0}</p>
                    <p className="text-xs text-surface-500">Pending</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
