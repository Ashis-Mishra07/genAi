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
import { useDynamicTranslation } from "@/lib/i18n/useDynamicTranslation";

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

  const { t, translateBatch, isTranslating } = useDynamicTranslation();

  useEffect(() => {
    translateBatch([
      "My Orders",
      "Track and manage your product orders",
      "Refresh",
      "Total Orders",
      "Pending",
      "Online Paid",
      "COD Pending",
      "Search by order number or customer",
      "All Orders",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Loading orders...",
      "No orders found",
      "Try adjusting your search or filters",
      "Order Number",
      "Customer",
      "Total",
      "Status",
      "Date",
      "Actions",
      "View Details",
      "Order Details",
      "Close",
      "Items",
      "Shipping Address",
      "Payment Information",
      "Payment Method",
      "Payment Status",
      "Transaction ID",
      "Tracking Number",
      "Estimated Delivery",
      "COD",
      "Online Payment",
      "Completed",
      "Pending Payment",
      "Update Status",
      "Mark as Confirmed",
      "Mark as Shipped",
      "Mark as Delivered",
      "Cancel Order",
      "Translating orders...",
    ]);
  }, []);

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

      console.log("🔍 Fetching artisan orders...");
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📦 Orders response:", data);
        if (data.success && data.orders) {
          console.log(`✅ Found ${data.orders.length} orders for this artisan`);
          setOrders(data.orders);
        } else {
          console.log("❌ No orders found in response");
        }
      } else {
        console.error("❌ Orders fetch failed:", response.status, response.statusText);
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
      case "confirmed":
        return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "shipped":
        return "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "delivered":
        return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
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

  if (loading || isTranslating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t(loading ? "Loading orders..." : "Translating orders...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl px-6 py-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("My Orders")}</h1>
            <div className="h-1 w-32 bg-primary rounded-full mt-2 mb-2"></div>
            <p className="text-muted-foreground">{t("Track and manage your product orders")}</p>
          </div>
          <button
            onClick={fetchOrders}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            {t("Refresh")}
          </button>
        </div>
      </div>

      <div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{t("Total Orders")}</p>
                <p className="text-3xl font-bold text-foreground mt-2">{orders.length}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Package className="h-7 w-7 text-primary" />
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{t("Pending")}</p>
                <p className="text-3xl font-bold text-yellow-500 mt-2">
                  {orders.filter((o) => o.status === "pending").length}
                </p>
              </div>
              <div className="bg-yellow-500/10 p-3 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
                <Clock className="h-7 w-7 text-yellow-500" />
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{t("Online Paid")}</p>
                <p className="text-3xl font-bold text-green-500 mt-2">
                  {orders.filter((o) => o.paymentStatus === "completed").length}
                </p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-xl group-hover:bg-green-500/20 transition-colors">
                <CreditCard className="h-7 w-7 text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{t("COD Pending")}</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {
                    orders.filter(
                      (o) => o.paymentMethod === "cod" && o.paymentStatus === "pending"
                    ).length
                  }
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                <IndianRupee className="h-7 w-7 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <input
              type="text"
              placeholder={t("Search by order number or customer")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-11 pr-8 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
            >
              <option value="all">{t("All Orders")}</option>
              <option value="pending">{t("Pending")}</option>
              <option value="confirmed">{t("Confirmed")}</option>
              <option value="shipped">{t("Shipped")}</option>
              <option value="delivered">{t("Delivered")}</option>
              <option value="cancelled">{t("Cancelled")}</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="bg-accent/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{t("No orders found")}</h3>
            <p className="text-muted-foreground">
              {orders.length === 0
                ? t("No orders found")
                : t("Try adjusting your search or filters")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-xl hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Order Header */}
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="text-lg font-semibold text-foreground">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1.5">{order.status.toUpperCase()}</span>
                      </span>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground font-medium">{t("Customer")}</p>
                        <p className="text-foreground font-semibold mt-1">
                          {order.customerName || "N/A"}
                        </p>
                        <p className="text-muted-foreground text-xs mt-0.5">{order.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">{t("Payment Method")}</p>
                        <div className="flex items-center mt-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                              order.paymentMethod === "online"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            }`}
                          >
                            {order.paymentMethod === "online" ? (
                              <>
                                <CreditCard className="h-3.5 w-3.5 mr-1" />
                                {t("Online Payment")}
                              </>
                            ) : (
                              <>
                                <IndianRupee className="h-3.5 w-3.5 mr-1" />
                                {t("COD")}
                              </>
                            )}
                          </span>
                        </div>
                        <p
                          className={`text-xs mt-1.5 font-medium ${
                            order.paymentStatus === "completed"
                              ? "text-green-500"
                              : order.paymentStatus === "pending"
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                        >
                          {order.paymentStatus === "completed"
                            ? `✓ ${t("Completed")}`
                            : order.paymentStatus === "pending"
                            ? `⏳ ${t("Pending Payment")}`
                            : "✗ Failed"}
                        </p>
                        {order.transactionId && (
                          <p className="text-muted-foreground text-xs mt-1">
                            {t("Transaction ID")}: {order.transactionId.slice(0, 16)}...
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">{t("Total")}</p>
                        <div className="flex items-center text-primary font-bold text-xl mt-1">
                          {renderCurrencyIcon(order.currency)}
                          <span className="ml-1">{order.total.toLocaleString()}</span>
                        </div>
                        <p className="text-muted-foreground text-xs mt-1">
                          {order.items.length} {t("Items")}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-muted-foreground text-sm font-medium mb-3">{t("Items")}:</p>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm bg-accent/30 rounded-lg p-2"
                          >
                            <span className="text-foreground font-medium">
                              {item.name} <span className="text-muted-foreground">x {item.quantity}</span>
                            </span>
                            <span className="text-muted-foreground font-semibold flex items-center">
                              {renderCurrencyIcon(order.currency)}
                              {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Date */}
                    <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {t("Date")}: {new Date(order.createdAt).toLocaleDateString("en-IN", {
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
