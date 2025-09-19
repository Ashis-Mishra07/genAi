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
  id: number;
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
          icon: Clock,
        };
    }
  };

  const getStatusTopBarColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-gradient-to-r from-green-400 via-green-500 to-green-600";
      case "SHIPPED":
        return "bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600";
      case "CONFIRMED":
        return "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600";
      case "PENDING":
        return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600";
      case "CANCELLED":
        return "bg-gradient-to-r from-red-400 via-red-500 to-red-600";
      default:
        return "bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600";
    }
  };

  // Modal handler functions
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

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedOrder(null);
  };

  const confirmDelete = () => {
    if (selectedOrder) {
      setOrders(orders.filter((o) => o.id !== selectedOrder.id));
      closeModals();
    }
  };

  const updateOrderStatus = (orderId: number, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              updated_at: new Date().toISOString(),
            }
          : order
      )
    );
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      // Simulate API call with comprehensive dummy data
      setTimeout(() => {
        setOrders([
          {
            id: 1,
            order_number: "ORD-2024-001",
            status: "DELIVERED",
            total_amount: 15000.0,
            currency: "INR",
            customer_name: "Priya Sharma",
            customer_email: "priya.sharma@email.com",
            customer_phone: "+91-9876543210",
            shipping_address:
              "123 Heritage Lane, Vasant Vihar, New Delhi, Delhi 110057",
            delivery_date: "2024-01-20T14:30:00Z",
            tracking_number: "TRK1234567890",
            items: [
              {
                id: 1,
                product_name: "Handwoven Banarasi Silk Saree",
                product_image:
                  "https://images.unsplash.com/photo-1646282994816-a8078310f263?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8SGFuZHdvdmVuJTIwQmFuYXJhc2klMjBTaWxrJTIwU2FyZWV8ZW58MHx8MHx8fDA%3D",
                quantity: 1,
                price: 15000.0,
                total: 15000.0,
              },
            ],
            created_at: "2024-01-15T10:30:00Z",
            updated_at: "2024-01-20T14:30:00Z",
          },
          {
            id: 2,
            order_number: "ORD-2024-002",
            status: "SHIPPED",
            total_amount: 3500.0,
            currency: "INR",
            customer_name: "Rajesh Kumar",
            customer_email: "rajesh.kumar@craftworks.in",
            customer_phone: "+91-9876543211",
            shipping_address:
              "456 Craft Street, Bandra West, Mumbai, Maharashtra 400050",
            tracking_number: "TRK1234567891",
            items: [
              {
                id: 2,
                product_name: "Blue Pottery Dinner Set",
                product_image:
                  "https://images.unsplash.com/photo-1724709162118-60c05c4c3fcf?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fEJsdWUlMjBQb3R0ZXJ5JTIwRGlubmVyJTIwU2V0fGVufDB8fDB8fHww",
                quantity: 1,
                price: 3500.0,
                total: 3500.0,
              },
            ],
            created_at: "2024-01-18T15:45:00Z",
            updated_at: "2024-01-19T09:20:00Z",
          },
          {
            id: 3,
            order_number: "ORD-2024-003",
            status: "CONFIRMED",
            total_amount: 8500.0,
            currency: "INR",
            customer_name: "Meera Patel",
            customer_email: "meera.patel@handicrafts.in",
            customer_phone: "+91-9876543212",
            shipping_address:
              "789 Artisan Colony, CG Road, Ahmedabad, Gujarat 380009",
            items: [
              {
                id: 3,
                product_name: "Kundan Meenakari Necklace",
                product_image:
                  "https://images.unsplash.com/photo-1665680707488-e7939a4a0af8?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8S3VuZGFuJTIwTWVlbmFrYXJpJTIwTmVja2xhY2V8ZW58MHx8MHx8fDA%3D",
                quantity: 1,
                price: 8500.0,
                total: 8500.0,
              },
            ],
            created_at: "2024-01-20T09:15:00Z",
            updated_at: "2024-01-20T11:30:00Z",
          },
          {
            id: 4,
            order_number: "ORD-2024-004",
            status: "PENDING",
            total_amount: 2800.0,
            currency: "INR",
            customer_name: "Arjun Singh",
            customer_email: "arjun.singh@pottery.in",
            customer_phone: "+91-9876543213",
            shipping_address:
              "321 Temple Road, Koramangala, Bangalore, Karnataka 560034",
            items: [
              {
                id: 4,
                product_name: "Sandalwood Carved Lord Ganesha",
                product_image:
                  "https://plus.unsplash.com/premium_photo-1721001474738-a185f420308f?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8U2FuZGFsd29vZCUyMENhcnZlZCUyMExvcmQlMjBHYW5lc2hhfGVufDB8fDB8fHww",
                quantity: 1,
                price: 2800.0,
                total: 2800.0,
              },
            ],
            created_at: "2024-01-22T11:20:00Z",
            updated_at: "2024-01-22T11:20:00Z",
          },
          {
            id: 5,
            order_number: "ORD-2024-005",
            status: "CANCELLED",
            total_amount: 1200.0,
            currency: "INR",
            customer_name: "Lakshmi Reddy",
            customer_email: "lakshmi.reddy@textiles.in",
            customer_phone: "+91-9876543214",
            shipping_address:
              "654 Culture Avenue, T. Nagar, Chennai, Tamil Nadu 600017",
            items: [
              {
                id: 5,
                product_name: "Brass Tanjore Plate Set",
                product_image:
                  "https://images.unsplash.com/photo-1652960018678-1f19799996c5?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fEJyYXNzJTIwVGFuam9yZSUyMFBsYXRlJTIwU2V0fGVufDB8fDB8fHww",
                quantity: 1,
                price: 1200.0,
                total: 1200.0,
              },
            ],
            created_at: "2024-01-25T16:30:00Z",
            updated_at: "2024-01-26T10:15:00Z",
          },
          {
            id: 6,
            order_number: "ORD-2024-006",
            status: "DELIVERED",
            total_amount: 5300.0,
            currency: "INR",
            customer_name: "Anita Mehta",
            customer_email: "anita.mehta@boutique.in",
            customer_phone: "+91-9988776655",
            shipping_address:
              "567 Fashion Street, Linking Road, Mumbai, Maharashtra 400050",
            delivery_date: "2024-01-30T16:45:00Z",
            tracking_number: "TRK1234567892",
            items: [
              {
                id: 6,
                product_name: "Blue Pottery Dinner Set",
                quantity: 1,
                price: 3500.0,
                total: 3500.0,
              },
              {
                id: 7,
                product_name: "Brass Tanjore Plate Set",
                quantity: 1,
                price: 1200.0,
                total: 1200.0,
              },
              {
                id: 8,
                product_name: "Handicraft Bundle",
                quantity: 1,
                price: 600.0,
                total: 600.0,
              },
            ],
            created_at: "2024-01-28T09:00:00Z",
            updated_at: "2024-01-30T16:45:00Z",
          },
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading orders:", error);
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

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
          <p className="mt-2 text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
            Orders Management
          </h1>
          <p className="text-gray-400 text-lg">
            Track and manage customer orders
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-orange-400 to-transparent rounded-full"></div>
        </div>
        <div className="text-sm text-gray-400">
          Total Orders: {orders.length}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map(
          (status) => {
            const count = orders.filter(
              (order) => order.status === status
            ).length;
            const config = getStatusConfig(status);
            const Icon = config.icon;
            return (
              <div
                key={status}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-xl p-4 hover:border-orange-500/50 transition-all duration-300 shadow-xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm capitalize">
                      {status.toLowerCase()}
                    </p>
                    <p className="text-white text-2xl font-bold">{count}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-xl p-4 mb-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, customers, emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white appearance-none min-w-[150px]">
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-xl p-12 text-center shadow-xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600"></div>
          <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            No orders found
          </h3>
          <p className="text-gray-400">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Orders will appear here when customers make purchases"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const topBarColor = getStatusTopBarColor(order.status);

            return (
              <div
                key={order.id}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 cursor-pointer shadow-xl backdrop-blur-sm relative overflow-hidden"
                onClick={() => handleViewOrder(order)}>
                <div
                  className={`absolute top-0 left-0 w-full h-1 ${topBarColor}`}></div>
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {order.order_number}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {order.status.toLowerCase()}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="flex items-center mb-4">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-white font-medium">
                      {order.customer_name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {order.customer_email}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <div className="flex items-center text-gray-400 text-sm mb-2">
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    {order.items.length} item(s)
                  </div>
                  {order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="text-sm text-gray-300 truncate">
                      {item.quantity}x {item.product_name}
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="text-sm text-gray-400">
                      +{order.items.length - 2} more items
                    </div>
                  )}
                </div>

                {/* Total Amount */}
                <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                  <div className="flex items-center text-green-400 font-semibold">
                    {renderCurrencyIcon(order.currency)}
                    <span className="ml-1">
                      {order.total_amount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewOrder(order);
                      }}
                      className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 p-2">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditOrder(order);
                      }}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-2">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteOrder(order);
                      }}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Tracking Info */}
                {order.tracking_number && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="flex items-center text-sm text-gray-400">
                      <Truck className="h-4 w-4 mr-2" />
                      Tracking: {order.tracking_number}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">
                Order Details
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModals}
                className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-3">
                  Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Order Number</p>
                    <p className="text-white font-medium">
                      {selectedOrder.order_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                        getStatusConfig(selectedOrder.status).color
                      }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400">Order Date</p>
                    <p className="text-white">
                      {new Date(selectedOrder.created_at).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Last Updated</p>
                    <p className="text-white">
                      {new Date(selectedOrder.updated_at).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                  {selectedOrder.tracking_number && (
                    <div className="col-span-2">
                      <p className="text-gray-400">Tracking Number</p>
                      <p className="text-white font-medium">
                        {selectedOrder.tracking_number}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-3">
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-white">
                      {selectedOrder.customer_name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-6">Email:</span>
                    <span className="text-white">
                      {selectedOrder.customer_email}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-6">Phone:</span>
                    <span className="text-white">
                      {selectedOrder.customer_phone}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <span className="text-white">
                      {selectedOrder.shipping_address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-3">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-12 h-12 rounded-lg object-cover mr-3"
                          />
                        )}
                        <div>
                          <p className="text-white font-medium">
                            {item.product_name}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium flex items-center">
                          {renderCurrencyIcon(selectedOrder.currency)}
                          <span className="ml-1">
                            {item.price.toLocaleString("en-IN")}
                          </span>
                        </p>
                        <p className="text-gray-400 text-sm flex items-center">
                          {renderCurrencyIcon(selectedOrder.currency)}
                          {item.total.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-800 pt-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span className="text-white">Total Amount:</span>
                  <span className="text-green-400 flex items-center">
                    {renderCurrencyIcon(selectedOrder.currency)}
                    <span className="ml-1">
                      {selectedOrder.total_amount.toLocaleString("en-IN")}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">
                Update Order Status
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModals}
                className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-400 mb-2">
                  Order: {selectedOrder.order_number}
                </p>
                <p className="text-white mb-4">
                  Customer: {selectedOrder.customer_name}
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "PENDING",
                  "CONFIRMED",
                  "SHIPPED",
                  "DELIVERED",
                  "CANCELLED",
                ].map((status) => {
                  const config = getStatusConfig(status);
                  const StatusIcon = config.icon;
                  return (
                    <button
                      key={status}
                      onClick={() => {
                        updateOrderStatus(
                          selectedOrder.id,
                          status as Order["status"]
                        );
                        closeModals();
                      }}
                      className={`w-full flex items-center p-3 rounded-lg border transition-colors ${
                        selectedOrder.status === status
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-gray-700 hover:border-gray-600 bg-gray-800"
                      }`}>
                      <StatusIcon className="h-5 w-5 mr-3 text-orange-400" />
                      <span className="text-white font-medium">{status}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20">
                  <Trash2 className="h-6 w-6 text-red-400" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium text-white mb-2">
                  Delete Order
                </h3>
                <p className="text-gray-400 mb-6">
                  Are you sure you want to delete order{" "}
                  <span className="font-medium text-white">
                    {selectedOrder.order_number}
                  </span>
                  ? This action cannot be undone.
                </p>

                <div className="flex space-x-3">
                  <Button
                    variant="ghost"
                    onClick={closeModals}
                    className="flex-1 text-gray-400 hover:text-white hover:bg-gray-800">
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                    Delete Order
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
