'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, Heart, ShoppingCart, User, TrendingUp, Star, 
  ChevronRight, Eye, ArrowUp, ArrowDown
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  category: string;
  artisanName: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isTrending?: boolean;
  discount?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  total: number;
  date: string;
  itemCount: number;
}

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  wishlistItems: number;
  cartItems: number;
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    wishlistItems: 2,
    cartItems: 2
  });
  const [loading, setLoading] = useState(true);

  // Fetch actual orders from database
  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      try {
        // First check if user is authenticated
        console.log('Checking authentication...');
        const authResponse = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!authResponse.ok) {
          console.log('User not authenticated, redirecting to login...');
          router.push('/auth/customer');
          return;
        }

        const authData = await authResponse.json();
        console.log('User authenticated:', authData.user.email);

        // Now fetch orders
        console.log('Fetching orders from API...');
        const response = await fetch('/api/orders?limit=10', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);
          if (data.success && data.orders) {
            const formattedOrders = data.orders.map((order: any) => ({
              id: order.id,
              orderNumber: order.orderNumber,
              status: order.status,
              total: order.total,
              date: order.createdAt,
              itemCount: order.items?.length || 1
            }));

            setOrders(formattedOrders);
            console.log('Formatted orders:', formattedOrders);
            
            // Use stats from API if available, otherwise calculate
            if (data.stats) {
              setStats({
                totalOrders: data.stats.totalOrders,
                totalSpent: data.stats.totalSpent,
                wishlistItems: 2, // You can fetch this from wishlist API
                cartItems: 2 // You can fetch this from cart API
              });
            } else {
              // Calculate stats from orders
              const calculatedStats = {
                totalOrders: formattedOrders.length,
                totalSpent: formattedOrders.reduce((sum: number, order: Order) => sum + order.total, 0),
                wishlistItems: 2,
                cartItems: 2
              };
              setStats(calculatedStats);
            }
          } else {
            console.error('API response error:', data.error || 'No orders data');
            console.log('Full response data:', data);
            setOrders([]);
          }
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch orders:', response.status, errorText);
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchOrders();
  }, [router]);

  // Get recent orders (latest 3)
  const recentOrders = orders.slice(0, 3);

  const [recommendedProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Handwoven Silk Saree',
      price: 8500,
      originalPrice: 12000,
      category: 'Textiles',
      artisanName: 'Priya Sharma',
      rating: 4.8,
      reviewCount: 156,
      discount: 29,
      isTrending: true
    },
    {
      id: '2',
      name: 'Ceramic Tea Set',
      price: 2400,
      originalPrice: 3200,
      category: 'Pottery',
      artisanName: 'Rajesh Kumar',
      rating: 4.6,
      reviewCount: 89,
      discount: 25,
      isNew: true
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-400';
      case 'shipped':
        return 'bg-purple-500/20 text-purple-400';
      case 'delivered':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400">Welcome back, Arjun!</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-700 rounded-lg px-3 py-2">
              <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">Customer</p>
                <p className="text-xs text-slate-400">Premium Member</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-orange-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 text-green-400 mr-1" />
                  <span className="text-green-400 text-xs">+2 this month</span>
                </div>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-orange-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-white">₹{stats.totalSpent.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 text-green-400 mr-1" />
                  <span className="text-green-400 text-xs">+15% this month</span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-orange-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Wishlist Items</p>
                <p className="text-2xl font-bold text-white">{stats.wishlistItems}</p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 text-blue-400 mr-1" />
                  <span className="text-blue-400 text-xs">+3 this week</span>
                </div>
              </div>
              <Heart className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-orange-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Cart Items</p>
                <p className="text-2xl font-bold text-white">{stats.cartItems}</p>
                <div className="flex items-center mt-1">
                  <ArrowDown className="h-3 w-3 text-yellow-400 mr-1" />
                  <span className="text-yellow-400 text-xs">Ready to checkout</span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Recent Orders</h2>
                <button
                  onClick={() => router.push('/customer/orders')}
                  className="text-orange-500 hover:text-orange-400 text-sm font-medium flex items-center"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-slate-600 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-slate-600 rounded w-24 mb-2"></div>
                          <div className="h-3 bg-slate-600 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-slate-600 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-slate-600 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No orders yet</h3>
                  <p className="text-slate-400 mb-4">Start shopping to see your orders here</p>
                  <button
                    onClick={() => router.push('/customer/products')}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{order.orderNumber}</p>
                          <p className="text-slate-400 text-sm">
                            {new Date(order.date).toLocaleDateString()} • {order.itemCount} items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">₹{order.total.toLocaleString()}</p>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommended Products */}
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Recommended for You</h2>
                <button
                  onClick={() => router.push('/customer/products')}
                  className="text-orange-500 hover:text-orange-400 text-sm font-medium flex items-center"
                >
                  Browse All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {recommendedProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-4 p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer">
                    <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-white">{product.name}</h3>
                        {product.isNew && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">New</span>
                        )}
                        {product.isTrending && (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">Trending</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">by {product.artisanName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-slate-400 text-xs ml-1">{product.rating}</span>
                        </div>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-slate-400 text-xs">{product.reviewCount} reviews</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-white">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-slate-400 text-sm line-through">₹{product.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                      {product.discount && (
                        <span className="text-green-400 text-xs">{product.discount}% off</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => router.push('/customer/products')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-left hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
            >
              <Package className="h-8 w-8 text-white mb-3" />
              <h3 className="text-lg font-bold text-white">Browse Products</h3>
              <p className="text-orange-100 text-sm">Discover amazing handcrafted items</p>
            </button>

            <button
              onClick={() => router.push('/customer/orders')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-left hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              <Eye className="h-8 w-8 text-white mb-3" />
              <h3 className="text-lg font-bold text-white">Track Orders</h3>
              <p className="text-blue-100 text-sm">Monitor your order status</p>
            </button>

            <button
              onClick={() => router.push('/customer/wishlist')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-left hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              <Heart className="h-8 w-8 text-white mb-3" />
              <h3 className="text-lg font-bold text-white">My Wishlist</h3>
              <p className="text-purple-100 text-sm">View your saved items</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
