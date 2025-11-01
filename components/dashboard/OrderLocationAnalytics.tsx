"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleSelect, SimpleSelectItem } from "@/components/ui/select";
import OrderMap from "./OrderMap";
import toast from "react-hot-toast";
import { useDynamicTranslation } from "@/lib/i18n/useDynamicTranslation";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  shipping_latitude: number;
  shipping_longitude: number;
  created_at: string;
  customer: {
    name: string;
    email: string;
  };
}

interface Stats {
  total: number;
  geocoded: number;
  pending: number;
  by_status: Record<string, number>;
}

export default function OrderLocationAnalytics() {
  const { translateBatch, t } = useDynamicTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Translate UI text
  useEffect(() => {
    translateBatch([
      "Order Location Analytics",
      "Update Locations",
      "Updating...",
      "Geocode All",
      "Geocoding...",
      "Start Date",
      "End Date",
      "Status",
      "All",
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Clear Filters",
      "Total Orders",
      "Mapped Orders",
      "Pending Geocoding",
      "Coverage Rate",
      "Order Distribution Map",
      "orders displayed on map",
      "Loading order locations...",
      "No orders with location data found",
      "Geocode your orders to see them on the map",
      "Try Geocoding Orders",
      "Selected Order Details",
      "Order Number",
      "Customer",
      "Email",
      "Amount",
      "Date",
      "Clear Selection",
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled"
    ]);
  }, [translateBatch]);

  const fetchOrderLocations = async (geocode = false) => {
    try {
      setIsLoading(true);

      console.log("🔄 Fetching orders from database...");

      // Fetch real data from database
      const response = await fetch("/api/orders/locations");

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Fetched ${data.orders.length} orders with coordinates`);
        setOrders(data.orders);
        setStats(data.stats);

        if (geocode) {
          toast.success(
            `Locations updated! ${data.stats.geocoded} orders mapped.`
          );
        } else {
          toast.success(`Loaded ${data.orders.length} orders with locations!`);
        }
      } else {
        throw new Error(data.error || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      toast.error("Failed to load order locations");

      // Set empty state on error
      setOrders([]);
      setStats({ total: 0, geocoded: 0, pending: 0, by_status: {} });
    } finally {
      setIsLoading(false);
    }
  };

  const geocodeAllOrders = async () => {
    try {
      setIsGeocoding(true);
      toast.loading("Geocoding all orders... This may take a few minutes.");

      const response = await fetch("/api/admin/order-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "geocode_all" }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchOrderLocations(); // Refresh data
      } else {
        toast.error("Failed to geocode orders");
      }
    } catch (error) {
      console.error("Error geocoding orders:", error);
      toast.error("Error during geocoding process");
    } finally {
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    fetchOrderLocations();
  }, []);

  useEffect(() => {
    fetchOrderLocations();
  }, [startDate, endDate, statusFilter]);

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3">
        <Button
          onClick={() => fetchOrderLocations(true)}
          disabled={isLoading}
          variant="outline"
          className="border-border hover:bg-accent">
          {isLoading ? t("Updating...") : t("Update Locations")}
        </Button>

        <Button
          onClick={geocodeAllOrders}
          disabled={isGeocoding || isLoading}
          className="bg-primary hover:bg-primary/90">
          {isGeocoding ? t("Geocoding...") : t("Geocode All")}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 border-border bg-card hover:shadow-lg transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">{t("Start Date")}</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setStartDate(e.target.value)
              }
              className="border-border bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">{t("End Date")}</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEndDate(e.target.value)
              }
              className="border-border bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">{t("Status")}</label>
            <SimpleSelect value={statusFilter} onValueChange={setStatusFilter}>
              <SimpleSelectItem value="all">{t("All")}</SimpleSelectItem>
              <SimpleSelectItem value="pending">{t("Pending")}</SimpleSelectItem>
              <SimpleSelectItem value="confirmed">{t("Confirmed")}</SimpleSelectItem>
              <SimpleSelectItem value="shipped">{t("Shipped")}</SimpleSelectItem>
              <SimpleSelectItem value="delivered">{t("Delivered")}</SimpleSelectItem>
              <SimpleSelectItem value="cancelled">{t("Cancelled")}</SimpleSelectItem>
            </SimpleSelect>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setStatusFilter("all");
              }}
              variant="outline"
              className="w-full border-border hover:bg-accent">
              {t("Clear Filters")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 border-border bg-card hover:shadow-lg transition-all duration-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-2">
                {stats.total}
              </div>
              <div className="text-sm text-muted-foreground font-medium">{t("Total Orders")}</div>
            </div>
          </Card>

          <Card className="p-6 border-border bg-card hover:shadow-lg transition-all duration-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {stats.geocoded}
              </div>
              <div className="text-sm text-muted-foreground font-medium">{t("Mapped Orders")}</div>
            </div>
          </Card>

          <Card className="p-6 border-border bg-card hover:shadow-lg transition-all duration-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {stats.pending}
              </div>
              <div className="text-sm text-muted-foreground font-medium">{t("Pending Geocoding")}</div>
            </div>
          </Card>

          <Card className="p-6 border-border bg-card hover:shadow-lg transition-all duration-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats.geocoded > 0
                  ? Math.round((stats.geocoded / stats.total) * 100)
                  : 0}
                %
              </div>
              <div className="text-sm text-muted-foreground font-medium">{t("Coverage Rate")}</div>
            </div>
          </Card>
        </div>
      )}

      {/* Map */}
      <Card className="p-6 border-border bg-card hover:shadow-lg transition-all duration-300">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">{t("Order Distribution Map")}</h3>
          <p className="text-sm text-muted-foreground">
            {orders.length} {t("orders displayed on map")}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96 bg-accent/20 rounded-xl border-2 border-dashed border-border">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-primary mx-auto mb-3"></div>
              <p className="text-muted-foreground font-medium">{t("Loading order locations...")}</p>
            </div>
          </div>
        ) : orders.length > 0 ? (
          <OrderMap orders={orders} onOrderSelect={handleOrderSelect} />
        ) : (
          <div className="flex items-center justify-center h-96 bg-accent/20 rounded-xl border-2 border-dashed border-border">
            <div className="text-center">
              <div className="text-muted-foreground text-5xl mb-3">📍</div>
              <p className="text-foreground font-medium mb-2">
                {t("No orders with location data found")}
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                {t("Geocode your orders to see them on the map")}
              </p>
              <Button
                onClick={() => fetchOrderLocations(true)}
                className="mt-2"
                variant="outline">
                {t("Try Geocoding Orders")}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Selected Order Details */}
      {selectedOrder && (
        <Card className="p-6 border-2 border-primary bg-card shadow-xl hover:shadow-2xl transition-all duration-300">
          <h3 className="text-xl font-semibold mb-6 text-foreground">{t("Selected Order Details")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="pb-3 border-b border-border">
                <p className="text-sm text-muted-foreground font-medium mb-1">{t("Order Number")}</p>
                <p className="text-base font-semibold text-foreground">#{selectedOrder.order_number}</p>
              </div>
              <div className="pb-3 border-b border-border">
                <p className="text-sm text-muted-foreground font-medium mb-1">{t("Customer")}</p>
                <p className="text-base font-semibold text-foreground">{selectedOrder.customer.name}</p>
              </div>
              <div className="pb-3">
                <p className="text-sm text-muted-foreground font-medium mb-1">{t("Email")}</p>
                <p className="text-base font-medium text-foreground break-all">{selectedOrder.customer.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="pb-3 border-b border-border">
                <p className="text-sm text-muted-foreground font-medium mb-1">{t("Status")}</p>
                <span className={`capitalize inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${
                  selectedOrder.status === "delivered"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : selectedOrder.status === "cancelled"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}>
                  {t(selectedOrder.status)}
                </span>
              </div>
              <div className="pb-3 border-b border-border">
                <p className="text-sm text-muted-foreground font-medium mb-1">{t("Amount")}</p>
                <p className="text-2xl font-bold text-primary">₹{selectedOrder.total_amount.toLocaleString()}</p>
              </div>
              <div className="pb-3">
                <p className="text-sm text-muted-foreground font-medium mb-1">{t("Date")}</p>
                <p className="text-base font-medium text-foreground">
                  {new Date(selectedOrder.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setSelectedOrder(null)}
            className="w-full mt-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            variant="outline">
            {t("Clear Selection")}
          </Button>
        </Card>
      )}
    </div>
  );
}
