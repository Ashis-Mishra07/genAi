"use client";

import {
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Filter,
    IndianRupee,
    Package,
    Search,
    Truck,
    XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  artisanName?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: any;
  paymentMethod: string;
  paymentStatus?: string;
  paymentDetails?: any;
  transactionId?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  customerName?: string;
  customerEmail?: string;
}

export default function ArtisanOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
    const role = localStorage.getItem("user_role");

    if (!token || role !== "ARTISAN") {
      router.push("/auth/artisan");
      return;
    }

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("auth_token") || localStorage.getItem("accessToken");

      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-blue-400" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-400" />;
      case "delivered":
        return <Package className="h-5 w-5 text-green-400" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Package className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "confirmed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "shipped":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "delivered":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const renderCurrencyIcon = (currency: string) => {
    if (currency === "INR") {
      return <IndianRupee className="h-4 w-4" />;
    } else {
      return <DollarSign className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading orders...</p>
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
            <h1 className="text-2xl font-bold text-white">My Orders</h1>
            <p className="text-slate-400">Track and manage your product orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-white">{orders.length}</p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {orders.filter((o) => o.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Online Paid</p>
                <p className="text-2xl font-bold text-green-400">
                  {orders.filter((o) => o.paymentStatus === "completed").length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">COD Pending</p>
                <p className="text-2xl font-bold text-orange-400">
                  {
                    orders.filter(
                      (o) => o.paymentMethod === "cod" && o.paymentStatus === "pending"
                    ).length
                  }
                </p>
              </div>
              <IndianRupee className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by order number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
            <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Orders Found</h3>
            <p className="text-slate-400">
              {orders.length === 0
                ? "You haven't received any orders yet."
                : "No orders match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-orange-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Order Header */}
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="text-lg font-semibold text-white">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status.toUpperCase()}</span>
                      </span>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Customer</p>
                        <p className="text-white font-medium">
                          {order.customerName || "N/A"}
                        </p>
                        <p className="text-slate-400 text-xs">{order.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Payment Method</p>
                        <div className="flex items-center mt-1">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              order.paymentMethod === "online"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {order.paymentMethod === "online" ? (
                              <>
                                <CreditCard className="h-3 w-3 mr-1" />
                                Online Payment
                              </>
                            ) : (
                              <>
                                <IndianRupee className="h-3 w-3 mr-1" />
                                Cash on Delivery
                              </>
                            )}
                          </span>
                        </div>
                        <p
                          className={`text-xs mt-1 ${
                            order.paymentStatus === "completed"
                              ? "text-green-400"
                              : order.paymentStatus === "pending"
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {order.paymentStatus === "completed"
                            ? "✓ Payment Received"
                            : order.paymentStatus === "pending"
                            ? "⏳ Payment Pending"
                            : "✗ Payment Failed"}
                        </p>
                        {order.transactionId && (
                          <p className="text-slate-500 text-xs mt-1">
                            Txn: {order.transactionId.slice(0, 16)}...
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-slate-400">Order Total</p>
                        <div className="flex items-center text-white font-semibold text-lg mt-1">
                          {renderCurrencyIcon(order.currency)}
                          <span className="ml-1">{order.total.toLocaleString()}</span>
                        </div>
                        <p className="text-slate-400 text-xs mt-1">
                          {order.items.length} item(s)
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-slate-400 text-sm mb-2">Order Items:</p>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-white">
                              {item.name} x {item.quantity}
                            </span>
                            <span className="text-slate-400">
                              {renderCurrencyIcon(order.currency)}
                              {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Date */}
                    <div className="mt-4 text-xs text-slate-500">
                      Ordered on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
