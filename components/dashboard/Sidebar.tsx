'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  MessageSquare, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'AI Assistant', href: '/chatbot', icon: MessageSquare },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-black">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-orange-500" />
            <span className="text-xl font-bold text-orange-400">Artisan AI</span>
          </div>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-orange-500/20 text-orange-400 border-r-2 border-orange-500"
                    : "text-gray-300 hover:bg-gray-800 hover:text-orange-300"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-orange-500" : "text-gray-400 group-hover:text-orange-400"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-orange-500/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-orange-400">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-orange-400 truncate">Artisan</p>
              <p className="text-xs text-gray-400">Local Craftsperson</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page content */}
        <main className="flex-1 overflow-auto bg-black">
          {children}
        </main>
      </div>
    </div>
  );
}
