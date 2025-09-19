'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  Search,
  Filter,
  Eye,
  MoreHorizontal
} from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total_amount: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  CONFIRMED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  SHIPPED: { color: 'bg-purple-100 text-purple-800', icon: Truck },
  DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      // Simulate API call with sample data
      setTimeout(() => {
        setOrders([
          {
            id: 1,
            order_number: 'ORD-2024-001',
            status: 'CONFIRMED',
            total_amount: 2650,
            currency: 'INR',
            customer_name: 'Priya Sharma',
            customer_email: 'priya@example.com',
            shipping_address: '123 Main Street, Mumbai, Maharashtra 400001',
            items: [
              { id: 1, product_name: 'Handwoven Cotton Scarf', quantity: 2, price: 1250 },
              { id: 2, product_name: 'Silver Earrings', quantity: 1, price: 150 }
            ],
            created_at: '2024-01-20T10:30:00Z',
            updated_at: '2024-01-20T14:15:00Z'
          },
          {
            id: 2,
            order_number: 'ORD-2024-002',
            status: 'SHIPPED',
            total_amount: 850,
            currency: 'INR',
            customer_name: 'Rajesh Kumar',
            customer_email: 'rajesh@example.com',
            shipping_address: '456 Garden Road, Delhi, Delhi 110001',
            items: [
              { id: 3, product_name: 'Clay Pottery Bowl', quantity: 1, price: 850 }
            ],
            created_at: '2024-01-18T15:45:00Z',
            updated_at: '2024-01-19T09:20:00Z'
          },
          {
            id: 3,
            order_number: 'ORD-2024-003',
            status: 'PENDING',
            total_amount: 3200,
            currency: 'INR',
            customer_name: 'Anita Patel',
            customer_email: 'anita@example.com',
            shipping_address: '789 Heritage Lane, Ahmedabad, Gujarat 380001',
            items: [
              { id: 4, product_name: 'Handwoven Kashmiri Shawl', quantity: 1, price: 3200 }
            ],
            created_at: '2024-01-22T08:15:00Z',
            updated_at: '2024-01-22T08:15:00Z'
          }
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading orders:', error);
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      // In a real app, this would be an API call
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-orange-400">Orders</h1>
          <p className="text-gray-400">Manage customer orders and track fulfillment</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>Total Orders: {orders.length}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = orders.filter(order => order.status === status).length;
          const Icon = config.icon;
          return (
            <div key={status} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize">
                    {status.toLowerCase()}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <Icon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">All Statuses</option>
              {Object.keys(statusConfig).map(status => (
                <option key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Orders will appear here when customers make purchases'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const StatusIcon = statusConfig[order.status].icon;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.order_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items.length} item(s)
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {order.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{order.total_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <div className="relative">
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
