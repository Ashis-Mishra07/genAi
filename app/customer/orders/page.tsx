"use client";

import {
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Eye,
  MapPin,
  Package,
  Phone,
  Search,
  Truck,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Order {
  id: string;
  orderNumber: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total: number;
  currency: string;
  date: string;
  estimatedDelivery?: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  trackingNumber?: string;
}

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  artisanName?: string;
}

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch actual orders from database
  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      try {
        // First check if user is authenticated
        console.log("Checking authentication...");
        const authResponse = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!authResponse.ok) {
          console.log("User not authenticated, redirecting to login...");
          router.push("/auth/customer");
          return;
        }

        const authData = await authResponse.json();
        console.log("User authenticated:", authData.user.email);

        // Now fetch orders
        console.log("Fetching orders from API...");
        const response = await fetch("/api/orders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        console.log("Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("API Response:", data);
          if (data.success && data.orders) {
            const formattedOrders = data.orders.map((order: any) => ({
              id: order.id,
              orderNumber: order.orderNumber || "N/A",
              status: order.status || "pending",
              total: Number(order.total) || 0,
              currency: order.currency || "INR",
              date: order.createdAt || new Date().toISOString(),
              estimatedDelivery: order.estimatedDelivery,
              items: Array.isArray(order.items) ? order.items : [],
              shippingAddress: order.shippingAddress || {
                name: "Customer",
                address: "Address not available",
                city: "City",
                state: "State",
                pincode: "000000",
                phone: "Phone not available",
              },
              trackingNumber: order.trackingNumber,
            }));

            setOrders(formattedOrders);
            console.log("Formatted orders:", formattedOrders);
          } else {
            console.error(
              "API response error:",
              data.error || "No orders data"
            );
            console.log("Full response data:", data);
            setOrders([]);
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch orders:", response.status, errorText);
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders. Please try again later.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchOrders();
  }, [router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-blue-400" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-400" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "cancelled":
        return <X className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
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
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter orders based on status and search term
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(order.items) && order.items.some((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    return matchesStatus && matchesSearch;
  });

  // Calculate order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };
  const total = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const display = total.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });

  // Safe date formatter
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading your orders...</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-6">
            <Package className="h-16 w-16 text-slate-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              No Orders Found
            </h2>
            <p className="text-slate-400 mb-8">
              {error || "You haven't placed any orders yet. Start shopping to see your orders here!"}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/customer/products")}
                aria-label="Start shopping for products"
                className="w-full bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                Start Shopping
              </button>
              <button
                onClick={() => router.push("/auth/customer")}
                aria-label="Sign in or sign up"
                className="w-full bg-slate-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-600 transition-colors">
                Sign In / Sign Up
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">My Orders</h1>
                <p className="text-slate-400">{orders.length} orders placed</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-slate-700 rounded-lg px-3 py-2">
                  <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-orange-400 font-medium">{display}</span>
                  <span className="text-slate-400 text-sm">Total Value</span>
                </div>
              </div>
            </div>

            {/* Order Statistics */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {orderStats.total}
                </div>
                <div className="text-slate-400 text-sm">Total Orders</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {orderStats.pending}
                </div>
                <div className="text-slate-400 text-sm">Pending</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {orderStats.shipped}
                </div>
                <div className="text-slate-400 text-sm">Shipped</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {orderStats.delivered}
                </div>
                <div className="text-slate-400 text-sm">Delivered</div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search orders or products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search orders or products"
                    className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-80"
                  />
                </div>

                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    aria-label="Filter orders by status"
                    className="appearance-none bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 pr-10">
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="text-slate-400 text-sm">
                {filteredOrders.length} of {orders.length} orders
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="p-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">
                  No orders found
                </h2>
                <p className="text-slate-400 mb-8">
                  {filterStatus === "all"
                    ? "You haven't placed any orders yet"
                    : `No ${filterStatus} orders found`}
                </p>
                <button
                  onClick={() => router.push("/customer/products")}
                  aria-label="Start shopping for products"
                  className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-orange-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <div>
                            <h3 className="font-semibold text-white">
                              {order.orderNumber}
                            </h3>
                            <p className="text-slate-400 text-sm">
                              {formatDate(order.date)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            order.status
                          )}`}>
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold text-white">
                          ₹{(order.total || 0).toLocaleString()}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {Array.isArray(order.items) ? order.items.length : 0} items
                        </div>
                      </div>
                    </div>

                    {order.trackingNumber && (
                      <div className="mb-4 flex items-center space-x-2 text-sm text-slate-400">
                        <Truck className="h-4 w-4" />
                        <span>Tracking: {order.trackingNumber}</span>
                      </div>
                    )}

                    {order.estimatedDelivery && (
                      <div className="mb-4 flex items-center space-x-2 text-sm text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Expected:{" "}
                          {formatDate(order.estimatedDelivery)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {Array.isArray(order.items) && order.items.slice(0, 3).map((item, index) => (
                          <div key={item.id || index} className="text-sm text-slate-300">
                            {item.name}
                            {index < Math.min(order.items.length - 1, 2) &&
                              ", "}
                          </div>
                        ))}
                        {Array.isArray(order.items) && order.items.length > 3 && (
                          <span className="text-sm text-slate-400">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        aria-label={`View details for order ${order.orderNumber}`}
                        className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors">
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          {/* Blurred Background Overlay */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-md transition-all duration-300"
            onClick={() => setShowOrderDetails(false)}
            aria-label="Close modal"
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-5xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 id="modal-title" className="text-xl font-bold text-white">
                      Order Tracking
                    </h2>
                    <p className="text-orange-100 text-sm">
                      {selectedOrder.orderNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    aria-label="Close order details"
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[80vh] overflow-y-auto">
                {/* Order Info */}
                <div className="bg-slate-700/50 rounded-xl p-4 mb-6 border border-slate-600">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Order Date</p>
                      <p className="text-white font-semibold">
                        {formatDate(selectedOrder.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Status</p>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedOrder.status
                        )}`}>
                        {selectedOrder.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Total Amount</p>
                      <p className="text-white font-semibold">
                        ₹{(selectedOrder.total || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Side - Tracking Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Package className="w-5 h-5 mr-2 text-orange-500" />
                      Order Progress
                    </h3>

                    <div className="space-y-4">
                      {/* Order Placed */}
                      <div className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full border-2 bg-green-500 border-green-500 text-white flex items-center justify-center">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div className="w-0.5 h-16 bg-green-500" />
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-green-400">
                              Order Placed
                            </h4>
                            <span className="text-xs text-slate-400">
                              {formatDateTime(selectedOrder.date)}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm mb-2">
                            Order was placed and payment confirmed
                          </p>
                          <div className="flex items-center text-xs text-slate-400">
                            <MapPin className="w-3 h-3 mr-1" />
                            Online
                          </div>
                        </div>
                      </div>

                      {/* Order Confirmed */}
                      <div className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              selectedOrder.status === "pending"
                                ? "bg-orange-500 border-orange-500 text-white animate-pulse"
                                : "bg-green-500 border-green-500 text-white"
                            }`}>
                            {selectedOrder.status === "pending" ? (
                              <Clock className="w-5 h-5" />
                            ) : (
                              <CheckCircle className="w-5 h-5" />
                            )}
                          </div>
                          <div
                            className={`w-0.5 h-16 transition-all duration-300 ${
                              selectedOrder.status === "pending"
                                ? "bg-slate-600"
                                : "bg-green-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center justify-between mb-1">
                            <h4
                              className={`font-semibold ${
                                selectedOrder.status === "pending"
                                  ? "text-orange-400"
                                  : "text-green-400"
                              }`}>
                              Order Confirmed
                            </h4>
                            <span className="text-xs text-slate-400">
                              {selectedOrder.status !== "pending"
                                ? new Date(
                                    Date.now() + 24 * 60 * 60 * 1000
                                  ).toLocaleDateString() + " 10:30 AM"
                                : ""}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm mb-2">
                            Artisan confirmed your order and started preparation
                          </p>
                          <div className="flex items-center text-xs text-slate-400">
                            <MapPin className="w-3 h-3 mr-1" />
                            Artisan Workshop
                          </div>
                        </div>
                      </div>

                      {/* In Production */}
                      <div className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              selectedOrder.status === "confirmed"
                                ? "bg-orange-500 border-orange-500 text-white animate-pulse"
                                : selectedOrder.status === "shipped" ||
                                  selectedOrder.status === "delivered"
                                ? "bg-green-500 border-green-500 text-white"
                                : "bg-slate-700 border-slate-600 text-slate-400"
                            }`}>
                            {selectedOrder.status === "confirmed" ? (
                              <Clock className="w-5 h-5" />
                            ) : selectedOrder.status === "shipped" ||
                              selectedOrder.status === "delivered" ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Package className="w-5 h-5" />
                            )}
                          </div>
                          <div
                            className={`w-0.5 h-16 transition-all duration-300 ${
                              selectedOrder.status === "shipped" ||
                              selectedOrder.status === "delivered"
                                ? "bg-green-500"
                                : "bg-slate-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center justify-between mb-1">
                            <h4
                              className={`font-semibold ${
                                selectedOrder.status === "confirmed"
                                  ? "text-orange-400"
                                  : selectedOrder.status === "shipped" ||
                                    selectedOrder.status === "delivered"
                                  ? "text-green-400"
                                  : "text-slate-400"
                              }`}>
                              In Production
                            </h4>
                            <span className="text-xs text-slate-400">
                              {selectedOrder.status === "shipped" ||
                              selectedOrder.status === "delivered"
                                ? new Date(
                                    Date.now() + 2 * 24 * 60 * 60 * 1000
                                  ).toLocaleDateString() + " 2:15 PM"
                                : ""}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm mb-2">
                            Your handcrafted item is being carefully made
                          </p>
                          <div className="flex items-center text-xs text-slate-400">
                            <MapPin className="w-3 h-3 mr-1" />
                            Artisan Workshop
                          </div>
                        </div>
                      </div>

                      {/* Shipped */}
                      <div className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              selectedOrder.status === "shipped"
                                ? "bg-orange-500 border-orange-500 text-white animate-pulse"
                                : selectedOrder.status === "delivered"
                                ? "bg-green-500 border-green-500 text-white"
                                : "bg-slate-700 border-slate-600 text-slate-400"
                            }`}>
                            {selectedOrder.status === "shipped" ? (
                              <Clock className="w-5 h-5" />
                            ) : selectedOrder.status === "delivered" ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Truck className="w-5 h-5" />
                            )}
                          </div>
                          <div
                            className={`w-0.5 h-16 transition-all duration-300 ${
                              selectedOrder.status === "delivered"
                                ? "bg-green-500"
                                : "bg-slate-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center justify-between mb-1">
                            <h4
                              className={`font-semibold ${
                                selectedOrder.status === "shipped"
                                  ? "text-orange-400"
                                  : selectedOrder.status === "delivered"
                                  ? "text-green-400"
                                  : "text-slate-400"
                              }`}>
                              Shipped
                            </h4>
                            <span className="text-xs text-slate-400">
                              {selectedOrder.status === "shipped" ||
                              selectedOrder.status === "delivered"
                                ? new Date(
                                    Date.now() + 3 * 24 * 60 * 60 * 1000
                                  ).toLocaleDateString() + " 4:45 PM"
                                : ""}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm mb-2">
                            Order has been shipped and is on the way
                          </p>
                          <div className="flex items-center text-xs text-slate-400">
                            <MapPin className="w-3 h-3 mr-1" />
                            In Transit
                          </div>
                        </div>
                      </div>

                      {/* Out for Delivery */}
                      <div className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              selectedOrder.status === "delivered"
                                ? "bg-green-500 border-green-500 text-white"
                                : "bg-slate-700 border-slate-600 text-slate-400"
                            }`}>
                            {selectedOrder.status === "delivered" ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Truck className="w-5 h-5" />
                            )}
                          </div>
                          <div
                            className={`w-0.5 h-16 transition-all duration-300 ${
                              selectedOrder.status === "delivered"
                                ? "bg-green-500"
                                : "bg-slate-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center justify-between mb-1">
                            <h4
                              className={`font-semibold ${
                                selectedOrder.status === "delivered"
                                  ? "text-green-400"
                                  : "text-slate-400"
                              }`}>
                              Out for Delivery
                            </h4>
                            <span className="text-xs text-slate-400">
                              {selectedOrder.status === "delivered"
                                ? new Date(
                                    Date.now() + 5 * 24 * 60 * 60 * 1000
                                  ).toLocaleDateString() + " 9:00 AM"
                                : ""}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm mb-2">
                            Order is out for delivery to your address
                          </p>
                          <div className="flex items-center text-xs text-slate-400">
                            <MapPin className="w-3 h-3 mr-1" />
                            Local Delivery Hub
                          </div>
                        </div>
                      </div>

                      {/* Delivered */}
                      <div className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              selectedOrder.status === "delivered"
                                ? "bg-green-500 border-green-500 text-white"
                                : "bg-slate-700 border-slate-600 text-slate-400"
                            }`}>
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4
                              className={`font-semibold ${
                                selectedOrder.status === "delivered"
                                  ? "text-green-400"
                                  : "text-slate-400"
                              }`}>
                              Delivered
                            </h4>
                            <span className="text-xs text-slate-400">
                              {selectedOrder.status === "delivered"
                                ? new Date().toLocaleDateString() + " 2:30 PM"
                                : ""}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm mb-2">
                            Order has been delivered successfully
                          </p>
                          <div className="flex items-center text-xs text-slate-400">
                            <MapPin className="w-3 h-3 mr-1" />
                            {selectedOrder.shippingAddress.address}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Order Details & Map */}
                  <div className="space-y-6">
                    {/* Order Items */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Order Items
                      </h3>
                      <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                        {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                          selectedOrder.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center space-x-4 py-3 border-b border-slate-600 last:border-b-0">
                              <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center">
                                <Package className="w-8 h-8 text-slate-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-medium">
                                  {item.name}
                                </p>
                                {item.artisanName && (
                                  <p className="text-slate-400 text-sm">
                                    by {item.artisanName}
                                  </p>
                                )}
                                <p className="text-slate-400 text-sm">
                                  Quantity: {item.quantity || 1}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-semibold">
                                  ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                </p>
                                <p className="text-slate-400 text-sm">
                                  ₹{(item.price || 0).toLocaleString()} each
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 text-center py-4">No items found</p>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Shipping Address
                      </h3>
                      <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-orange-500 mt-1" />
                          <div>
                            <p className="text-white font-medium">
                              {selectedOrder.shippingAddress.name}
                            </p>
                            <p className="text-slate-300 text-sm leading-relaxed">
                              {selectedOrder.shippingAddress.address}
                              <br />
                              {selectedOrder.shippingAddress.city},{" "}
                              {selectedOrder.shippingAddress.state}{" "}
                              {selectedOrder.shippingAddress.pincode}
                            </p>
                            <div className="flex items-center mt-2">
                              <Phone className="w-4 h-4 text-slate-400 mr-2" />
                              <span className="text-slate-300 text-sm">
                                {selectedOrder.shippingAddress.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live Tracking Map */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Live Tracking
                      </h3>
                      <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600 text-center">
                        <div className="w-full h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-500">
                          <div className="text-center">
                            <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                            <p className="text-slate-300 font-medium">
                              Live Tracking Map
                            </p>
                            <p className="text-slate-400 text-sm">
                              Real-time location updates
                            </p>
                            {selectedOrder.trackingNumber && (
                              <p className="text-orange-400 text-xs mt-2">
                                Tracking: {selectedOrder.trackingNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Order Summary
                      </h3>
                      <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Subtotal:</span>
                          <span className="text-white">
                            ₹{(selectedOrder.total || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Shipping:</span>
                          <span className="text-green-400">Free</span>
                        </div>
                        <div className="border-t border-slate-600 pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span className="text-white">Total:</span>
                            <span className="text-white">
                              ₹{(selectedOrder.total || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}