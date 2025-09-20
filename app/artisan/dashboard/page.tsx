"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  Eye,
  Edit,
  Trash2,
  Heart,
  DollarSign,
  Users,
  TrendingUp,
  X,
  Calendar,
  Tag,
  MapPin,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/hooks";
import { useLanguage } from "@/lib/language/LanguageContext";

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
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
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
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
      
      // Get token from localStorage or cookies
      const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
      
      if (!token) {
        console.error('No authentication token found');
        router.push("/auth/artisan");
        return;
      }

      console.log('Fetching user data...');

      // Fetch user info
      const userResponse = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });

      console.log('User API response:', userResponse.status);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('User data received:', userData);
        setUser(userData.user);
      } else {
        console.error('Failed to fetch user data:', userResponse.status);
        
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
        credentials: 'include',
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
          description: product.description,
          category: product.category,
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

  const handleAddProduct = () => {
    router.push("/artisan/products/new");
  };

  const handleViewProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowProductModal(true);
    }
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
            Authorization: `Bearer ${localStorage.getItem("auth_token") || localStorage.getItem("accessToken")}`,
          },
          credentials: 'include',
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">{t('loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{t('artisanStudio')}</h1>
            <p className="text-slate-400">
              {t('welcomeBack')}, {user?.name || user?.email || 'Artisan'}
              {user?.location && ` from ${user.location}`}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-700 rounded-lg px-3 py-2">
              <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.name || 'Artisan'}</p>
                <p className="text-xs text-slate-400">{user?.specialty || 'Creative Artist'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-white">
                  {stats.totalProducts}
                </p>
                <p className="text-slate-400">{t('totalProducts')}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-white">
                  {stats.activeProducts}
                </p>
                <p className="text-slate-400">{t('activeProducts')}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-white">
                  {stats.totalViews}
                </p>
                <p className="text-slate-400">{t('totalViews')}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-white">
                  {stats.totalOrders}
                </p>
                <p className="text-slate-400">{t('totalOrders')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg mb-8 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {t('quickActions')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={handleAddProduct}
              className="flex items-center justify-center p-4 border-2 border-dashed border-orange-500/30 rounded-lg text-orange-400 hover:border-orange-500/60 hover:text-orange-300 transition-colors bg-orange-500/5">
              <Plus className="h-6 w-6 mr-2" />
              {t('createProduct')}
            </button>
            <button 
              onClick={() => router.push("/artisan/messages")}
              className="flex items-center justify-center p-4 border-2 border-dashed border-blue-500/30 rounded-lg text-blue-400 hover:border-blue-500/60 hover:text-blue-300 transition-colors bg-blue-500/5">
              <Users className="h-6 w-6 mr-2" />
              {t('chatWithCustomers')}
            </button>
            <button 
              onClick={() => router.push("/artisan/feedback")}
              className="flex items-center justify-center p-4 border-2 border-dashed border-purple-500/30 rounded-lg text-purple-400 hover:border-purple-500/60 hover:text-purple-300 transition-colors bg-purple-500/5">
              <Heart className="h-6 w-6 mr-2" />
              {t('customerFeedback')}
            </button>
            <button 
              onClick={() => router.push("/artisan/analytics")}
              className="flex items-center justify-center p-4 border-2 border-dashed border-green-500/30 rounded-lg text-green-400 hover:border-green-500/60 hover:text-green-300 transition-colors bg-green-500/5">
              <TrendingUp className="h-6 w-6 mr-2" />
              {t('viewAnalytics')}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">
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
                <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {t('noProducts')}
                </h3>
                <p className="text-slate-400 mb-4">
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
                    className="bg-slate-700 border border-slate-600 rounded-lg overflow-hidden hover:border-orange-500/50 transition-all hover:shadow-lg">
                    <div className="aspect-w-16 aspect-h-9 bg-slate-600">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-slate-600 flex items-center justify-center">
                          <Package className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 
                        className="font-medium text-white mb-1 cursor-pointer hover:text-orange-400 transition-colors"
                        onClick={() => handleViewProduct(product.id)}>
                        {product.name}
                      </h3>
                      <p className="text-lg font-semibold text-orange-400 mb-2">
                        ₹{product.price.toLocaleString()}
                      </p>

                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.isActive
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                          }`}>
                          {product.isActive ? t('active') : t('inactive')}
                        </span>

                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewProduct(product.id)}
                            className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                            title={t('viewProduct')}>
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditProduct(product.id)}
                            className="p-1 text-slate-400 hover:text-green-400 transition-colors"
                            title={t('editProduct')}>
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
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

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Product Details</h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Product Image */}
              <div className="mb-6">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-lg bg-slate-700"
                  />
                ) : (
                  <div className="w-full h-64 bg-slate-700 flex items-center justify-center rounded-lg">
                    <Package className="h-16 w-16 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-3xl font-bold text-orange-400">
                    ₹{selectedProduct.price.toLocaleString()}
                  </p>
                </div>

                {selectedProduct.description && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Description
                    </h4>
                    <p className="text-slate-300 leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProduct.category && (
                    <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                      <div className="flex items-center text-slate-300">
                        <Tag className="h-5 w-5 mr-2 text-blue-400" />
                        <span className="font-medium">Category</span>
                      </div>
                      <p className="text-white mt-1">{selectedProduct.category}</p>
                    </div>
                  )}

                  <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                    <div className="flex items-center text-slate-300">
                      <Calendar className="h-5 w-5 mr-2 text-green-400" />
                      <span className="font-medium">Created</span>
                    </div>
                    <p className="text-white mt-1">
                      {new Date(selectedProduct.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                    <div className="flex items-center text-slate-300">
                      <Heart className="h-5 w-5 mr-2 text-purple-400" />
                      <span className="font-medium">Status</span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        selectedProduct.isActive
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                      }`}>
                      {selectedProduct.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                    <div className="flex items-center text-slate-300">
                      <DollarSign className="h-5 w-5 mr-2 text-yellow-400" />
                      <span className="font-medium">Product ID</span>
                    </div>
                    <p className="text-white mt-1 text-sm font-mono">
                      {selectedProduct.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
                <button
                  onClick={() => setShowProductModal(false)}
                  className="px-6 py-2 text-slate-400 border border-slate-600 rounded-lg hover:text-white hover:border-slate-500 transition-colors">
                  Close
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowProductModal(false);
                      router.push(`/products/${selectedProduct.id}`);
                    }}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    View Live
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowProductModal(false);
                      handleEditProduct(selectedProduct.id);
                    }}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
