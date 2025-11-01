'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, Truck, CheckCircle, Clock, Eye, Star, MapPin, Calendar,
  Filter, Search, ChevronDown, X
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
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
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch actual orders from database
  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      try {
        // First check if user is authenticated
        console.log('Checking authentication...');
        const authResponse = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!authResponse.ok) {
          console.log('User not authenticated, redirecting to login...');
          router.push('/auth/customer');
          return;
        }

        const authData = await authResponse.json();
        console.log('User authenticated:', authData.user.email);

        // Now fetch orders
        console.log('Fetching orders from API...');
        const response = await fetch('/api/orders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);
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
                name: 'Customer',
                address: 'Address not available',
                city: 'City',
                state: 'State',
                pincode: '000000',
                phone: 'Phone not available'
              },
              trackingNumber: order.trackingNumber
            }));

            setOrders(formattedOrders);
            console.log('Formatted orders:', formattedOrders);
          } else {
            console.error('API response error:', data.error || 'No orders data');
            console.log('Full response data:', data);
            setOrders([]);
          }
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch orders:', response.status, errorText);
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchOrders();
  }, [router]);

  // Remove all dummy data - orders are now fetched from database

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-400" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-400" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'cancelled':
        return <X className="h-5 w-5 text-red-400" />;
      default:
        return <Package className="h-5 w-5 text-slate-400" />;
    }
  };

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
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length
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
            <h2 className="text-2xl font-bold text-white mb-4">No Orders Found</h2>
            <p className="text-slate-400 mb-8">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/customer/products')}
                className="w-full bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Start Shopping
              </button>
              <button
                onClick={() => router.push('/auth/customer')}
                className="w-full bg-slate-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-600 transition-colors"
              >
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
              <div className="text-right">
                <p className="text-sm font-medium text-white">₹{orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</p>
                <p className="text-xs text-slate-400">Total Value</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-white">{orderStats.total}</p>
              </div>
              <Package className="h-8 w-8 text-slate-400" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{orderStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Shipped</p>
                <p className="text-2xl font-bold text-purple-400">{orderStats.shipped}</p>
              </div>
              <Truck className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Delivered</p>
                <p className="text-2xl font-bold text-green-400">{orderStats.delivered}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search orders or products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-24 w-24 text-slate-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">No orders found</h2>
            <p className="text-slate-400 mb-8">
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet" 
                : `No ${filterStatus} orders found`}
            </p>
            <button
              onClick={() => router.push('/customer/products')}
              className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-orange-500/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-semibold text-white">{order.orderNumber}</h3>
                        <p className="text-slate-400 text-sm">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-white">₹{order.total.toLocaleString()}</p>
                    <p className="text-slate-400 text-sm">{order.items.length} items</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-slate-400">
                      {order.estimatedDelivery && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Expected: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    {order.trackingNumber && (
                      <div className="text-sm text-slate-400">
                        <span>Tracking: {order.trackingNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="flex items-center space-x-2 text-orange-500 hover:text-orange-400 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="mt-4 border-t border-slate-700 pt-4">
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
                            <Package className="h-4 w-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-white">{item.name}</p>
                            <p className="text-slate-400">by {item.artisanName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white">Qty: {item.quantity}</p>
                          <p className="text-slate-400">₹{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-slate-400 text-sm">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Order Details</h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Order Number</p>
                      <p className="text-white font-medium">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Status</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-400">Order Date</p>
                      <p className="text-white">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Total Amount</p>
                      <p className="text-white font-bold">₹{selectedOrder.total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-slate-600 rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{item.name}</p>
                            <p className="text-slate-400 text-sm">by {item.artisanName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white">Qty: {item.quantity}</p>
                          <p className="text-slate-400">₹{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Shipping Address</h3>
                  <div className="p-3 bg-slate-700 rounded">
                    <p className="text-white font-medium">{selectedOrder.shippingAddress.name}</p>
                    <p className="text-slate-400">{selectedOrder.shippingAddress.address}</p>
                    <p className="text-slate-400">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}
                    </p>
                    <p className="text-slate-400">{selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
