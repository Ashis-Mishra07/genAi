'use client';

import { Navbar } from '@/components/navbar';
import FloatingChatbot from '@/components/artisan/FloatingChatbot';
import { LanguageProvider as I18nProvider } from '@/lib/i18n/provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function ArtisanLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: "artisan";
    avatar?: string;
  } | null>(null);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeUser = () => {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      const userId = localStorage.getItem('user_id');
      const userRole = localStorage.getItem('user_role');
      
      if (token && userRole === 'ARTISAN') {
        // Mock user data - in real app, fetch from API
        setUser({
          name: "Artisan User",
          email: "artisan@example.com",
          role: "artisan"
        });
      } else {
        // Redirect to auth if not authenticated
        router.push('/auth/artisan');
      }
    };

    initializeUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
      
      // Call logout API if needed
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
      }

      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_id');
      
      // Update state and redirect
      setUser(null);
      router.push('/');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage even on error
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_id');
      setUser(null);
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Navbar */}
      <Navbar 
        user={user} 
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>
      
      {/* Floating Chatbot - Available on all artisan pages */}
      <FloatingChatbot />
    </div>
  );
}

export default function ArtisanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <ArtisanLayoutContent>{children}</ArtisanLayoutContent>
    </I18nProvider>
  );
}
