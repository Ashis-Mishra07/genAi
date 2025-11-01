"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleSelect, SimpleSelectItem } from "@/components/ui/select";
import OrderMap from "./OrderMap";
import toast from "react-hot-toast";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Locations</h2>
          <p className="text-gray-600">
            Geographic distribution of your orders
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => fetchOrderLocations(true)}
            disabled={isLoading}
            variant="outline">
            {isLoading ? "Updating..." : "Update Locations"}
          </Button>

          <Button
            onClick={geocodeAllOrders}
            disabled={isGeocoding || isLoading}
            className="bg-blue-600 hover:bg-blue-700">
            {isGeocoding ? "Geocoding..." : "Geocode All"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setStartDate(e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEndDate(e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <SimpleSelect value={statusFilter} onValueChange={setStatusFilter}>
              <SimpleSelectItem value="all">All Status</SimpleSelectItem>
              <SimpleSelectItem value="pending">Pending</SimpleSelectItem>
              <SimpleSelectItem value="confirmed">Confirmed</SimpleSelectItem>
              <SimpleSelectItem value="shipped">Shipped</SimpleSelectItem>
              <SimpleSelectItem value="delivered">Delivered</SimpleSelectItem>
              <SimpleSelectItem value="cancelled">Cancelled</SimpleSelectItem>
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
              className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.geocoded}
              </div>
              <div className="text-sm text-gray-600">Mapped Orders</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.pending}
              </div>
              <div className="text-sm text-gray-600">Pending Geocoding</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.geocoded > 0
                  ? Math.round((stats.geocoded / stats.total) * 100)
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">Coverage Rate</div>
            </div>
          </Card>
        </div>
      )}

      {/* Map */}
      <Card className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Order Distribution Map</h3>
          <p className="text-sm text-gray-600">
            {orders.length} orders displayed on map
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading order locations...</p>
            </div>
          </div>
        ) : orders.length > 0 ? (
          <OrderMap orders={orders} onOrderSelect={handleOrderSelect} />
        ) : (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">📍</div>
              <p className="text-gray-600">
                No orders with location data found
              </p>
              <Button
                onClick={() => fetchOrderLocations(true)}
                className="mt-4"
                variant="outline">
                Try Geocoding Orders
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Selected Order Details */}
      {selectedOrder && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Selected Order Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Order Number:</strong> #{selectedOrder.order_number}
              </p>
              <p>
                <strong>Customer:</strong> {selectedOrder.customer.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedOrder.customer.email}
              </p>
            </div>
            <div>
              <p>
                <strong>Status:</strong>{" "}
                <span className="capitalize">{selectedOrder.status}</span>
              </p>
              <p>
                <strong>Amount:</strong> ₹
                {selectedOrder.total_amount.toLocaleString()}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedOrder.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
