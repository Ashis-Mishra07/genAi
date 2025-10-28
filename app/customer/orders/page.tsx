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
              total: Number(order.total),
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
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter orders based on status and search term
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Calculate order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };
  const total = orders.reduce((sum, order) => sum + order.total, 0);
  const display = total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
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
                  {/*<span className="text-orange-400 font-medium">₹{orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</span>*/}

                  <span className="text-orange-400 font-medium">{display}</span>
                  <span className="text-slate-400 text-sm">Total Value</span>
                </div>
              </div>
            </div>

            {/* Order Statistics */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{orderStats.total}</div>
                <div className="text-slate-400 text-sm">Total Orders</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{orderStats.pending}</div>
                <div className="text-slate-400 text-sm">Pending</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{orderStats.shipped}</div>
                <div className="text-slate-400 text-sm">Shipped</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{orderStats.delivered}</div>
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
                    className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-80"
                  />
                </div>

                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 pr-10"
                  >
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
                        <div className="text-xl font-bold text-white">₹{order.total.toLocaleString()}</div>
                        <div className="text-slate-400 text-sm">{order.items.length} items</div>
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
                        <span>Expected: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="text-sm text-slate-300">
                            {item.name}
                            {index < Math.min(order.items.length - 1, 2) && ', '}
                          </div>
                        ))}
                        {order.items.length > 3 && (
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
                        className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors"
                      >
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedOrder.orderNumber}</h2>
                  <p className="text-slate-400">Order placed on {new Date(selectedOrder.date).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Order Status</h3>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedOrder.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Items ({selectedOrder.items.length})</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                      <div>
                        <h4 className="font-medium text-white">{item.name}</h4>
                        {item.artisanName && (
                          <p className="text-sm text-slate-400">by {item.artisanName}</p>
                        )}
                        <p className="text-sm text-slate-400">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">₹{(item.price * item.quantity).toLocaleString()}</div>
                        <div className="text-sm text-slate-400">₹{item.price.toLocaleString()} each</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Order Summary</h3>
                <div className="bg-slate-700 rounded p-4">
                  <div className="flex justify-between text-slate-300 mb-2">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 mb-2">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-slate-600 pt-2 mt-2">
                    <div className="flex justify-between text-white font-semibold text-lg">
                      <span>Total:</span>
                      <span>₹{selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
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
      )}
    </div>
  );
}
