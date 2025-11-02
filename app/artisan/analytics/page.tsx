"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDynamicTranslation } from "@/lib/i18n/useDynamicTranslation";
import { GoogleLoaderWithText } from "@/components/ui/google-loader";
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
  const { t, translateBatch, currentLocale, isTranslating } =
    useDynamicTranslation();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    translateBatch([
      "Analytics Dashboard",
      "View your performance metrics and insights",
      "Total Views",
      "Total Orders",
      "Total Revenue",
      "Total Customers",
      "Performance Overview",
      "Monthly performance analytics",
      "Top Performing Products",
      "Recent Activity",
      "Views",
      "Orders",
      "Revenue",
      "Customers",
      "Last 7 Days",
      "Last 30 Days",
      "Last 90 Days",
      "Refresh",
      "Export Data",
      "vs last period",
      "views",
      "orders",
      "revenue",
      "Loading analytics...",
      "Product",
      "viewed",
      "ordered",
      "inquired about",
    ]);
  }, [currentLocale, translateBatch]);

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
        labels: [
          t("mon"),
          t("tue"),
          t("wed"),
          t("thu"),
          t("fri"),
          t("sat"),
          t("sun"),
        ],
      },
      topProducts: analyticsData.topProducts.map((product, index) => ({
        ...product,
        name:
          index === 0
            ? t("handwovenCeramicBowl")
            : index === 1
            ? t("traditionalPotteryVase")
            : t("artisanJewelrySet"),
      })),
      recentActivity: analyticsData.recentActivity.map((activity, index) => ({
        ...activity,
        customerName:
          index === 0
            ? t("sarahJohnson")
            : index === 1
            ? t("michaelChen")
            : t("emmaWilliams"),
        productName:
          index === 0
            ? t("ceramicBowlSet")
            : index === 1
            ? t("potteryVase")
            : t("customRing"),
      })),
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
      return <TrendingUp className="h-4 w-4 text-primary" />;
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-muted-foreground" />;
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
        return <ShoppingCart className="h-4 w-4 text-primary" />;
      case "view":
        return <Eye className="h-4 w-4 text-primary" />;
      case "inquiry":
        return <Users className="h-4 w-4 text-primary" />;
      default:
        return <Eye className="h-4 w-4 text-primary" />;
    }
  };

  if (isLoading || isTranslating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GoogleLoaderWithText size="xl" text={t("Loading analytics...")} />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("analyticsNotAvailable")}
          </h2>
          <button
            onClick={() => router.push("/artisan/dashboard")}
            className="text-primary hover:text-primary/80">
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
    <div className="p-6 space-y-4 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">
            {t("Analytics Dashboard")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("View your performance metrics and insights")}
          </p>
          <div className="h-1 w-32 bg-primary rounded-full"></div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground shadow-lg">
            <option value="7d">{t("Last 7 Days")}</option>
            <option value="30d">{t("Last 30 Days")}</option>
            <option value="90d">{t("Last 90 Days")}</option>
          </select>

          <button
            onClick={loadAnalytics}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:transform-none">
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{t("Refresh")}</span>
          </button>

          <button className="flex items-center space-x-2 px-6 py-3 bg-secondary border border-border rounded-lg text-secondary-foreground hover:bg-secondary/80 transition-all duration-300 shadow-lg">
            <Download className="h-4 w-4" />
            <span>{t("Export Data")}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("Total Views")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {translatedData.overview.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(analyticsData.overview.viewsChange)}
              <span className="text-sm font-medium text-primary ml-2">
                {Math.abs(analyticsData.overview.viewsChange)}%
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                {t("vs last period")}
              </span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("Total Orders")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsData.overview.totalOrders}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(analyticsData.overview.ordersChange)}
              <span className="text-sm font-medium text-primary ml-2">
                {Math.abs(analyticsData.overview.ordersChange)}%
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                {t("vs last period")}
              </span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("Total Revenue")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(analyticsData.overview.totalRevenue)}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(analyticsData.overview.revenueChange)}
              <span className="text-sm font-medium text-primary ml-2">
                {Math.abs(analyticsData.overview.revenueChange)}%
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                {t("vs last period")}
              </span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("Total Customers")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsData.overview.totalCustomers}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(analyticsData.overview.customersChange)}
              <span className="text-sm font-medium text-primary ml-2">
                {Math.abs(analyticsData.overview.customersChange)}%
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                {t("vs last period")}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Overview Chart */}
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("Performance Overview")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("Monthly performance analytics")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-muted rounded-lg px-3 py-2">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-primary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">
                      {t("Views")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-primary/50 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">
                      {t("Orders")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simple Performance Graph */}
            <div className="relative h-64 bg-muted/50 rounded-lg p-4">
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-20">
                {/* Grid lines */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="col-span-6 border-t border-border/30"
                    style={{ gridRow: i + 1 }}
                  />
                ))}
                {[...Array(7)].map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="row-span-4 border-l border-border/30"
                    style={{ gridColumn: i + 1 }}
                  />
                ))}
              </div>

              {/* Chart representation */}
              <div className="relative h-full flex items-end justify-between px-4">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(
                  (month, index) => (
                    <div key={month} className="flex flex-col items-center">
                      <div className="flex space-x-1 mb-2">
                        <div
                          className="w-3 bg-primary rounded-t-sm"
                          style={{ height: `${Math.random() * 120 + 40}px` }}
                        />
                        <div
                          className="w-3 bg-primary/50 rounded-t-sm"
                          style={{ height: `${Math.random() * 80 + 20}px` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {month}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              {t("Top Performing Products")}
            </h3>
            <div className="space-y-4">
              {translatedData.topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50 hover:bg-muted/70 transition-colors">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-medium mr-4">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {product.views} {t("views")} • {product.orders}{" "}
                        {t("orders")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {formatCurrency(product.revenue)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("revenue")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            {t("Recent Activity")}
          </h3>
          <div className="space-y-4">
            {translatedData.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors border border-border/50">
                <div className="flex items-center">
                  <div className="p-2 bg-primary/10 rounded-lg mr-4">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {activity.customerName}{" "}
                      {activity.type === "order"
                        ? t("ordered")
                        : activity.type === "view"
                        ? t("viewed")
                        : t("inquired about")}{" "}
                      {activity.productName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {activity.amount && (
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
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
