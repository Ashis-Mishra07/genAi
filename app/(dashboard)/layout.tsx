"use client"

import { useState, useEffect } from "react";
import { Navbar } from '@/components/navbar';

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "artisan" | "customer";
  avatar?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get user info from localStorage or API
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.sub || '1',
          name: payload.name || 'Admin User',
          email: payload.email || 'admin@example.com',
          role: payload.role?.toLowerCase() || 'admin'
        });
      } catch (error) {
        console.error('Error decoding token:', error);
        // Set default admin user for demo
        setUser({
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com', 
          role: 'admin'
        });
      }
    } else {
      // Set default admin user for demo
      setUser({
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
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
      window.location.href = '/';
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage and redirect on error
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        user={user} 
        onLogout={handleLogout}
      />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
