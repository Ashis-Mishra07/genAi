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

// Dashboard stats component with Google-inspired design
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
    positive: "text-green-600 dark:text-green-400",
    negative: "text-red-600 dark:text-red-400", 
    neutral: "text-muted-foreground",
  }[changeType];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
          <div className="flex items-center text-xs">
            <span className={`font-semibold ${changeColor}`}>
              {change}
            </span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        </div>
        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

// Recent activity component with Google-inspired design
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
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <button className="text-primary hover:text-primary/80 text-sm font-medium">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              {activity.type === "order" && (
                <ShoppingCart className="h-4 w-4 text-primary" />
              )}
              {activity.type === "product" && (
                <Package className="h-4 w-4 text-primary" />
              )}
              {activity.type === "chat" && (
                <MessageSquare className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{activity.message}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Quick actions component with Google-inspired design
function QuickActions() {
  const actions = [
    { icon: Plus, label: "Add Product", href: "/dashboard/products/new" },
    { icon: MessageSquare, label: "AI Assistant", href: "/chatbot" },
    { icon: Eye, label: "View Orders", href: "/dashboard/orders" },
    { icon: TrendingUp, label: "Analytics", href: "/dashboard/analytics" },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className="flex flex-col items-center justify-center p-4 border border-border rounded-xl hover:bg-accent hover:border-primary/50 transition-all duration-200 group"
            >
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </button>
          );
        })}
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground">
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              Welcome to Your AI-Powered Marketplace
            </h1>
            <p className="text-primary-foreground/90 text-lg">
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
      <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">
            AI-Powered Features
          </h3>
          <div className="h-1 w-20 bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl hover:from-primary/10 hover:to-primary/20 transition-all duration-300 border border-primary/20 group">
            <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <MessageSquare className="h-7 w-7 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">
              Cultural Storytelling
            </h4>
            <p className="text-sm text-muted-foreground">
              AI generates authentic cultural stories for your products
            </p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-500/5 to-green-500/10 rounded-xl hover:from-green-500/10 hover:to-green-500/20 transition-all duration-300 border border-green-500/20 group">
            <div className="h-14 w-14 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/20 transition-colors">
              <TrendingUp className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Smart Pricing</h4>
            <p className="text-sm text-muted-foreground">
              Analyze market trends and suggest optimal pricing
            </p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/5 to-blue-500/10 rounded-xl hover:from-blue-500/10 hover:to-blue-500/20 transition-all duration-300 border border-blue-500/20 group">
            <div className="h-14 w-14 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 transition-colors">
              <Sparkles className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Voice Processing</h4>
            <p className="text-sm text-muted-foreground">
              Multilingual voice input and translation support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
