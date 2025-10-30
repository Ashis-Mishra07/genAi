"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/hooks";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  DollarSign,
  Users,
  Download,
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
  const { t, currentLocale } = useTranslation();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = useCallback(async () => {
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
  }, []);

  // Helper function to apply translations to mock data
  const getTranslatedAnalyticsData = useCallback(() => {
    if (!analyticsData) return null;
    
    return {
      ...analyticsData,
      chartData: {
        ...analyticsData.chartData,
        labels: [t("mon"), t("tue"), t("wed"), t("thu"), t("fri"), t("sat"), t("sun")],
      },
      topProducts: analyticsData.topProducts.map((product, index) => ({
        ...product,
        name: index === 0 ? t("handwovenCeramicBowl") : 
              index === 1 ? t("traditionalPotteryVase") : 
              t("artisanJewelrySet")
      })),
      recentActivity: analyticsData.recentActivity.map((activity, index) => ({
        ...activity,
        customerName: index === 0 ? t("sarahJohnson") : 
                     index === 1 ? t("michaelChen") : 
                     t("emmaWilliams"),
        productName: index === 0 ? t("ceramicBowlSet") : 
                    index === 1 ? t("potteryVase") : 
                    t("customRing")
      }))
    };
  }, [analyticsData, t]);

  const translatedData = getTranslatedAnalyticsData();

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currentLocale === "hi" ? "hi-IN" : "en-US", {
      style: "currency",
      currency: currentLocale === "hi" ? "INR" : "USD",
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
      case "order":
        return <ShoppingCart className="h-4 w-4 text-green-400" />;
      case "view":
        return <Eye className="h-4 w-4 text-blue-400" />;
      case "inquiry":
        return <Users className="h-4 w-4 text-orange-400" />;
      default:
        return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p>
            {t("loadingAnalytics")}
          </p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {t("analyticsNotAvailable")}
          </h2>
          <button
            onClick={() => router.push("/artisan/dashboard")}
            className="text-orange-400 hover:text-orange-300">
            {t("returnToDashboard")}
          </button>
        </div>
      </div>
    );
  }

  if (!translatedData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-card border border-border rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/artisan/dashboard")}
              className="flex items-center text-muted-foreground hover:text-foreground transition-all duration-300 group">
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              {t("backToDashboard")}
            </button>
            
            <div className="flex items-center text-foreground">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mr-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {t("analytics")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("trackBusinessPerformance")}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-4 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300">
                <option value="7d">
                  {t("lastDays")}
                </option>
                <option value="30d">
                  {t("last30Days")}
                </option>
                <option value="90d">
                  {t("last90Days")}
                </option>
              </select>

              <button
                onClick={loadAnalytics}
                disabled={isRefreshing}
                className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow-md">
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {t("refresh")}
              </button>

              <button className="flex items-center px-4 py-2 bg-muted text-muted-foreground border border-border rounded-xl hover:bg-muted/80 hover:text-foreground transition-all duration-300">
                <Download className="h-4 w-4 mr-2" />
                {t("export")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("totalViews")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {translatedData.overview.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(analyticsData.overview.viewsChange)}
              <span
                className={`text-sm ml-1 ${getChangeColor(
                  analyticsData.overview.viewsChange
                )}`}>
                {Math.abs(analyticsData.overview.viewsChange)}%{" "}
                {t("vsLastPeriod")}
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">
                  {t("totalOrders")}
                </p>
                <p className="text-2xl font-bold text-white">
                  {analyticsData.overview.totalOrders}
                </p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <ShoppingCart className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(analyticsData.overview.ordersChange)}
              <span
                className={`text-sm ml-1 ${getChangeColor(
                  analyticsData.overview.ordersChange
                )}`}>
                {Math.abs(analyticsData.overview.ordersChange)}%{" "}
                {t("vsLastPeriod")}
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">
                  {t("totalRevenue")}
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(analyticsData.overview.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(analyticsData.overview.revenueChange)}
              <span
                className={`text-sm ml-1 ${getChangeColor(
                  analyticsData.overview.revenueChange
                )}`}>
                {Math.abs(analyticsData.overview.revenueChange)}%{" "}
                {t("vsLastPeriod")}
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">
                  {t("totalCustomers")}
                </p>
                <p className="text-2xl font-bold text-white">
                  {analyticsData.overview.totalCustomers}
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(analyticsData.overview.customersChange)}
              <span
                className={`text-sm ml-1 ${getChangeColor(
                  analyticsData.overview.customersChange
                )}`}>
                {Math.abs(analyticsData.overview.customersChange)}%{" "}
                {t("vsLastPeriod")}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              {t("performanceOverview")}
            </h3>
            <div className="h-80 flex items-center justify-center bg-white/5 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/70">
                  {t("chartVisualization")}
                </p>
                <p className="text-sm text-white/50">
                  {t("chartIntegration")}
                </p>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              {t("topPerformingProducts")}
            </h3>
            <div className="space-y-4">
              {translatedData.topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-medium mr-4">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{product.name}</h4>
                      <p className="text-sm text-white/70">
                        {product.views} {t("views")} •{" "}
                        {product.orders} {t("orders")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {formatCurrency(product.revenue)}
                    </p>
                    <p className="text-sm text-white/70">
                      {t("revenue")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            {t("recentActivity")}
          </h3>
          <div className="space-y-4">
            {translatedData.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 hover:bg-white/5 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className="p-2 bg-white/10 rounded-lg mr-4">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {activity.customerName}{" "}
                      {activity.type === "order"
                        ? t("ordered")
                        : activity.type === "view"
                        ? t("viewed")
                        : t("inquiredAbout")}{" "}
                      {activity.productName}
                    </p>
                    <p className="text-sm text-white/70">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {activity.amount && (
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {formatCurrency(activity.amount)}
                    </p>
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
