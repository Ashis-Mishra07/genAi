"use client";

import { useState, useEffect } from "react";
import { GoogleLoaderWithText } from "@/components/ui/google-loader";
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
import { useDynamicTranslation } from "@/lib/i18n/useDynamicTranslation";

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
  const { translateBatch, t } = useDynamicTranslation();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [currentProductsPage, setCurrentProductsPage] = useState(1);
  const [currentCategoriesPage, setCurrentCategoriesPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    translateBatch([
      "Analytics Dashboard",
      "Track your marketplace performance and AI usage",
      "Last 7 days",
      "Last 30 days",
      "Last 3 months",
      "Last year",
      "Export",
      "Total Revenue",
      "vs last period",
      "Total Orders",
      "Active Products",
      "Across 5 categories",
      "AI Stories Generated",
      "Cultural narratives",
      "Revenue Trend",
      "Monthly performance overview",
      "Actual",
      "Estimated",
      "Top Selling Products",
      "Best performing items",
      "Sales by Category",
      "Distribution overview",
      "AI Tool Usage",
      "Intelligent automation metrics",
      "Stories Generated",
      "Images Analyzed",
      "Voice Messages",
      "Pricing Suggestions",
      "Loading analytics...",
      "sales",
      "revenue",
      "Textiles",
      "Pottery",
      "Jewelry",
      "Woodwork",
      "Metalwork",
    ]);
  }, [translateBatch]);

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
      <div className="p-6 flex items-center justify-center min-h-screen">
        <GoogleLoaderWithText size="xl" text={t("Loading analytics...")} />
      </div>
    );
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
            {t("Track your marketplace performance and AI usage")}
          </p>
          <div className="h-1 w-32 bg-primary rounded-full"></div>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground shadow-lg">
            <option value="7d">{t("Last 7 days")}</option>
            <option value="30d">{t("Last 30 days")}</option>
            <option value="90d">{t("Last 3 months")}</option>
            <option value="1y">{t("Last year")}</option>
          </select>
          <button className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105">
            <Download className="h-4 w-4" />
            <span>{t("Export")}</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {t("Total Revenue")}
              </p>
              <p className="text-2xl font-bold text-foreground">
                ₹{analytics.revenue.total.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {analytics.revenue.trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-primary" />
            ) : (
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium ml-2 text-primary">
              {analytics.revenue.change}%
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
                {analytics.orders.total}
              </p>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary ml-2">
              {analytics.orders.change}%
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
                {t("Active Products")}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {analytics.products.total}
              </p>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {t("Across 5 categories")}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {t("AI Stories Generated")}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {analytics.aiUsage.storiesGenerated}
              </p>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {t("Cultural narratives")}
            </span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {t("Revenue Trend")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("Monthly performance overview")}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-muted rounded-lg px-3 py-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  {t("Actual")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-primary/50 rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  {t("Estimated")}
                </span>
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
                className="col-span-12 border-t border-border/30"
                style={{ gridRow: i + 1 }}
              />
            ))}
            {/* Vertical grid lines */}
            {[...Array(13)].map((_, i) => (
              <div
                key={`v-${i}`}
                className="row-span-6 border-l border-border/30"
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
                          className="w-6 bg-primary rounded-t-lg transition-all duration-300 hover:bg-primary/80 relative overflow-hidden"
                          style={{
                            height: `${actualHeight}px`,
                          }}>
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        {/* Estimated Revenue Bar */}
                        <div
                          className="w-6 bg-primary/50 rounded-t-lg transition-all duration-300 hover:bg-primary/70 relative overflow-hidden"
                          style={{
                            height: `${estimatedHeight}px`,
                          }}>
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                        <div className="bg-card border border-border text-foreground px-4 py-3 rounded-lg text-sm whitespace-nowrap shadow-lg">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 bg-primary rounded-full"></div>
                              <span className="text-muted-foreground">
                                {t("Actual")}: ₹{month.actual.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 bg-primary/50 rounded-full"></div>
                              <span className="text-muted-foreground">
                                {t("Estimated")}: ₹
                                {month.estimated.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-center text-muted-foreground text-xs mt-2 pt-2 border-t border-border">
                              {month.month}
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-card"></div>
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
                    <span className="text-xs font-semibold text-orange-400 bg-accent/50 px-2 py-1 rounded-lg border border-border">
                      ₹{(month.actual / 1000).toFixed(0)}k
                    </span>
                    <span className="text-xs font-semibold text-blue-400 bg-accent/50 px-2 py-1 rounded-lg border border-border">
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
                  className="text-sm text-muted-foreground -ml-2 bg-accent/50 px-2 py-1 rounded border border-border">
                  {(value / 1000).toFixed(0)}k
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling Products */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-primary dark:text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {t("Top Selling Products")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("Best performing items")}
                </p>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() =>
                  setCurrentProductsPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentProductsPage === 1}
                className="p-1.5 rounded-lg bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-border">
                <ChevronLeft className="h-3 w-3 text-muted-foreground" />
              </button>
              <span className="text-xs text-muted-foreground min-w-[45px] text-center">
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
                className="p-1.5 rounded-lg bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-border">
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
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
                    className="flex items-center justify-between p-3 bg-accent/30 rounded-lg hover:bg-accent/50 transition-all duration-300 border border-border group">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <span className="w-8 h-8 bg-primary/10 dark:text-green-500 rounded-lg flex items-center justify-center text-sm font-semibold text-primary">
                          {actualIndex + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors duration-300 text-sm">
                          {product.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <p className="text-xs text-muted-foreground">
                            {product.sales} {t("sales")}
                          </p>
                          <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                            +12%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400 text-sm">
                        ₹{product.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("revenue")}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Page Indicators */}
          <div className="flex justify-center mt-3 space-x-1">
            {[
              ...Array(
                Math.ceil(analytics.products.topSelling.length / itemsPerPage)
              ),
            ].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentProductsPage(i + 1)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  currentProductsPage === i + 1
                    ? "bg-primary w-4"
                    : "bg-muted hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <PieChart className="h-5 w-5 text-primary  dark:text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {t("Sales by Category")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("Distribution overview")}
                </p>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() =>
                  setCurrentCategoriesPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentCategoriesPage === 1}
                className="p-1.5 rounded-lg bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-border">
                <ChevronLeft className="h-3 w-3 text-muted-foreground" />
              </button>
              <span className="text-xs text-muted-foreground min-w-[45px] text-center">
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
                className="p-1.5 rounded-lg bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-border">
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.categories
              .slice(
                (currentCategoriesPage - 1) * itemsPerPage,
                currentCategoriesPage * itemsPerPage
              )
              .map((category, index) => (
                <div
                  key={index}
                  className="space-y-2 p-3 bg-accent/30 rounded-lg border border-border hover:border-primary/50 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-2.5 w-2.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-lg"></div>
                      <span className="text-sm font-semibold text-foreground">
                        {t(category.name)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-orange-500 dark:text-orange-400 font-bold">
                        {category.percentage}%
                      </span>
                      <span className="text-xs text-muted-foreground bg-accent px-1.5 py-0.5 rounded-full border border-border">
                        {category.sales} {t("sales")}
                      </span>
                    </div>
                  </div>
                  <div className="relative w-full bg-accent rounded-full h-3 overflow-hidden border border-border">
                    <div
                      className="bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg relative overflow-hidden"
                      style={{
                        width: `${category.percentage}%`,
                        boxShadow: "0 0 10px rgba(251, 146, 60, 0.4)",
                      }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-60 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Page Indicators */}
          <div className="flex justify-center mt-3 space-x-1">
            {[
              ...Array(Math.ceil(analytics.categories.length / itemsPerPage)),
            ].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentCategoriesPage(i + 1)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  currentCategoriesPage === i + 1
                    ? "bg-primary w-4"
                    : "bg-muted hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* AI Usage Stats */}
      <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {t("AI Tool Usage")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("Intelligent automation metrics")}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg hover:bg-muted transition-all duration-200">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">
                {analytics.aiUsage.storiesGenerated}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                {t("Stories Generated")}
              </p>
            </div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg hover:bg-muted transition-all duration-200">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">
                {analytics.aiUsage.imagesAnalyzed}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                {t("Images Analyzed")}
              </p>
            </div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg hover:bg-muted transition-all duration-200">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">
                {analytics.aiUsage.voiceProcessed}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                {t("Voice Messages")}
              </p>
            </div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg hover:bg-muted transition-all duration-200">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">
                {analytics.aiUsage.pricingSuggestions}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                {t("Pricing Suggestions")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
