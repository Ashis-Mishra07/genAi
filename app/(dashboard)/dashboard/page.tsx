"use client";

import { useState, useEffect } from "react";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  MessageSquare,
  Sparkles,
  Plus,
  Eye,
} from "lucide-react";

// Dashboard stats component
function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeType,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  change: string;
  changeType: "positive" | "negative" | "neutral";
}) {
  const changeColor = {
    positive: "text-green-400",
    negative: "text-red-400",
    neutral: "text-gray-400",
  }[changeType];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 shadow-xl backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-semibold ${changeColor}`}>
            {change}
          </span>
          <span className="text-sm text-gray-400 ml-2">from last month</span>
        </div>
      </div>
    </div>
  );
}

// Recent activity component
function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "order",
      message: "New order #1234 received",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "product",
      message: 'Product "Handwoven Scarf" updated',
      time: "1 hour ago",
    },
    {
      id: 3,
      type: "chat",
      message: "AI generated cultural story for pottery",
      time: "2 hours ago",
    },
    {
      id: 4,
      type: "order",
      message: "Order #1230 shipped",
      time: "5 hours ago",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 shadow-xl backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
      <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-orange-500/20 rounded-full flex items-center justify-center">
              {activity.type === "order" && (
                <ShoppingCart className="h-4 w-4 text-orange-500" />
              )}
              {activity.type === "product" && (
                <Package className="h-4 w-4 text-orange-500" />
              )}
              {activity.type === "chat" && (
                <MessageSquare className="h-4 w-4 text-orange-500" />
              )}
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
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 shadow-xl backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"></div>
      <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-gray-800 hover:border-orange-500 transition-colors">
          <Plus className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-300">Add Product</span>
        </button>
        <button className="flex items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-gray-800 hover:border-orange-500 transition-colors">
          <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-300">
            AI Assistant
          </span>
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
    totalProducts: "0",
    totalOrders: "0",
    totalRevenue: "₹0",
    activeChats: "0",
  });

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalProducts: "12",
        totalOrders: "8",
        totalRevenue: "₹15,240",
        activeChats: "3",
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
            <h1 className="text-2xl font-bold">
              Welcome to Your AI-Powered Marketplace
            </h1>
            <p className="text-orange-100 mt-1">
              Manage your artisan products with the help of AI for cultural
              storytelling, pricing, and marketing.
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
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 shadow-xl backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
        <h3 className="text-lg font-medium text-white mb-4">
          AI-Powered Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-lg hover:from-orange-500/20 hover:to-orange-600/10 transition-all duration-300 border border-orange-500/20 group">
            <div className="relative mb-3">
              <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto shadow-xl">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>
            <h4 className="font-medium text-white mb-2">
              Cultural Storytelling
            </h4>
            <p className="text-sm text-gray-400">
              AI generates authentic cultural stories for your products
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg hover:from-green-500/20 hover:to-green-600/10 transition-all duration-300 border border-green-500/20 group">
            <div className="relative mb-3">
              <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto shadow-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>
            <h4 className="font-medium text-white mb-2">Smart Pricing</h4>
            <p className="text-sm text-gray-400">
              Analyze market trends and suggest optimal pricing
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg hover:from-blue-500/20 hover:to-blue-600/10 transition-all duration-300 border border-blue-500/20 group">
            <div className="relative mb-3">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>
            <h4 className="font-medium text-white mb-2">Voice Processing</h4>
            <p className="text-sm text-gray-400">
              Multilingual voice input and translation support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
