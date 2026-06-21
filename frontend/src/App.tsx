import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { AdminAddProductPage } from '@/pages/AdminAddProductPage';
import { useCartStore } from '@/store/cart-store';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function AppContent() {
  const cartCount = useCartStore((s) => s.count);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <CartDrawer />

      <main className="flex-1">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/products/new" element={<AdminAddProductPage />} />
            <Route
              path="*"
              element={
                <div className="flex min-h-screen items-center justify-center pt-24">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-surface-300">404</h1>
                    <p className="mt-2 text-lg text-surface-500">Page not found</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
