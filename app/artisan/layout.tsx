'use client';

import LanguageSelector from '@/components/ui/LanguageSelector';
import { LanguageProvider, useLanguage } from '@/lib/language/LanguageContext';
import {
    BarChart3, Bell,
    Headphones,
    Heart,
    LogOut,
    MessageSquare,
    Package,
    Palette,
    Plus,
    TrendingUp, User
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function ArtisanLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications?count=true');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.unreadCount);
        }
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Initial fetch and setup polling
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Listen for navigation to notifications page to refresh count
  useEffect(() => {
    if (pathname === '/artisan/notifications') {
      // Refresh count when navigating to notifications
      setTimeout(fetchUnreadCount, 1000);
    }
  }, [pathname]);

  const handleSignOut = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Call logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          refreshToken,
          logoutAll: false
        })
      });

      // Clear local storage regardless of API response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_id');
      
      // Redirect to home page
      router.push('/');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage and redirect on error
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_id');
      router.push('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigationItems = [
    {
      name: t('dashboard'),
      href: '/artisan/dashboard',
      icon: TrendingUp,
    },
    {
      name: t('products'),
      href: '/artisan/products',
      icon: Package,
    },
    {
      name: t('addProduct'),
      href: '/artisan/products/new',
      icon: Plus,
    },
    {
      name: t('messages'),
      href: '/artisan/messages',
      icon: MessageSquare,
    },
    {
      name: t('analytics'),
      href: '/artisan/analytics',
      icon: BarChart3,
    },
    {
      name: t('feedback'),
      href: '/artisan/feedback',
      icon: Heart,
    },
    {
      name: t('profile'),
      href: '/artisan/profile',
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
              <Palette className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Artisan Studio</h1>
                <p className="text-slate-400 text-sm">Creative Portal</p>
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
                  onClick={() => router.push('/artisan/notifications')}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors relative ${
                    isActive('/artisan/notifications')
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Bell className="h-5 w-5 mr-3" />
                  Notifications
                  {/* Dynamic unread count badge */}
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => router.push('/artisan/support-dashboard')}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors mt-2 ${
                    isActive('/artisan/support-dashboard')
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Headphones className="h-5 w-5 mr-3" />
                  Support Dashboard
                </button>
              </div>
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-700 space-y-3">
            {/* Language Selector */}
            <div className="mb-3">
              <LanguageSelector />
            </div>
            
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
              {t('signOut')}
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

export default function ArtisanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <ArtisanLayoutContent>{children}</ArtisanLayoutContent>
    </LanguageProvider>
  );
}
