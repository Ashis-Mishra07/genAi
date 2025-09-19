'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users,
  MessageSquare,
  Sparkles,
  Plus,
  Eye
} from 'lucide-react';

// Dashboard stats component
function StatsCard({ title, value, icon: Icon, change, changeType }: {
  title: string;
  value: string;
  icon: React.ElementType;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}) {
  const changeColor = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400'
  }[changeType];

  return (
    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-orange-400">{value}</p>
        </div>
        <div className="h-12 w-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-orange-500" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium ${changeColor}`}>{change}</span>
        <span className="text-sm text-gray-500 ml-1">from last month</span>
      </div>
    </div>
  );
}

// Recent activity component
function RecentActivity() {
  const activities = [
    { id: 1, type: 'order', message: 'New order #1234 received', time: '2 minutes ago' },
    { id: 2, type: 'product', message: 'Product "Handwoven Scarf" updated', time: '1 hour ago' },
    { id: 3, type: 'chat', message: 'AI generated cultural story for pottery', time: '2 hours ago' },
    { id: 4, type: 'order', message: 'Order #1230 shipped', time: '5 hours ago' },
  ];

  return (
    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
      <h3 className="text-lg font-medium text-orange-400 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-orange-500/20 rounded-full flex items-center justify-center">
              {activity.type === 'order' && <ShoppingCart className="h-4 w-4 text-orange-500" />}
              {activity.type === 'product' && <Package className="h-4 w-4 text-orange-500" />}
              {activity.type === 'chat' && <MessageSquare className="h-4 w-4 text-orange-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300">{activity.message}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Quick actions component
function QuickActions() {
  return (
    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
      <h3 className="text-lg font-medium text-orange-400 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-gray-800 hover:border-orange-500 transition-colors">
          <Plus className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-300">Add Product</span>
        </button>
        <button className="flex items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-gray-800 hover:border-orange-500 transition-colors">
          <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-300">AI Assistant</span>
        </button>
        <button className="flex items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-gray-800 hover:border-orange-500 transition-colors">
          <Eye className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-300">View Orders</span>
        </button>
        <button className="flex items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-gray-800 hover:border-orange-500 transition-colors">
          <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-300">Analytics</span>
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: '0',
    totalOrders: '0',
    totalRevenue: '₹0',
    activeChats: '0'
  });

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalProducts: '12',
        totalOrders: '8',
        totalRevenue: '₹15,240',
        activeChats: '3'
      });
    }, 1000);
  }, []);

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg p-6 text-black">
        <div className="flex items-center space-x-3">
          <Sparkles className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Welcome to Your AI-Powered Marketplace</h1>
            <p className="text-orange-100 mt-1">
              Manage your artisan products with the help of AI for cultural storytelling, pricing, and marketing.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          change="+2 new"
          changeType="positive"
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          change="+3 today"
          changeType="positive"
        />
        <StatsCard
          title="Revenue"
          value={stats.totalRevenue}
          icon={TrendingUp}
          change="+12%"
          changeType="positive"
        />
        <StatsCard
          title="AI Interactions"
          value={stats.activeChats}
          icon={MessageSquare}
          change="5 today"
          changeType="neutral"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <QuickActions />
      </div>

      {/* AI Features Showcase */}
      <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
        <h3 className="text-lg font-medium text-orange-400 mb-4">AI-Powered Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
            <div className="h-10 w-10 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
              <MessageSquare className="h-5 w-5 text-orange-500" />
            </div>
            <h4 className="font-medium text-orange-400">Cultural Storytelling</h4>
            <p className="text-sm text-gray-400 mt-1">
              AI generates authentic cultural stories for your products
            </p>
          </div>
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
            <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-3">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <h4 className="font-medium text-orange-400">Smart Pricing</h4>
            <p className="text-sm text-gray-400 mt-1">
              Analyze market trends and suggest optimal pricing
            </p>
          </div>
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
            <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
              <Sparkles className="h-5 w-5 text-blue-400" />
            </div>
            <h4 className="font-medium text-orange-400">Voice Processing</h4>
            <p className="text-sm text-gray-400 mt-1">
              Multilingual voice input and translation support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
