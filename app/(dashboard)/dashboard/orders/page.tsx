"use client";

import { Button } from "@/components/ui/button";
import {
    CheckCircle,
    Clock,
    DollarSign,
    Edit3,
    Eye,
    Filter,
    IndianRupee,
    Package,
    Search,
    ShoppingBag,
    Trash2,
    Truck,
    X,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDynamicTranslation } from "@/lib/i18n/useDynamicTranslation";

interface Order {
  id: string;
  order_number: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total_amount: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  payment_method: string;
  payment_status?: string;
  payment_details?: any;
  transaction_id?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  delivery_date?: string;
  tracking_number?: string;
}

interface OrderItem {
  id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  total: number;
}

export default function OrdersPage() {
  const { translateBatch, t } = useDynamicTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Helper function to render currency icon
  const renderCurrencyIcon = (currency: string) => {
    if (currency === "INR") {
      return <IndianRupee className="h-4 w-4" />;
    } else if (currency === "$" || currency === "USD") {
      return <DollarSign className="h-4 w-4" />;
    } else {
      return currency;
    }
  };

  // Helper function to get status colors and icons
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
          icon: Clock,
        };

      case "CONFIRMED":
        return {
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          icon: CheckCircle,
        };
      case "SHIPPED":
        return {
          color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
          icon: Truck,
        };
      case "DELIVERED":
        return {
          color: "bg-green-500/20 text-green-400 border-green-500/30",
          icon: Package,
        };
      case "CANCELLED":
        return {
          color: "bg-red-500/20 text-red-400 border-red-500/30",
          icon: XCircle,
        };
      default:
        return {
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
          icon: Package,
        };
    }
  };

  useEffect(() => {
    translateBatch([
      "Orders Management",
      "Manage and track all customer orders",
      "Refresh Orders",
      "Total Orders",
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Search orders...",
      "All Status",
      "No Orders Found",
      "No orders have been placed yet.",
      "No orders match your search criteria.",
      "Order",
      "Customer",
      "Status",
      "Payment",
      "Amount",
      "Date",
      "Actions",
      "Loading orders...",
      "Order Details",
      "Close",
      "Online",
      "COD",
      "Paid",
      "Failed",
      "Previous",
      "Next",
      "Page",
      "of",
      "Showing",
      "to",
      "results",
    ]);
  }, [translateBatch]);

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken") || 
                   localStorage.getItem("authToken") || 
                   localStorage.getItem("auth_token");
      
      if (!token) {
        console.warn('No authentication token found on mount');
        // You can choose to redirect here or let loadOrders handle it
      }
    };
    
    checkAuth();
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      console.log('Admin orders - Token found:', !!token);
      console.log('Admin orders - All localStorage keys:', Object.keys(localStorage));
      
      if (!token) {
        console.error('No access token found in localStorage');
        console.log('Checking alternative token keys...');
        
        // Check for alternative token keys
        const altToken = localStorage.getItem("authToken") || localStorage.getItem("auth_token") || localStorage.getItem("token");
        console.log('Alternative token found:', !!altToken);
        
        if (!altToken) {
          console.error('No authentication token found. Redirecting to login...');
          // Redirect to login page
          window.location.href = '/auth/admin';
          return;
        } else {
          console.log('Using alternative token');
          // Use the alternative token
          localStorage.setItem("accessToken", altToken);
        }
      }
      
      const finalToken = token || localStorage.getItem("accessToken");
      console.log('Admin orders - Final token preview:', finalToken ? finalToken.substring(0, 20) + '...' : 'No token');
      
      const response = await fetch("/api/orders", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${finalToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log('Admin orders - Response status:', response.status);
      
      if (response.status === 401) {
        console.error('Authentication failed. Token may be expired. Redirecting to login...');
        localStorage.removeItem("accessToken");
        localStorage.removeItem("authToken");
        localStorage.removeItem("auth_token");
        window.location.href = '/auth/admin';
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('Admin orders - Response data:', data);
        if (data.success) {
          // Transform the data to match the expected format
          const transformedOrders = data.orders.map((order: any) => ({
            id: order.id,
            order_number: order.orderNumber,
            status: order.status.toUpperCase(),
            total_amount: order.total,
            currency: order.currency,
            customer_name: order.shippingAddress?.fullName || "Customer",
            customer_email: order.shippingAddress?.email || "",
            customer_phone: order.shippingAddress?.phone || "",
            shipping_address: `${order.shippingAddress?.address || ""}, ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} ${order.shippingAddress?.pincode || ""}`,
            delivery_date: order.estimatedDelivery,
            tracking_number: order.trackingNumber,
            items: order.items?.map((item: any, index: number) => ({
              id: index + 1,
              product_name: item.name,
              product_image: item.imageUrl,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
            })) || [],
            created_at: order.createdAt,
            updated_at: order.updatedAt || order.createdAt,
          }));
          
          setOrders(transformedOrders);
        }
      } else {
        console.error("Failed to fetch orders - Status:", response.status);
        const errorData = await response.text();
        console.error("Error response:", errorData);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const handleDeleteOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground mt-4">{t("Loading orders...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("Orders Management")}</h1>
            <p className="text-muted-foreground">
              {t("Manage and track all customer orders")}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => loadOrders()}
              className="bg-primary hover:bg-primary/90"
            >
              <Package className="h-4 w-4 mr-2" />
              {t("Refresh Orders")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t("Total Orders")}</p>
                <p className="text-2xl font-bold text-foreground">{orders.length}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t("Pending")}</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {orders.filter(o => o.status === "PENDING").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t("Confirmed")}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {orders.filter(o => o.status === "CONFIRMED").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t("Shipped")}</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {orders.filter(o => o.status === "SHIPPED").length}
                </p>
              </div>
              <Truck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t("Delivered")}</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {orders.filter(o => o.status === "DELIVERED").length}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder={t("Search orders...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">{t("All Status")}</option>
              <option value="PENDING">{t("Pending")}</option>
              <option value="CONFIRMED">{t("Confirmed")}</option>
              <option value="SHIPPED">{t("Shipped")}</option>
              <option value="DELIVERED">{t("Delivered")}</option>
              <option value="CANCELLED">{t("Cancelled")}</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">{t("No Orders Found")}</h3>
            <p className="text-muted-foreground">
              {orders.length === 0 
                ? t("No orders have been placed yet.")
                : t("No orders match your search criteria.")
              }
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("Order")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("Customer")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("Status")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("Payment")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("Amount")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("Date")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={order.id} className="hover:bg-accent/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {order.order_number}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {order.customer_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {order.customer_email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.payment_method === 'online' 
                                ? 'bg-blue-500/20 text-blue-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {order.payment_method === 'online' ? '💳 Online' : '💵 COD'}
                            </span>
                            <span className={`mt-1 text-xs ${
                              order.payment_status === 'completed' 
                                ? 'text-green-400' 
                                : order.payment_status === 'pending'
                                ? 'text-yellow-400'
                                : 'text-red-400'
                            }`}>
                              {order.payment_status === 'completed' ? '✓ Paid' : 
                               order.payment_status === 'pending' ? '⏳ Pending' : 
                               '✗ Failed'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-medium text-foreground">
                            {renderCurrencyIcon(order.currency)}
                            <span className="ml-1">{order.total_amount.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditOrder(order)}
                              className="text-yellow-400 hover:text-yellow-300"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredOrders.length > 0 && (
          <div className="mt-6 flex items-center justify-between bg-card border border-border rounded-lg px-6 py-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{t("Showing")}</span>
              <span className="font-medium text-foreground">
                {indexOfFirstOrder + 1}
              </span>
              <span>{t("to")}</span>
              <span className="font-medium text-foreground">
                {Math.min(indexOfLastOrder, filteredOrders.length)}
              </span>
              <span>{t("of")}</span>
              <span className="font-medium text-foreground">
                {filteredOrders.length}
              </span>
              <span>{t("results")}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-border hover:bg-accent disabled:opacity-50"
              >
                {t("Previous")}
              </Button>

              <div className="flex items-center space-x-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          currentPage === pageNumber
                            ? "bg-primary text-primary-foreground font-medium"
                            : "bg-background text-foreground hover:bg-accent"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span key={pageNumber} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-border hover:bg-accent disabled:opacity-50"
              >
                {t("Next")}
              </Button>
            </div>
          </div>
        )}

        {/* View Order Modal */}
        {showViewModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Order Details</h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Order Number</p>
                      <p className="text-foreground font-medium">{selectedOrder.order_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusConfig(selectedOrder.status).color}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground text-sm">Customer</p>
                    <p className="text-foreground font-medium">{selectedOrder.customer_name}</p>
                    <p className="text-muted-foreground text-sm">{selectedOrder.customer_email}</p>
                    <p className="text-muted-foreground text-sm">{selectedOrder.customer_phone}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground text-sm">Shipping Address</p>
                    <p className="text-foreground">{selectedOrder.shipping_address}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground text-sm">Items</p>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-accent/50 p-3 rounded border border-border">
                          <div>
                            <p className="text-foreground font-medium">{item.product_name}</p>
                            <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-foreground font-medium">₹{item.total.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="text-foreground font-bold text-lg">₹{selectedOrder.total_amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}