"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    viewsChange: number;
    ordersChange: number;
    revenueChange: number;
    customersChange: number;
  };
  chartData: {
    labels: string[];
    views: number[];
    orders: number[];
    revenue: number[];
  };
  topProducts: {
    id: string;
    name: string;
    views: number;
    orders: number;
    revenue: number;
    image: string;
  }[];
  recentActivity: {
    id: string;
    type: "view" | "order" | "inquiry";
    customerName: string;
    productName: string;
    timestamp: string;
    amount?: number;
  }[];
}

export default function ArtisanAnalyticsPage() {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    try {
      setIsRefreshing(true);
      
      // TODO: Replace with actual API call
      const mockData: AnalyticsData = {
        overview: {
          totalViews: 1247,
          totalOrders: 23,
          totalRevenue: 3450,
          totalCustomers: 18,
          viewsChange: 12.5,
          ordersChange: -2.3,
          revenueChange: 8.7,
          customersChange: 15.2,
        },
        chartData: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          views: [120, 150, 180, 220, 190, 250, 200],
          orders: [2, 4, 3, 6, 4, 7, 5],
          revenue: [150, 240, 180, 320, 280, 450, 350],
        },
        topProducts: [
          {
            id: "1",
            name: "Handwoven Ceramic Bowl",
            views: 245,
            orders: 8,
            revenue: 480,
            image: "/placeholder-product.jpg",
          },
          {
            id: "2",
            name: "Traditional Pottery Vase",
            views: 189,
            orders: 5,
            revenue: 375,
            image: "/placeholder-product.jpg",
          },
          {
            id: "3",
            name: "Artisan Jewelry Set",
            views: 156,
            orders: 4,
            revenue: 320,
            image: "/placeholder-product.jpg",
          },
        ],
        recentActivity: [
          {
            id: "1",
            type: "order",
            customerName: "Sarah Johnson",
            productName: "Ceramic Bowl Set",
            timestamp: "2024-01-15T10:30:00Z",
            amount: 85,
          },
          {
            id: "2",
            type: "view",
            customerName: "Michael Chen",
            productName: "Pottery Vase",
            timestamp: "2024-01-15T09:45:00Z",
          },
          {
            id: "3",
            type: "inquiry",
            customerName: "Emma Williams",
            productName: "Custom Ring",
            timestamp: "2024-01-15T08:20:00Z",
          },
        ],
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-400";
    if (change < 0) return "text-red-400";
    return "text-white/60";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order": return <ShoppingCart className="h-4 w-4 text-green-400" />;
      case "view": return <Eye className="h-4 w-4 text-blue-400" />;
      case "inquiry": return <Users className="h-4 w-4 text-orange-400" />;
      default: return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Analytics Not Available</h2>
          <button
            onClick={() => router.push("/artisan/dashboard")}
            className="text-orange-400 hover:text-orange-300">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/artisan/dashboard")}
            className="flex items-center text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center text-white">
            <BarChart3 className="h-6 w-6 mr-2" />
            <div>
              <span className="text-xl font-bold">Analytics</span>
              <p className="text-sm text-white/70">Track your business performance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
              <option value="7d" className="bg-slate-800">Last 7 days</option>
              <option value="30d" className="bg-slate-800">Last 30 days</option>
              <option value="90d" className="bg-slate-800">Last 90 days</option>
            </select>
            
            <button
              onClick={loadAnalytics}
              disabled={isRefreshing}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg disabled:opacity-50 transition-all duration-200">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button className="flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/90 hover:bg-white/20 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Total Views</p>
                <p className="text-2xl font-bold text-white">{analyticsData.overview.totalViews.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(analyticsData.overview.viewsChange)}
              <span className={`text-sm ml-1 ${getChangeColor(analyticsData.overview.viewsChange)}`}>
                {Math.abs(analyticsData.overview.viewsChange)}% vs last period
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Total Orders</p>
                <p className="text-2xl font-bold text-white">{analyticsData.overview.totalOrders}</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <ShoppingCart className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(analyticsData.overview.ordersChange)}
              <span className={`text-sm ml-1 ${getChangeColor(analyticsData.overview.ordersChange)}`}>
                {Math.abs(analyticsData.overview.ordersChange)}% vs last period
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Total Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(analyticsData.overview.revenueChange)}
              <span className={`text-sm ml-1 ${getChangeColor(analyticsData.overview.revenueChange)}`}>
                {Math.abs(analyticsData.overview.revenueChange)}% vs last period
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Total Customers</p>
                <p className="text-2xl font-bold text-white">{analyticsData.overview.totalCustomers}</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(analyticsData.overview.customersChange)}
              <span className={`text-sm ml-1 ${getChangeColor(analyticsData.overview.customersChange)}`}>
                {Math.abs(analyticsData.overview.customersChange)}% vs last period
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Performance Overview</h3>
            <div className="h-80 flex items-center justify-center bg-white/5 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/70">Chart visualization would go here</p>
                <p className="text-sm text-white/50">Integration with Chart.js or similar library</p>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Top Performing Products</h3>
            <div className="space-y-4">
              {analyticsData.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-medium mr-4">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{product.name}</h4>
                      <p className="text-sm text-white/70">{product.views} views • {product.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatCurrency(product.revenue)}</p>
                    <p className="text-sm text-white/70">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {analyticsData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className="p-2 bg-white/10 rounded-lg mr-4">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {activity.customerName} {activity.type === "order" ? "ordered" : activity.type === "view" ? "viewed" : "inquired about"} {activity.productName}
                    </p>
                    <p className="text-sm text-white/70">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {activity.amount && (
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatCurrency(activity.amount)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
