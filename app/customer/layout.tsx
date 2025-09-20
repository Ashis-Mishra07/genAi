'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Package, TrendingUp, User, ShoppingCart, Heart, Bell, LogOut, Star
} from 'lucide-react';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Call logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          refreshToken,
          logoutAll: false
        })
      });

      // Clear local storage regardless of API response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Redirect to home page
      router.push('/');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage and redirect on error
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/customer/dashboard',
      icon: TrendingUp,
    },
    {
      name: 'Recent Orders',
      href: '/customer/orders',
      icon: Package,
    },
    {
      name: 'Featured Products',
      href: '/customer/products',
      icon: Star,
    },
    {
      name: 'Cart',
      href: '/customer/cart',
      icon: ShoppingCart,
    },
    {
      name: 'Wishlist',
      href: '/customer/wishlist',
      icon: Heart,
    },
    {
      name: 'Profile',
      href: '/customer/profile',
      icon: User,
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Fixed Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col fixed h-full">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center">
            <div className="bg-orange-500 rounded-lg p-2 mr-3">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Customer AI</h1>
              <p className="text-slate-400 text-sm">Shopping Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              );
            })}

            <div className="pt-4 border-t border-slate-700 mt-4">
              <button
                className="w-full flex items-center px-3 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5 mr-3" />
                Need Help?
              </button>
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
              isLoggingOut
                ? "text-slate-500 cursor-not-allowed"
                : "text-slate-300 hover:bg-red-500/10 hover:text-red-400"
            }`}
          >
            {isLoggingOut ? (
              <div className="h-5 w-5 mr-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
            ) : (
              <LogOut className="h-5 w-5 mr-3" />
            )}
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}
