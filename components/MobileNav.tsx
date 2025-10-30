'use client';

import {
    Bell,
    Heart,
    Home,
    Menu,
    Package,
    Search,
    ShoppingCart,
    User,
    X,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

interface MobileNavProps {
  role?: 'customer' | 'artisan' | 'admin';
}

export default function MobileNav({ role = 'customer' }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const customerNavItems: NavItem[] = [
    { icon: <Home className="h-5 w-5" />, label: 'Home', path: '/customer/dashboard' },
    { icon: <Package className="h-5 w-5" />, label: 'Products', path: '/customer/products' },
    { icon: <ShoppingCart className="h-5 w-5" />, label: 'Cart', path: '/customer/cart', badge: 2 },
    { icon: <Heart className="h-5 w-5" />, label: 'Wishlist', path: '/customer/wishlist' },
    { icon: <User className="h-5 w-5" />, label: 'Profile', path: '/customer/profile' },
  ];

  const artisanNavItems: NavItem[] = [
    { icon: <Home className="h-5 w-5" />, label: 'Dashboard', path: '/artisan/dashboard' },
    { icon: <Package className="h-5 w-5" />, label: 'Products', path: '/artisan/products' },
    { icon: <Bell className="h-5 w-5" />, label: 'Orders', path: '/artisan/orders' },
    { icon: <User className="h-5 w-5" />, label: 'Profile', path: '/artisan/profile' },
  ];

  const navItems = role === 'artisan' ? artisanNavItems : customerNavItems;

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-40 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-colors relative ${
                isActive(item.path)
                  ? 'text-orange-500'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setShowMenu(true)}
            className="flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg text-slate-400 hover:text-slate-300 transition-colors"
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </nav>

      {/* Full Screen Menu */}
      {showMenu && (
        <div className="md:hidden fixed inset-0 bg-slate-900 z-50 animate-fade-in">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      router.push(item.path);
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center space-x-4 p-4 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="relative">
                      {item.icon}
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Additional Options */}
              <div className="mt-8 pt-8 border-t border-slate-700">
                <button
                  onClick={() => {
                    router.push(`/${role}/help`);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-4 p-4 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <Search className="h-5 w-5" />
                  <span className="font-medium">Help & Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
