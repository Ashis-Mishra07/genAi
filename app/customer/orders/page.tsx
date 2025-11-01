"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Eye,
  Star,
  MapPin,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import { GoogleLoaderWithText } from "@/components/ui/google-loader";

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
              orderNumber: order.orderNumber,
              status: order.status,
              total: order.total,
              currency: order.currency,
              date: order.createdAt,
              estimatedDelivery: order.estimatedDelivery,
              items: order.items || [],
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
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesStatus && matchesSearch;
  });

  // Calculate order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <GoogleLoaderWithText size="lg" text="Loading your orders..." />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-6">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-4">
              No Orders Found
            </h2>
            <p className="text-muted-foreground mb-8">
              You haven't placed any orders yet. Start shopping to see your
              orders here!
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/customer/products")}
                className="w-full bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Start Shopping
              </button>
              <button
                onClick={() => router.push("/auth/customer")}
                className="w-full bg-muted text-muted-foreground px-8 py-3 rounded-lg font-semibold hover:bg-muted/80 transition-colors">
                Sign In / Sign Up
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">
                  My Orders
                </h1>
                <p className="text-muted-foreground">
                  {orders.length} orders placed
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-muted rounded-lg px-3 py-2">
                  <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-primary font-medium">
                    ₹
                    {orders
                      .reduce((sum, order) => {
                        const orderTotal = Number(order.total) || 0;
                        return sum + orderTotal;
                      }, 0)
                      .toLocaleString()}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Total Value
                  </span>
                </div>
              </div>
            </div>

            {/* Order Statistics */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-card-foreground">
                  {orderStats.total}
                </div>
                <div className="text-muted-foreground text-sm">
                  Total Orders
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {orderStats.pending}
                </div>
                <div className="text-muted-foreground text-sm">Pending</div>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {orderStats.shipped}
                </div>
                <div className="text-muted-foreground text-sm">Shipped</div>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {orderStats.delivered}
                </div>
                <div className="text-muted-foreground text-sm">Delivered</div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search orders or products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-80"
                  />
                </div>

                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none bg-muted border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10">
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="text-muted-foreground text-sm">
                {filteredOrders.length} of {orders.length} orders
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="p-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  No orders found
                </h2>
                <p className="text-muted-foreground mb-8">
                  {filterStatus === "all"
                    ? "You haven't placed any orders yet"
                    : `No ${filterStatus} orders found`}
                </p>
                <button
                  onClick={() => router.push("/customer/products")}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card rounded-2xl p-6 border border-border hover:border-primary/20 transition-colors shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <div>
                            <h3 className="font-semibold text-card-foreground">
                              {order.orderNumber}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {new Date(order.date).toLocaleDateString()}
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
                        <div className="text-xl font-bold text-card-foreground">
                          ₹{Number(order.total).toLocaleString()}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {order.items.length} items
                        </div>
                      </div>
                    </div>

                    {order.trackingNumber && (
                      <div className="mb-4 flex items-center space-x-2 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        <span>Tracking: {order.trackingNumber}</span>
                      </div>
                    )}

                    {order.estimatedDelivery && (
                      <div className="mb-4 flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Expected:{" "}
                          {new Date(
                            order.estimatedDelivery
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div
                            key={index}
                            className="text-sm text-muted-foreground">
                            {item.name}
                            {index < Math.min(order.items.length - 1, 2) &&
                              ", "}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-sm text-muted-foreground">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
                        <Eye className="h-4 w-4" />
                        <span>Track Order</span>
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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Order Tracking</h2>
                  <p className="text-blue-100">{selectedOrder.orderNumber}</p>
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-white hover:text-blue-200 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Order Summary Header */}
              <div className="mt-4 flex items-center justify-between bg-white/20 rounded-lg p-4">
                <div>
                  <p className="text-blue-100 text-sm">Order Date</p>
                  <p className="text-white font-medium">
                    {new Date(selectedOrder.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-blue-100 text-sm">Status</p>
                  <span className="inline-block bg-white text-blue-700 px-3 py-1 rounded-full text-sm font-medium mt-1">
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Total Amount</p>
                  <p className="text-white font-bold text-lg">
                    ₹{Number(selectedOrder.total).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Order Progress */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Order Progress
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        status: "pending",
                        label: "Order Placed",
                        description: "Order was placed and payment confirmed",
                        location: "Online",
                        time: "11/1/2025 1:25:14 AM",
                        completed: true,
                        icon: CheckCircle,
                      },
                      {
                        status: "confirmed",
                        label: "Order Confirmed",
                        description:
                          "Artisan confirmed your order and started preparation",
                        location: "Artisan Workshop",
                        time: "11/2/2025 10:30 AM",
                        completed: [
                          "confirmed",
                          "shipped",
                          "delivered",
                        ].includes(selectedOrder.status),
                        icon: CheckCircle,
                      },
                      {
                        status: "production",
                        label: "In Production",
                        description:
                          "Your handcrafted item is being carefully made",
                        location: "Artisan Workshop",
                        time: "",
                        completed: ["shipped", "delivered"].includes(
                          selectedOrder.status
                        ),
                        icon: Clock,
                      },
                      {
                        status: "shipped",
                        label: "Shipped",
                        description: "Order has been shipped and is on the way",
                        location: "In Transit",
                        time: "",
                        completed: ["shipped", "delivered"].includes(
                          selectedOrder.status
                        ),
                        icon: Truck,
                      },
                      {
                        status: "out-for-delivery",
                        label: "Out for Delivery",
                        description:
                          "Order is out for delivery to your address",
                        location: "Local Delivery Hub",
                        time: "",
                        completed: selectedOrder.status === "delivered",
                        icon: MapPin,
                      },
                      {
                        status: "delivered",
                        label: "Delivered",
                        description: "Order has been delivered successfully",
                        location: "Scr-12, Sec-1, Niladrivihar, BBSR, Odisha",
                        time: "",
                        completed: selectedOrder.status === "delivered",
                        icon: CheckCircle,
                      },
                    ].map((step, index) => {
                      const Icon = step.icon;
                      const isActive =
                        step.status === selectedOrder.status ||
                        (selectedOrder.status === "pending" &&
                          step.status === "pending") ||
                        (selectedOrder.status === "confirmed" &&
                          ["pending", "confirmed"].includes(step.status));

                      return (
                        <div
                          key={step.status}
                          className="flex items-start space-x-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                step.completed
                                  ? "bg-green-500"
                                  : isActive
                                  ? "bg-blue-500"
                                  : "bg-gray-300"
                              }`}>
                              <Icon
                                className={`h-5 w-5 ${
                                  step.completed || isActive
                                    ? "text-white"
                                    : "text-gray-500"
                                }`}
                              />
                            </div>
                            {index < 5 && (
                              <div
                                className={`w-0.5 h-8 mt-2 ${
                                  step.completed
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`font-medium ${
                                  step.completed || isActive
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}>
                                {step.label}
                              </h4>
                              {step.time && (
                                <span className="text-xs text-muted-foreground">
                                  {step.time}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-sm mt-1 ${
                                step.completed || isActive
                                  ? "text-muted-foreground"
                                  : "text-muted-foreground/60"
                              }`}>
                              {step.description}
                            </p>
                            {step.location && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {step.location}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4 p-4 bg-muted rounded-xl">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">
                              {item.name}
                            </h4>
                            {item.artisanName && (
                              <p className="text-sm text-muted-foreground">
                                by {item.artisanName}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-foreground">
                              ₹
                              {(
                                Number(item.price) * item.quantity
                              ).toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ₹{Number(item.price).toLocaleString()} each
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Shipping Address
                    </h3>
                    <div className="p-4 bg-muted rounded-xl">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">
                            {selectedOrder.shippingAddress.name}
                          </p>
                          <p className="text-muted-foreground">
                            {selectedOrder.shippingAddress.address}
                          </p>
                          <p className="text-muted-foreground">
                            {selectedOrder.shippingAddress.city},{" "}
                            {selectedOrder.shippingAddress.state}{" "}
                            {selectedOrder.shippingAddress.pincode}
                          </p>
                          <p className="text-muted-foreground flex items-center mt-2">
                            <Package className="h-4 w-4 mr-1" />
                            {selectedOrder.shippingAddress.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Tracking */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Live Tracking
                    </h3>
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-200/20">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MapPin className="h-8 w-8 text-blue-500" />
                        </div>
                        <h4 className="font-medium text-foreground mb-2">
                          Live Tracking Map
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          Real-time location updates
                        </p>
                        {selectedOrder.status === "shipped" && (
                          <div className="mt-4 px-4 py-2 bg-blue-500/20 rounded-full text-blue-600 text-sm font-medium">
                            Tracking Active
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Order Summary
                    </h3>
                    <div className="bg-muted rounded-xl p-4 space-y-3">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal:</span>
                        <span>
                          ₹{Number(selectedOrder.total).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Shipping:</span>
                        <span className="text-green-600 font-medium">Free</span>
                      </div>
                      <div className="border-t border-border pt-3 mt-3">
                        <div className="flex justify-between text-foreground font-semibold text-lg">
                          <span>Total:</span>
                          <span>
                            ₹{Number(selectedOrder.total).toLocaleString()}
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
      )}
    </>
  );
}
