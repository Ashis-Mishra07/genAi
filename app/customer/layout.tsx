'use client';

import { Navbar } from '@/components/navbar';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: "customer";
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    // Mock user data - replace with actual auth logic
    const token = localStorage.getItem('accessToken');
    if (token) {
      setUser({
        name: "Customer User",
        email: "customer@example.com",
        role: "customer"
      });
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Call logout API
      await fetch('/api/auth/logout', {
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

      // Clear local storage
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
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
