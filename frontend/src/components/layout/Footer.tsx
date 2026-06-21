import { Link } from 'react-router-dom';
import { Store, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface-900 text-surface-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <Store className="h-5 w-5 text-primary-400" />
              <span>ShopWave</span>
            </div>
            <p className="text-sm leading-relaxed text-surface-400">
              Premium products delivered with care. Your satisfaction is our priority.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/catalog" className="transition-colors hover:text-white">All Products</Link></li>
              <li><Link to="/catalog?category=new-arrivals" className="transition-colors hover:text-white">New Arrivals</Link></li>
              <li><Link to="/catalog?on_sale=true" className="transition-colors hover:text-white">Sale</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="transition-colors hover:text-white cursor-pointer">Contact Us</span></li>
              <li><span className="transition-colors hover:text-white cursor-pointer">Shipping Info</span></li>
              <li><span className="transition-colors hover:text-white cursor-pointer">Returns</span></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="transition-colors hover:text-white cursor-pointer">About</span></li>
              <li><span className="transition-colors hover:text-white cursor-pointer">Careers</span></li>
              <li><span className="transition-colors hover:text-white cursor-pointer">Privacy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-surface-800 pt-8 text-center text-sm text-surface-500">
          <p className="flex items-center justify-center gap-1">
            &copy; {new Date().getFullYear()} ShopWave. Made with <Heart className="h-3.5 w-3.5 text-red-400" /> for great experiences.
          </p>
        </div>
      </div>
    </footer>
  );
}
