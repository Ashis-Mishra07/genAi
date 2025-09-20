"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  Package,
  MessageSquare,
  TrendingUp,
  Settings,
  LogOut,
  Plus,
  Eye,
  Edit,
  Trash2,
  Heart,
  DollarSign,
  Users,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/hooks";
import LanguageSelector from "@/components/ui/language-selector";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalViews: number;
  totalOrders: number;
}

export default function ArtisanDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeProducts: 0,
    totalViews: 0,
    totalOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Component mounted, checking authentication...');
    if (checkAuth()) {
      fetchDashboardData();
    }
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
    const role = localStorage.getItem("user_role");

    console.log('Auth check:', { hasToken: !!token, role });

    if (!token || role !== "ARTISAN") {
      console.log('Authentication failed, redirecting to login');
      router.push("/auth/artisan");
      return false;
    }
    return true;
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
      
      if (!token) {
        console.error('No authentication token found');
        router.push("/auth/artisan");
        return;
      }

      console.log('Fetching user data with token:', token.substring(0, 20) + '...');

      // Fetch user info
      const userResponse = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log('User API response:', userResponse.status);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('User data received:', userData);
        setUser(userData.user);
      } else {
        console.error('Failed to fetch user data:', userResponse.status);
        const errorData = await userResponse.text();
        console.error('Error details:', errorData);
        
        if (userResponse.status === 401) {
          // Token might be expired, redirect to login
          localStorage.removeItem("auth_token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user_role");
          router.push("/auth/artisan");
          return;
        }
      }

      // Fetch products and stats
      const productsResponse = await fetch("/api/products", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log('Products API response:', productsResponse.status);

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        console.log('Products data received:', productsData);
        
        // Set products with proper mapping
        const mappedProducts = (productsData.products || []).map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          isActive: product.isActive,
          createdAt: product.createdAt,
        }));
        
        setProducts(mappedProducts);

        // Set stats from API response
        if (productsData.stats) {
          setStats(productsData.stats);
        } else {
          // Fallback calculation if stats not provided
          const totalProducts = mappedProducts.length;
          const activeProducts = mappedProducts.filter((p: Product) => p.isActive).length;
          
          setStats({
            totalProducts,
            activeProducts,
            totalViews: 0, // TODO: Implement proper analytics
            totalOrders: 0, // TODO: Implement proper order tracking
          });
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
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
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_id");
      
      // Redirect to home page
      router.push('/');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage and redirect on error
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_id");
      router.push('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAddProduct = () => {
    router.push("/artisan/products/new");
  };

  const handleViewMessages = () => {
    router.push("/artisan/messages");
  };

  const handleViewFeedback = () => {
    router.push("/artisan/feedback");
  };

  const handleViewAnalytics = () => {
    router.push("/artisan/analytics");
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/artisan/products/edit/${productId}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        if (response.ok) {
          fetchDashboardData(); // Refresh data
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-600">{t('loadingDashboard')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center">
                <Palette className="h-8 w-8 text-orange-500 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t('artisanStudio')}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {t('welcomeBack')}, {user?.name || user?.email || 'Artisan'}
                    {user?.location && ` from ${user.location}`}
                  </p>
                  {/* Debug info - remove in production */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-400 mt-1">
                      Debug: User loaded: {user ? 'Yes' : 'No'} | 
                      Name: {user?.name || 'None'} | 
                      Email: {user?.email || 'None'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <button 
                onClick={() => router.push("/artisan/messages")}
                className="p-2 text-gray-400 hover:text-gray-500 relative">
                <MessageSquare className="h-6 w-6" />
                {/* Add notification badge if needed */}
              </button>
              <button 
                onClick={() => router.push("/artisan/profile")}
                className="p-2 text-gray-400 hover:text-gray-500">
                <Settings className="h-6 w-6" />
              </button>
              
              {/* User avatar/info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.specialty}</p>
                </div>
                <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`p-2 transition-colors ${
                  isLoggingOut
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-gray-400 hover:text-red-500"
                }`}
                title="Sign Out"
              >
                {isLoggingOut ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                ) : (
                  <LogOut className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalProducts}
                </p>
                <p className="text-gray-600">{t('totalProducts')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.activeProducts}
                </p>
                <p className="text-gray-600">{t('activeProducts')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalViews}
                </p>
                <p className="text-gray-600">{t('totalViews')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalOrders}
                </p>
                <p className="text-gray-600">{t('totalOrders')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('quickActions')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={handleAddProduct}
              className="flex items-center justify-center p-4 border-2 border-dashed border-orange-300 rounded-lg text-orange-600 hover:border-orange-500 hover:text-orange-700 transition-colors">
              <Plus className="h-6 w-6 mr-2" />
              {t('createProduct')}
            </button>
            <button 
              onClick={handleViewMessages}
              className="flex items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-500 hover:text-blue-700 transition-colors">
              <MessageSquare className="h-6 w-6 mr-2" />
              {t('chatWithCustomers')}
            </button>
            <button 
              onClick={handleViewFeedback}
              className="flex items-center justify-center p-4 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:border-purple-500 hover:text-purple-700 transition-colors">
              <Heart className="h-6 w-6 mr-2" />
              {t('customerFeedback')}
            </button>
            <button 
              onClick={handleViewAnalytics}
              className="flex items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:border-green-500 hover:text-green-700 transition-colors">
              <TrendingUp className="h-6 w-6 mr-2" />
              {t('viewAnalytics')}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('recentProducts')}
            </h2>
            <button 
              onClick={handleAddProduct}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              {t('createProduct')}
            </button>
          </div>

          <div className="p-6">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('noProducts')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('startCreating')}
                </p>
                <button 
                  onClick={handleAddProduct}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                  {t('createProduct')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-lg font-semibold text-orange-600 mb-2">
                        ₹{product.price}
                      </p>

                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                          {product.isActive ? t('active') : t('inactive')}
                        </span>

                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewProduct(product.id)}
                            className="p-1 text-gray-400 hover:text-blue-500"
                            title={t('viewProduct')}>
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditProduct(product.id)}
                            className="p-1 text-gray-400 hover:text-green-500"
                            title={t('editProduct')}>
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                            title={t('deleteProduct')}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
