'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  BarChart3,
  PieChart,
  Calendar,
  Download
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    total: number;
    change: number;
    trend: 'up' | 'down';
    monthly: { month: string; value: number; }[];
  };
  orders: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
  products: {
    total: number;
    topSelling: { name: string; sales: number; revenue: number; }[];
  };
  categories: {
    name: string;
    sales: number;
    percentage: number;
  }[];
  aiUsage: {
    storiesGenerated: number;
    imagesAnalyzed: number;
    voiceProcessed: number;
    pricingSuggestions: number;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      // Simulate API call with sample analytics data
      setTimeout(() => {
        setAnalytics({
          revenue: {
            total: 45280,
            change: 12.5,
            trend: 'up',
            monthly: [
              { month: 'Jan', value: 15200 },
              { month: 'Feb', value: 18600 },
              { month: 'Mar', value: 22100 },
              { month: 'Apr', value: 28400 },
              { month: 'May', value: 31200 },
              { month: 'Jun', value: 45280 }
            ]
          },
          orders: {
            total: 127,
            change: 8.3,
            trend: 'up'
          },
          products: {
            total: 24,
            topSelling: [
              { name: 'Handwoven Cotton Scarf', sales: 45, revenue: 56250 },
              { name: 'Clay Pottery Bowl', sales: 32, revenue: 27200 },
              { name: 'Silver Filigree Earrings', sales: 28, revenue: 22400 },
              { name: 'Kashmiri Shawl', sales: 15, revenue: 48000 },
              { name: 'Brass Lamp', sales: 12, revenue: 18000 }
            ]
          },
          categories: [
            { name: 'Textiles', sales: 89, percentage: 35 },
            { name: 'Pottery', sales: 56, percentage: 22 },
            { name: 'Jewelry', sales: 43, percentage: 17 },
            { name: 'Metalwork', sales: 38, percentage: 15 },
            { name: 'Woodwork', sales: 29, percentage: 11 }
          ],
          aiUsage: {
            storiesGenerated: 156,
            imagesAnalyzed: 89,
            voiceProcessed: 234,
            pricingSuggestions: 67
          }
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setIsLoading(false);
    }
  };

  if (isLoading || !analytics) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-orange-400">Analytics</h1>
          <p className="text-gray-400">Track your marketplace performance and AI usage</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-800 text-gray-300"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{analytics.revenue.total.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {analytics.revenue.trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ml-1 ${
              analytics.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.revenue.change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.orders.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600 ml-1">
              {analytics.orders.change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.products.total}</p>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Across 5 categories</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI Stories Generated</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.aiUsage.storiesGenerated}</p>
            </div>
            <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Cultural narratives</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="h-64 flex items-end space-x-2">
          {analytics.revenue.monthly.map((month, index) => {
            const maxValue = Math.max(...analytics.revenue.monthly.map(m => m.value));
            const height = (month.value / maxValue) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-t">
                  <div
                    className="bg-blue-600 rounded-t transition-all duration-500"
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{month.month}</span>
                <span className="text-xs font-medium text-gray-900">₹{(month.value / 1000).toFixed(0)}k</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            {analytics.products.topSelling.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₹{product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales by Category</h3>
          <div className="space-y-4">
            {analytics.categories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm text-gray-500">{category.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Usage Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">AI Tool Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="h-16 w-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.aiUsage.storiesGenerated}</p>
            <p className="text-sm text-gray-600">Stories Generated</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.aiUsage.imagesAnalyzed}</p>
            <p className="text-sm text-gray-600">Images Analyzed</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.aiUsage.voiceProcessed}</p>
            <p className="text-sm text-gray-600">Voice Messages</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.aiUsage.pricingSuggestions}</p>
            <p className="text-sm text-gray-600">Pricing Suggestions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
