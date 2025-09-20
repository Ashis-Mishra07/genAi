"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  IndianRupee,
  DollarSign,
  User,
  MapPin,
  ShoppingBag,
  X,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

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
          color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
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
    checkAuthAndLoadOrders();
  }, []);

  const checkAuthAndLoadOrders = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        console.error("No access token found");
        window.location.href = "/auth/admin/signin";
        return;
      }

      // First check if user is authenticated
      const authResponse = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Auth check response status:", authResponse.status);

      if (authResponse.status === 401) {
        console.error("Authentication failed - redirecting to login");
        localStorage.removeItem("accessToken");
        window.location.href = "/auth/admin/signin";
        return;
      }

      if (authResponse.ok) {
        const authData = await authResponse.json();
        console.log("Current user:", authData.user);
        
        // Only proceed to load orders if auth is successful
        loadOrders();
      } else {
        console.error("Auth check failed");
        localStorage.removeItem("accessToken");
        window.location.href = "/auth/admin/signin";
      }
    } catch (error) {
      console.error("Auth check error:", error);
      localStorage.removeItem("accessToken");
      window.location.href = "/auth/admin/signin";
    }
  };

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        console.error("No access token found in loadOrders");
        return;
      }

      console.log("Fetching orders with token:", token ? "Token present" : "No token");
      
      const response = await fetch("/api/orders", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Orders API response status:", response.status);

      if (response.status === 401) {
        console.error("Orders API authentication failed");
        // Don't redirect here since checkAuthAndLoadOrders handles it
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log("Orders API response data:", data);
        
        if (data.success && data.orders) {
          // Transform the data to match the expected format
          const transformedOrders = data.orders.map((order: any) => ({
            id: order.id,
            order_number: order.orderNumber || order.order_number,
            status: (order.status || "PENDING").toUpperCase(),
            total_amount: order.total || order.total_amount || 0,
            currency: order.currency || "INR",
            customer_name: order.customerName || order.customer_name || order.shippingAddress?.fullName || "Customer",
            customer_email: order.customerEmail || order.customer_email || order.shippingAddress?.email || "",
            customer_phone: order.shippingAddress?.phone || "",
            shipping_address: typeof order.shippingAddress === 'string' 
              ? order.shippingAddress 
              : `${order.shippingAddress?.address || ""}, ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} ${order.shippingAddress?.pincode || ""}`,
            delivery_date: order.estimatedDelivery || order.delivery_date,
            tracking_number: order.trackingNumber || order.tracking_number,
            items: order.items?.map((item: any, index: number) => ({
              id: item.id || index + 1,
              product_name: item.name || item.product_name,
              product_image: item.imageUrl || item.product_image,
              quantity: item.quantity || 1,
              price: item.price || 0,
              total: (item.price || 0) * (item.quantity || 1),
            })) || [],
            created_at: order.createdAt || order.created_at || new Date().toISOString(),
            updated_at: order.updatedAt || order.updated_at || order.createdAt || order.created_at || new Date().toISOString(),
          }));
          
          console.log("Transformed orders:", transformedOrders);
          setOrders(transformedOrders);
        } else {
          console.log("No orders found or success=false, setting empty array");
          setOrders([]);
        }
      } else {
        const errorData = await response.text();
        console.error("Failed to fetch orders:", response.status, errorData);
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
      <div className="bg-black min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
          <p className="text-white mt-4">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Orders Management</h1>
            <p className="text-gray-400">
              Manage and track all customer orders
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => loadOrders()}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Package className="h-4 w-4 mr-2" />
              Refresh Orders
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-white">{orders.length}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-orange-400" />
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {orders.filter(o => o.status === "PENDING").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Confirmed</p>
                <p className="text-2xl font-bold text-blue-400">
                  {orders.filter(o => o.status === "CONFIRMED").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Shipped</p>
                <p className="text-2xl font-bold text-purple-400">
                  {orders.filter(o => o.status === "SHIPPED").length}
                </p>
              </div>
              <Truck className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Delivered</p>
                <p className="text-2xl font-bold text-green-400">
                  {orders.filter(o => o.status === "DELIVERED").length}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Orders Found</h3>
            <p className="text-gray-400">
              {orders.length === 0 
                ? "No orders have been placed yet."
                : "No orders match your search criteria."
              }
            </p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {order.order_number}
                            </div>
                            <div className="text-sm text-gray-400">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {order.customer_name}
                            </div>
                            <div className="text-sm text-gray-400">
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
                          <div className="flex items-center text-sm font-medium text-white">
                            {renderCurrencyIcon(order.currency)}
                            <span className="ml-1">{order.total_amount.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
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

        {/* View Order Modal */}
        {showViewModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Order Details</h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Order Number</p>
                      <p className="text-white font-medium">{selectedOrder.order_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusConfig(selectedOrder.status).color}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Customer</p>
                    <p className="text-white font-medium">{selectedOrder.customer_name}</p>
                    <p className="text-gray-400 text-sm">{selectedOrder.customer_email}</p>
                    <p className="text-gray-400 text-sm">{selectedOrder.customer_phone}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Shipping Address</p>
                    <p className="text-white">{selectedOrder.shipping_address}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Items</p>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                          <div>
                            <p className="text-white font-medium">{item.product_name}</p>
                            <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">₹{item.total.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between">
                      <p className="text-gray-400">Total Amount</p>
                      <p className="text-white font-bold text-lg">₹{selectedOrder.total_amount.toLocaleString()}</p>
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