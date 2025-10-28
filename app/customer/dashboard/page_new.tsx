'use client';

import { useState } from 'react';
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

  const [stats] = useState<DashboardStats>({
    totalOrders: 12,
    totalSpent: 45600,
    wishlistItems: 8,
    cartItems: 3
  });

  const [recentOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      status: 'delivered',
      total: 12800,
      date: '2024-01-20',
      itemCount: 2
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      status: 'shipped',
      total: 8500,
      date: '2024-01-15',
      itemCount: 1
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      status: 'confirmed',
      total: 5600,
      date: '2024-01-10',
      itemCount: 2
    }
  ]);

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
