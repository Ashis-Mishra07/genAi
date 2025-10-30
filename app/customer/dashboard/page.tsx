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

interface ApiOrder {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  total: number;
  createdAt: string;
  items?: unknown[];
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
            const formattedOrders = data.orders.map((order: ApiOrder) => ({
              id: order.id,
              orderNumber: order.orderNumber,
              status: order.status,
              total: Number(order.total) || 0,
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
              console.log('Calculated stats:', calculatedStats);
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
    // Convert to lowercase to handle case variations
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'pending':
        return 'bg-red-600/20 text-red-400';
      case 'confirmed':
        return 'bg-green-600/20 text-green-400';
      case 'shipped':
        return 'bg-purple-600/20 text-purple-400';
      case 'delivered':
        return 'bg-emerald-600/20 text-emerald-400';
      default:
        return 'bg-slate-600/20 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-gray-800 border-b border-slate-700 px-6 py-6 backdrop-blur-sm" style={{boxShadow: '0 25px 50px -12px rgba(255, 255, 255, 0.1)'}}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-100 bg-clip-text text-transparent" style={{filter: 'drop-shadow(0 4px 8px rgba(255, 255, 255, 0.2))'}}>Dashboard</h1>
            <p className="text-slate-300 mt-1">Welcome back, Arjun!</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 backdrop-blur-sm" style={{boxShadow: '0 20px 25px -5px rgba(255, 255, 255, 0.1), 0 10px 10px -5px rgba(255, 255, 255, 0.05)'}}>
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">Customer</p>
                <p className="text-xs text-blue-400 font-medium">Premium Member</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600 transition-all duration-200 hover:scale-[1.02]" style={{boxShadow: '0 25px 50px -12px rgba(255, 255, 255, 0.1), 0 10px 25px -5px rgba(255, 255, 255, 0.05)'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-white mt-2" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.1))'}}>{stats.totalOrders}</p>
                <div className="flex items-center mt-3">
                  <ArrowUp className="h-4 w-4 text-emerald-400 mr-1" />
                  <span className="text-emerald-400 text-sm font-medium">+2 this month</span>
                </div>
              </div>
              <div className="bg-blue-600/20 p-3 rounded-xl" style={{boxShadow: '0 10px 15px -3px rgba(255, 255, 255, 0.1)'}}>
                <Package className="h-8 w-8 text-blue-400" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2))'}} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600 transition-all duration-200 hover:scale-[1.02]" style={{boxShadow: '0 25px 50px -12px rgba(255, 255, 255, 0.1), 0 10px 25px -5px rgba(255, 255, 255, 0.05)'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Spent</p>
                <p className="text-3xl font-bold text-white mt-2" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.1))'}}>₹{parseFloat(String(stats.totalSpent)).toLocaleString()}</p>
                <div className="flex items-center mt-3">
                  <ArrowUp className="h-4 w-4 text-emerald-400 mr-1" />
                  <span className="text-emerald-400 text-sm font-medium">+15% this month</span>
                </div>
              </div>
              <div className="bg-emerald-600/20 p-3 rounded-xl" style={{boxShadow: '0 10px 15px -3px rgba(255, 255, 255, 0.1)'}}>
                <TrendingUp className="h-8 w-8 text-emerald-400" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2))'}} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600 transition-all duration-200 hover:scale-[1.02]" style={{boxShadow: '0 25px 50px -12px rgba(255, 255, 255, 0.1), 0 10px 25px -5px rgba(255, 255, 255, 0.05)'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Wishlist Items</p>
                <p className="text-3xl font-bold text-white mt-2" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.1))'}}>{stats.wishlistItems}</p>
                <div className="flex items-center mt-3">
                  <ArrowUp className="h-4 w-4 text-purple-400 mr-1" />
                  <span className="text-purple-400 text-sm font-medium">+3 this week</span>
                </div>
              </div>
              <div className="bg-purple-600/20 p-3 rounded-xl" style={{boxShadow: '0 10px 15px -3px rgba(255, 255, 255, 0.1)'}}>
                <Heart className="h-8 w-8 text-purple-400" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2))'}} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600 transition-all duration-200 hover:scale-[1.02]" style={{boxShadow: '0 25px 50px -12px rgba(255, 255, 255, 0.1), 0 10px 25px -5px rgba(255, 255, 255, 0.05)'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Cart Items</p>
                <p className="text-3xl font-bold text-white mt-2" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.1))'}}>{stats.cartItems}</p>
                <div className="flex items-center mt-3">
                  <ArrowDown className="h-4 w-4 text-orange-400 mr-1" />
                  <span className="text-orange-400 text-sm font-medium">Ready to checkout</span>
                </div>
              </div>
              <div className="bg-orange-600/20 p-3 rounded-xl" style={{boxShadow: '0 10px 15px -3px rgba(255, 255, 255, 0.1)'}}>
                <ShoppingCart className="h-8 w-8 text-orange-400" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2))'}} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl border border-slate-600 transition-all duration-300" style={{boxShadow: '0 25px 50px -12px rgba(255, 255, 255, 0.1), 0 10px 25px -5px rgba(255, 255, 255, 0.05)'}}>
            <div className="p-6 border-b border-slate-600">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.1))'}}>Recent Orders</h2>
                <button
                  onClick={() => router.push('/customer/orders')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center transition-colors"
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
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-slate-600 rounded-xl"></div>
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
                <div className="text-center py-12">
                  <div className="bg-slate-700 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Package className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No orders yet</h3>
                  <p className="text-slate-400 mb-6">Start shopping to see your orders here</p>
                  <button
                    onClick={() => router.push('/customer/products')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                          <Package className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{order.orderNumber}</p>
                          <p className="text-slate-400 text-sm">
                            {new Date(order.date).toLocaleDateString()} • {order.itemCount} items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">₹{(order.total && !isNaN(order.total) ? Math.round(order.total) : 0).toLocaleString('en-IN')}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
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
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl border border-slate-600 transition-all duration-300" style={{boxShadow: '0 25px 50px -12px rgba(255, 255, 255, 0.1), 0 10px 25px -5px rgba(255, 255, 255, 0.05)'}}>
            <div className="p-6 border-b border-slate-600">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.1))'}}>Recommended for You</h2>
                <button
                  onClick={() => router.push('/customer/products')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center transition-colors"
                >
                  Browse All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {recommendedProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-4 p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-xl flex items-center justify-center group-hover:from-blue-600/30 group-hover:to-indigo-600/30 transition-colors">
                      <Package className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-white">{product.name}</h3>
                        {product.isNew && (
                          <span className="px-2 py-1 bg-emerald-600/20 text-emerald-400 text-xs rounded-full font-medium">New</span>
                        )}
                        {product.isTrending && (
                          <span className="px-2 py-1 bg-orange-600/20 text-orange-400 text-xs rounded-full font-medium">Trending</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">by {product.artisanName}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-slate-400 text-sm ml-1">{product.rating}</span>
                        </div>
                        <span className="text-slate-500 text-sm">•</span>
                        <span className="text-slate-400 text-sm">{product.reviewCount} reviews</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-white">₹{(product.price && !isNaN(product.price) ? Math.round(product.price) : 0).toLocaleString('en-IN')}</span>
                        {product.originalPrice && (
                          <span className="text-slate-400 text-sm line-through">₹{(product.originalPrice && !isNaN(product.originalPrice) ? Math.round(product.originalPrice) : 0).toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      {product.discount && (
                        <span className="text-emerald-400 text-sm font-medium">{product.discount}% off</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {/* <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-6" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.1))'}}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => router.push('/customer/products')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-left hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] group"
              style={{boxShadow: '0 25px 50px -12px rgba(255, 255, 255, 0.1), 0 10px 25px -5px rgba(255, 255, 255, 0.08)'}}
            >
              <div className="bg-white/10 p-3 rounded-xl w-fit mb-4 group-hover:bg-white/20 transition-colors" style={{boxShadow: '0 10px 15px -3px rgba(255, 255, 255, 0.1)'}}>
                <Package className="h-8 w-8 text-white" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2))'}} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.1))'}}>Browse Products</h3>
              <p className="text-blue-100 text-sm">Discover amazing handcrafted items</p>
            </button>

            <button
              onClick={() => router.push('/customer/orders')}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-left hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-[1.02] group"
              style={{boxShadow: '0 25px 50px -12px rgba(255, 255, 255, 0.1), 0 10px 25px -5px rgba(255, 255, 255, 0.08)'}}
            >
              <div className="bg-white/10 p-3 rounded-xl w-fit mb-4 group-hover:bg-white/20 transition-colors" style={{boxShadow: '0 10px 15px -3px rgba(255, 255, 255, 0.1)'}}>
                <Eye className="h-8 w-8 text-white" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2))'}} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.1))'}}>Track Orders</h3>
              <p className="text-emerald-100 text-sm">Monitor your order status</p>
            </button>

            <button
              onClick={() => router.push('/customer/wishlist')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-left hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] group"
              style={{boxShadow: '0 25px 50px -12px rgba(255, 255, 255, 0.1), 0 10px 25px -5px rgba(255, 255, 255, 0.08)'}}
            >
              <div className="bg-white/10 p-3 rounded-xl w-fit mb-4 group-hover:bg-white/20 transition-colors" style={{boxShadow: '0 10px 15px -3px rgba(255, 255, 255, 0.1)'}}>
                <Heart className="h-8 w-8 text-white" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2))'}} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2" style={{filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.1))'}}>My Wishlist</h3>
              <p className="text-purple-100 text-sm">View your saved items</p>
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
