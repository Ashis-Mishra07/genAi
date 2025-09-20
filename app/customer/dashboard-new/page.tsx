"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Heart,
  ShoppingCart,
  User,
  Search,
  TrendingUp,
  Star,
  Bell,
  Grid3X3,
  ChevronRight,
} from "lucide-react";

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
  status: "pending" | "confirmed" | "shipped" | "delivered";
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
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      
      // Load featured products from real API
      try {
        const productsResponse = await fetch("/api/products?featured=true", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          if (productsData.success) {
            // Transform database products to match interface
            const transformedProducts: Product[] = productsData.products.map((p: any) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              originalPrice: p.price * 1.2, // Add 20% as original price for display
              imageUrl: p.imageUrl || "",
              category: p.category || "Handicrafts",
              artisanName: p.artisan?.name || "Artisan",
              rating: 4.0 + Math.random() * 1, // Mock rating between 4-5
              reviewCount: Math.floor(Math.random() * 50) + 5,
              isNew: Math.random() > 0.7,
              isTrending: Math.random() > 0.8,
              discount: Math.floor(Math.random() * 20),
            }));
            setFeaturedProducts(transformedProducts.slice(0, 8)); // Limit to 8
          }
        }
      } catch (error) {
        console.error("Error loading products:", error);
        setFeaturedProducts([]);
      }

      // Load recent orders from real API
      try {
        const ordersResponse = await fetch("/api/orders", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          if (ordersData.success) {
            // Transform database orders to match interface
            const transformedOrders: Order[] = ordersData.orders.slice(0, 5).map((o: any) => ({
              id: o.id,
              orderNumber: o.orderNumber || `ORD-${o.id.slice(0, 8)}`,
              date: o.createdAt || o.date,
              status: o.status,
              total: o.total,
              itemCount: o.items?.length || 1,
            }));
            setRecentOrders(transformedOrders);
          }
        }
      } catch (error) {
        console.error("Error loading orders:", error);
        setRecentOrders([]);
      }

      // Calculate dashboard stats from real data
      const stats: DashboardStats = {
        totalOrders: recentOrders.length,
        totalSpent: recentOrders.reduce((sum, order) => sum + order.total, 0),
        wishlistItems: JSON.parse(localStorage.getItem("customer_wishlist") || "[]").length,
        cartItems: JSON.parse(localStorage.getItem("customer_cart") || "[]").length,
      };
      setDashboardStats(stats);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Set fallback empty data
      setFeaturedProducts([]);
      setRecentOrders([]);
      setDashboardStats({
        totalOrders: 0,
        totalSpent: 0,
        wishlistItems: 0,
        cartItems: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/customer/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/customer/cart")}
                className="relative p-2 text-gray-600 hover:text-emerald-600"
              >
                <ShoppingCart className="h-6 w-6" />
                {dashboardStats && dashboardStats.cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {dashboardStats.cartItems}
                  </span>
                )}
              </button>
              
              <button className="p-2 text-gray-600 hover:text-emerald-600">
                <Bell className="h-6 w-6" />
              </button>
              
              <button
                onClick={() => router.push("/customer/profile")}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-emerald-600"
              >
                <User className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for handcrafted products..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* Stats Cards */}
        {dashboardStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">₹{dashboardStats.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Wishlist</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.wishlistItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cart Items</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.cartItems}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => router.push("/customer/products")}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                >
                  <Grid3X3 className="h-8 w-8 text-emerald-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Browse Products</span>
                </button>

                <button
                  onClick={() => router.push("/customer/orders")}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                >
                  <Package className="h-8 w-8 text-emerald-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">My Orders</span>
                </button>

                <button
                  onClick={() => router.push("/customer/wishlist")}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                >
                  <Heart className="h-8 w-8 text-emerald-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Wishlist</span>
                </button>

                <button
                  onClick={() => router.push("/customer/cart")}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                >
                  <ShoppingCart className="h-8 w-8 text-emerald-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Shopping Cart</span>
                </button>
              </div>
            </div>

            {/* Featured Products */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Featured Products</h2>
                <button
                  onClick={() => router.push("/customer/products")}
                  className="text-emerald-600 hover:text-emerald-700 flex items-center"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/customer/products/${product.id}`)}
                  >
                    <div className="relative mb-4">
                      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-16 w-16 text-gray-400" />
                        )}
                      </div>
                      
                      {product.isNew && (
                        <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                      
                      {product.isTrending && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Trending
                        </span>
                      )}
                      
                      {product.discount && (
                        <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                          {product.discount}% OFF
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">by {product.artisanName}</p>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {product.rating} ({product.reviewCount})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-emerald-600">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <button
                  onClick={() => router.push("/customer/orders")}
                  className="text-emerald-600 hover:text-emerald-700 flex items-center"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>

              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No recent orders</p>
                    <button
                      onClick={() => router.push("/customer/products")}
                      className="text-emerald-600 hover:text-emerald-700 text-sm mt-2"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push("/customer/orders")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{order.orderNumber}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{order.itemCount} item{order.itemCount > 1 ? "s" : ""}</span>
                        <span className="font-medium text-emerald-600">₹{order.total.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop by Category</h2>
              <div className="space-y-2">
                {[
                  "Textiles",
                  "Pottery",
                  "Metal Craft",
                  "Woodwork",
                  "Jewelry",
                  "Home Decor",
                ].map((category) => (
                  <button
                    key={category}
                    onClick={() => router.push(`/customer/products?category=${encodeURIComponent(category)}`)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="bg-emerald-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-emerald-900 mb-2">Need Help?</h2>
              <p className="text-emerald-700 text-sm mb-4">
                Our support team is here to help you with any questions.
              </p>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
