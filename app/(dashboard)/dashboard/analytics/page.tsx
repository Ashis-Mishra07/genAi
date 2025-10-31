"use client";

import { useState, useEffect } from "react";
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
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { GoogleLoaderWithText } from '@/components/ui/google-loader';

interface AnalyticsData {
  revenue: {
    total: number;
    change: number;
    trend: "up" | "down";
    monthly: {
      month: string;
      actual: number;
      estimated: number;
    }[];
  };
  orders: {
    total: number;
    change: number;
    trend: "up" | "down";
  };
  products: {
    total: number;
    topSelling: { name: string; sales: number; revenue: number }[];
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
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [currentProductsPage, setCurrentProductsPage] = useState(1);
  const [currentCategoriesPage, setCurrentCategoriesPage] = useState(1);
  const itemsPerPage = 3;

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
            trend: "up",
            monthly: [
              { month: "Jan", actual: 15200, estimated: 18000 },
              { month: "Feb", actual: 18600, estimated: 20500 },
              { month: "Mar", actual: 22100, estimated: 24000 },
              { month: "Apr", actual: 28400, estimated: 30000 },
              { month: "May", actual: 31200, estimated: 33500 },
              { month: "Jun", actual: 45280, estimated: 42000 },
            ],
          },
          orders: {
            total: 127,
            change: 8.3,
            trend: "up",
          },
          products: {
            total: 24,
            topSelling: [
              { name: "Handwoven Cotton Scarf", sales: 45, revenue: 56250 },
              { name: "Clay Pottery Bowl", sales: 32, revenue: 27200 },
              { name: "Silver Filigree Earrings", sales: 28, revenue: 22400 },
              { name: "Kashmiri Shawl", sales: 15, revenue: 48000 },
              { name: "Brass Lamp", sales: 12, revenue: 18000 },
            ],
          },
          categories: [
            { name: "Textiles", sales: 89, percentage: 35 },
            { name: "Pottery", sales: 56, percentage: 22 },
            { name: "Jewelry", sales: 43, percentage: 17 },
            { name: "Metalwork", sales: 38, percentage: 15 },
            { name: "Woodwork", sales: 29, percentage: 11 },
          ],
          aiUsage: {
            storiesGenerated: 156,
            imagesAnalyzed: 89,
            voiceProcessed: 234,
            pricingSuggestions: 67,
          },
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setIsLoading(false);
    }
  };

  if (isLoading || !analytics) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <GoogleLoaderWithText size="lg" text="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your marketplace performance and AI usage
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground shadow-sm">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-foreground">
                ₹{analytics.revenue.total.toLocaleString()}
              </p>
            </div>
            <div className="h-14 w-14 bg-green-500/10 rounded-xl flex items-center justify-center">
              <DollarSign className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {analytics.revenue.trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <span
              className={`text-sm font-semibold ml-2 ${
                analytics.revenue.trend === "up"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
              {analytics.revenue.change}%
            </span>
            <span className="text-sm text-muted-foreground ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Total Orders
              </p>
              <p className="text-3xl font-bold text-foreground">
                {analytics.orders.total}
              </p>
            </div>
            <div className="h-14 w-14 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <ShoppingCart className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold text-green-600 dark:text-green-400 ml-2">
              {analytics.orders.change}%
            </span>
            <span className="text-sm text-muted-foreground ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Active Products
              </p>
              <p className="text-3xl font-bold text-foreground">
                {analytics.products.total}
              </p>
            </div>
            <div className="h-14 w-14 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Package className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Across 5 categories
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                AI Stories Generated
              </p>
              <p className="text-3xl font-bold text-foreground">
                {analytics.aiUsage.storiesGenerated}
              </p>
            </div>
            <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Cultural narratives
            </span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Revenue Trend
              </h3>
              <p className="text-sm text-muted-foreground">
                Monthly performance overview
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-muted rounded-xl px-4 py-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Actual</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Estimated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graph Container with Grid */}
        <div className="relative">
          {/* Background Grid */}
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-20">
            {/* Horizontal grid lines */}
            {[...Array(7)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="col-span-12 border-t border-gray-600/30"
                style={{ gridRow: i + 1 }}
              />
            ))}
            {/* Vertical grid lines */}
            {[...Array(13)].map((_, i) => (
              <div
                key={`v-${i}`}
                className="row-span-6 border-l border-gray-600/30"
                style={{ gridColumn: i + 1 }}
              />
            ))}
          </div>

          {/* Chart Area */}
          <div className="relative">
            {/* Chart Bars */}
            <div className="h-64 flex items-end justify-between px-8 py-4">
              {analytics.revenue.monthly.map((month, index) => {
                const maxValue = Math.max(
                  ...analytics.revenue.monthly.flatMap((m) => [
                    m.actual,
                    m.estimated,
                  ])
                );
                const actualHeight = (month.actual / maxValue) * 200; // Reduced height for space
                const estimatedHeight = (month.estimated / maxValue) * 200; // Reduced height for space

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center group cursor-pointer flex-1 max-w-[120px]">
                    {/* Bars Container */}
                    <div
                      className="relative flex flex-col-reverse items-center"
                      style={{ height: "200px" }}>
                      <div className="flex items-end justify-center space-x-2 w-full">
                        {/* Actual Revenue Bar */}
                        <div
                          className="w-6 bg-primary rounded-t-lg transition-all duration-700 ease-out hover:opacity-80 relative overflow-hidden"
                          style={{
                            height: `${actualHeight}px`,
                          }}>
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-y-12"></div>
                        </div>

                        {/* Estimated Revenue Bar */}
                        <div
                          className="w-6 bg-blue-500 rounded-t-lg transition-all duration-700 ease-out hover:opacity-80 relative overflow-hidden"
                          style={{
                            height: `${estimatedHeight}px`,
                          }}>
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-y-12"></div>
                        </div>
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                        <div className="bg-popover border border-border text-popover-foreground px-4 py-3 rounded-xl text-sm whitespace-nowrap shadow-lg">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 bg-primary rounded-full"></div>
                              <span className="text-foreground">
                                Actual: ₹{month.actual.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                              <span className="text-foreground">
                                Estimated: ₹{month.estimated.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-center text-muted-foreground text-xs mt-2 pt-2 border-t border-border">
                              {month.month}
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Labels Section - Separate from chart */}
            <div className="flex items-center justify-between px-8 pt-2">
              {analytics.revenue.monthly.map((month, index) => (
                <div key={index} className="flex-1 max-w-[120px] text-center">
                  <span className="text-sm text-muted-foreground block font-medium">
                    {month.month}
                  </span>
                  <div className="flex items-center justify-center space-x-2 mt-1">
                    <span className="text-xs font-semibold text-primary bg-muted px-2 py-1 rounded-lg">
                      ₹{(month.actual / 1000).toFixed(0)}k
                    </span>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-muted px-2 py-1 rounded-lg">
                      ₹{(month.estimated / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-64 flex flex-col justify-between py-4">
            {[...Array(6)].map((_, i) => {
              const maxValue = Math.max(
                ...analytics.revenue.monthly.flatMap((m) => [
                  m.actual,
                  m.estimated,
                ])
              );
              const value = (maxValue / 5) * (5 - i);
              return (
                <div
                  key={i}
                  className="text-sm text-muted-foreground -ml-2 bg-muted px-2 py-1 rounded">
                  {(value / 1000).toFixed(0)}k
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Top Selling Products
                </h3>
                <p className="text-sm text-muted-foreground">Best performing items</p>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  setCurrentProductsPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentProductsPage === 1}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                {currentProductsPage}/
                {Math.ceil(analytics.products.topSelling.length / itemsPerPage)}
              </span>
              <button
                onClick={() =>
                  setCurrentProductsPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(
                        analytics.products.topSelling.length / itemsPerPage
                      )
                    )
                  )
                }
                disabled={
                  currentProductsPage >=
                  Math.ceil(analytics.products.topSelling.length / itemsPerPage)
                }
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.products.topSelling
              .slice(
                (currentProductsPage - 1) * itemsPerPage,
                currentProductsPage * itemsPerPage
              )
              .map((product, index) => {
                const actualIndex =
                  (currentProductsPage - 1) * itemsPerPage + index;
                return (
                  <div
                    key={actualIndex}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-all duration-300 group">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-sm font-bold text-primary">
                        {actualIndex + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                          {product.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {product.sales} sales
                          </p>
                          <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                            +12%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">
                        ₹{product.revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">revenue</p>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Page Indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {[
              ...Array(
                Math.ceil(analytics.products.topSelling.length / itemsPerPage)
              ),
            ].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentProductsPage(i + 1)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  currentProductsPage === i + 1
                    ? "bg-primary w-6"
                    : "bg-muted-foreground hover:bg-muted-foreground/80"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Sales by Category
                </h3>
                <p className="text-sm text-muted-foreground">Distribution overview</p>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  setCurrentCategoriesPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentCategoriesPage === 1}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                {currentCategoriesPage}/
                {Math.ceil(analytics.categories.length / itemsPerPage)}
              </span>
              <button
                onClick={() =>
                  setCurrentCategoriesPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(analytics.categories.length / itemsPerPage)
                    )
                  )
                }
                disabled={
                  currentCategoriesPage >=
                  Math.ceil(analytics.categories.length / itemsPerPage)
                }
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {analytics.categories
              .slice(
                (currentCategoriesPage - 1) * itemsPerPage,
                currentCategoriesPage * itemsPerPage
              )
              .map((category, index) => (
                <div
                  key={index}
                  className="space-y-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 bg-primary rounded-full"></div>
                      <span className="font-semibold text-foreground">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-primary font-bold">
                        {category.percentage}%
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {category.sales} sales
                      </span>
                    </div>
                  </div>
                  <div className="relative w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${category.percentage}%`,
                      }}>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Page Indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {[
              ...Array(Math.ceil(analytics.categories.length / itemsPerPage)),
            ].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentCategoriesPage(i + 1)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  currentCategoriesPage === i + 1
                    ? "bg-purple-600 dark:bg-purple-400 w-6"
                    : "bg-muted-foreground hover:bg-muted-foreground/80"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* AI Usage Stats */}
      <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              AI Tool Usage
            </h3>
            <p className="text-sm text-muted-foreground">
              Intelligent automation metrics
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-purple-500/5 rounded-xl hover:bg-purple-500/10 transition-all duration-300 border border-purple-500/20 group">
            <div className="h-14 w-14 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/20 transition-colors">
              <BarChart3 className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                {analytics.aiUsage.storiesGenerated}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Stories Generated
              </p>
            </div>
          </div>

          <div className="text-center p-6 bg-green-500/5 rounded-xl hover:bg-green-500/10 transition-all duration-300 border border-green-500/20 group">
            <div className="h-14 w-14 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/20 transition-colors">
              <Package className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                {analytics.aiUsage.imagesAnalyzed}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Images Analyzed
              </p>
            </div>
          </div>

          <div className="text-center p-6 bg-blue-500/5 rounded-xl hover:bg-blue-500/10 transition-all duration-300 border border-blue-500/20 group">
            <div className="h-14 w-14 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 transition-colors">
              <Users className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {analytics.aiUsage.voiceProcessed}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Voice Messages
              </p>
            </div>
          </div>

          <div className="text-center p-6 bg-primary/5 rounded-xl hover:bg-primary/10 transition-all duration-300 border border-primary/20 group">
            <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <DollarSign className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                {analytics.aiUsage.pricingSuggestions}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Pricing Suggestions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
