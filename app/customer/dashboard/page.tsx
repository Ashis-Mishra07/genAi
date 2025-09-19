"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  MessageSquare,
  Search,
  Filter,
  Settings,
  LogOut,
  Star,
  MapPin,
  User,
  Package,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  artisanName: string;
  location: string;
  rating: number;
  specialty: string;
}

interface Order {
  id: string;
  productName: string;
  artisanName: string;
  status: string;
  total: number;
  date: string;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("user_role");

    if (!token || role !== "CUSTOMER") {
      router.push("/auth/customer");
      return;
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch user info
      const userResponse = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }

      // Fetch featured products
      const productsResponse = await fetch("/api/products?featured=true");

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        // Mock data for now since we don't have products yet
        setProducts([
          {
            id: "1",
            name: "Handwoven Silk Saree",
            price: 5500,
            artisanName: "Priya Sharma",
            location: "Rajasthan, India",
            rating: 4.8,
            specialty: "Textile & Embroidery",
            imageUrl: undefined,
          },
          {
            id: "2",
            name: "Clay Terracotta Vase",
            price: 800,
            artisanName: "Meera Devi",
            location: "Gujarat, India",
            rating: 4.9,
            specialty: "Pottery",
            imageUrl: undefined,
          },
          {
            id: "3",
            name: "Carved Wooden Sculpture",
            price: 3200,
            artisanName: "Rajesh Kumar",
            location: "Kerala, India",
            rating: 4.7,
            specialty: "Wood Carving",
            imageUrl: undefined,
          },
        ]);
      }

      // Mock recent orders
      setRecentOrders([
        {
          id: "1",
          productName: "Embroidered Wall Hanging",
          artisanName: "Priya Sharma",
          status: "Delivered",
          total: 1200,
          date: "2024-01-15",
        },
        {
          id: "2",
          productName: "Handmade Ceramic Bowl",
          artisanName: "Meera Devi",
          status: "Shipped",
          total: 450,
          date: "2024-01-12",
        },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_id");
    router.push("/");
  };

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.artisanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-emerald-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Marketplace
                </h1>
                <p className="text-sm text-gray-600">
                  Discover amazing crafts, {user?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Heart className="h-6 w-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <MessageSquare className="h-6 w-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Settings className="h-6 w-6" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500">
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Welcome to the Artisan Marketplace
          </h2>
          <p className="text-emerald-100 mb-6">
            Discover unique handmade products and connect with talented artisans
            from around India
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for products, artisans, or crafts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              />
            </div>
            <button className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-medium hover:bg-emerald-50 transition-colors flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filter
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Products */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Featured Products
                </h2>
              </div>

              <div className="p-6">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your search query
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {product.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <User className="h-4 w-4 mr-1" />
                            {product.artisanName}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {product.location}
                          </div>
                          <div className="flex items-center mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(product.rating)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              ({product.rating})
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-emerald-600">
                              ₹{product.price}
                            </span>
                            <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors text-sm">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h3>
              </div>
              <div className="p-6">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">No recent orders</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border-l-4 border-emerald-500 pl-4">
                        <h4 className="font-medium text-gray-900">
                          {order.productName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          by {order.artisanName}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "Shipped"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                            {order.status}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            ₹{order.total}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full flex items-center justify-center p-3 border border-emerald-300 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors">
                  <Heart className="h-5 w-5 mr-2" />
                  View Wishlist
                </button>
                <button className="w-full flex items-center justify-center p-3 border border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Chat with Artisans
                </button>
                <button className="w-full flex items-center justify-center p-3 border border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors">
                  <Package className="h-5 w-5 mr-2" />
                  Track Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
