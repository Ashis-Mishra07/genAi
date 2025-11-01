'use client';

import FloatingChatbot from '@/components/artisan/FloatingChatbot';
import { Navbar } from '@/components/navbar';
import { LanguageProvider as I18nProvider } from '@/lib/i18n/provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "artisan" | "customer";
  avatar?: string;
}

function ArtisanLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get user info from localStorage or API
    const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'ARTISAN') {
      router.push('/auth/artisan');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: payload.sub || payload.userId || '1',
        name: payload.name || 'Artisan User',
        email: payload.email || 'artisan@example.com',
        role: 'artisan'
      });
    } catch (error) {
      console.error('Error decoding token:', error);
      // Set default artisan user
      setUser({
        id: '1',
        name: 'Artisan User',
        email: 'artisan@example.com', 
        role: 'artisan'
      });
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Call logout API
      await fetch('/api/auth/logout', {
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

      // Clear local storage
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
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        user={user} 
        onLogout={handleLogout}
      />
      <main className="pt-16">
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
