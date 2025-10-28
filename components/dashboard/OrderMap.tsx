"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

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

interface OrderMapProps {
  orders: Order[];
  onOrderSelect?: (order: Order) => void;
}

const ORDER_STATUS_COLORS = {
  pending: "#FFA500",
  confirmed: "#4CAF50",
  shipped: "#2196F3",
  delivered: "#8BC34A",
  cancelled: "#F44336",
  default: "#9E9E9E",
};

export default function OrderMap({ orders, onOrderSelect }: OrderMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Test data for fallback
  const testOrders: Order[] = [
    {
      id: "test-1",
      order_number: "TEST-001",
      status: "pending",
      total_amount: 1000,
      shipping_latitude: 20.461812,
      shipping_longitude: 85.8622029,
      created_at: "2025-10-27T12:00:00Z",
      customer: { name: "Test Customer 1", email: "test1@example.com" },
    },
    {
      id: "test-2",
      order_number: "TEST-002",
      status: "confirmed",
      total_amount: 2000,
      shipping_latitude: 20.3268616,
      shipping_longitude: 85.81233,
      created_at: "2025-10-27T12:00:00Z",
      customer: { name: "Test Customer 2", email: "test2@example.com" },
    },
  ];

  // Use real orders if available, otherwise test data for demo
  const ordersToDisplay = orders && orders.length > 0 ? orders : testOrders;

  useEffect(() => {
    const initMap = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        console.log("🔑 Google Maps API Key:", apiKey ? "Present" : "Missing");
        console.log(
          "🔑 First 10 chars:",
          apiKey ? apiKey.substring(0, 10) + "..." : "None"
        );

        if (!apiKey) {
          setError("Google Maps API key not configured");
          setIsLoading(false);
          return;
        }

        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          console.log("✅ Google Maps already loaded, initializing map...");

          if (!mapRef.current) return;

          // Initialize map
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: 20.5937, lng: 78.9629 }, // Center of India
            zoom: 6,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          });

          setMap(mapInstance);
          setIsLoading(false);
          console.log("✅ Map initialized successfully");
          return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector(
          `script[src*="maps.googleapis.com"]`
        );
        if (existingScript) {
          console.log("🔄 Google Maps script already loading, waiting...");

          existingScript.addEventListener("load", () => {
            if (!mapRef.current) return;

            const mapInstance = new google.maps.Map(mapRef.current, {
              center: { lat: 20.5937, lng: 78.9629 },
              zoom: 6,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }],
                },
              ],
            });

            setMap(mapInstance);
            setIsLoading(false);
            console.log("✅ Map initialized successfully");
          });
          return;
        }

        // Load Google Maps script dynamically
        console.log("📦 Loading Google Maps script...");
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          console.log("✅ Google Maps script loaded");

          if (!mapRef.current) return;

          // Initialize map
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: 20.5937, lng: 78.9629 }, // Center of India
            zoom: 6,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          });

          setMap(mapInstance);
          setIsLoading(false);
          console.log("✅ Map initialized successfully");
        };

        script.onerror = () => {
          console.error("❌ Failed to load Google Maps script");
          setError("Failed to load Google Maps script");
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setError("Failed to load Google Maps");
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    // Use test data instead of passed orders for now
    const ordersToUse = ordersToDisplay;

    console.log(
      "🗺️ OrderMap: Creating markers for orders:",
      ordersToUse.length
    );
    console.log("🗺️ Orders data:", ordersToUse);

    if (!map || !ordersToUse.length) {
      console.log("🗺️ OrderMap: No map or orders available", {
        map: !!map,
        ordersCount: ordersToUse.length,
      });
      return;
    }

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    ordersToUse.forEach((order, index) => {
      console.log(
        `🗺️ Creating marker ${index + 1} for order:`,
        order.order_number,
        {
          lat: order.shipping_latitude,
          lng: order.shipping_longitude,
        }
      );

      const position = {
        lat: order.shipping_latitude,
        lng: order.shipping_longitude,
      };

      // Create custom marker icon based on order status
      const color =
        ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] ||
        ORDER_STATUS_COLORS.default;

      // Create custom marker with better visual design
      const marker = new google.maps.Marker({
        position,
        map,
        title: `Order #${order.order_number} - ${order.customer.name}`,
        label: {
          text: order.order_number.split("-")[2] || "●", // Show last part of order number
          color: "#ffffff",
          fontSize: "11px",
          fontWeight: "bold",
        },
        icon: {
          path: "M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2ZM12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5Z",
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 1.8,
          anchor: new google.maps.Point(12, 22), // Anchor at the bottom of the pin
        },
        animation: google.maps.Animation.DROP,
        zIndex: 1000,
      });

      console.log(
        `🗺️ Marker created for ${order.order_number}:`,
        marker.getPosition()?.toString(),
        "Color:",
        color
      );
      console.log(
        `🗺️ Marker visible?`,
        marker.getVisible(),
        "Map:",
        marker.getMap()
      );

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #333;">Order #${
              order.order_number
            }</h3>
            <p style="margin: 4px 0; color: #666;"><strong>Customer:</strong> ${
              order.customer.name
            }</p>
            <p style="margin: 4px 0; color: #666;"><strong>Status:</strong> 
              <span style="color: ${color}; font-weight: bold;">${order.status.toUpperCase()}</span>
            </p>
            <p style="margin: 4px 0; color: #666;"><strong>Amount:</strong> ₹${order.total_amount.toLocaleString()}</p>
            <p style="margin: 4px 0; color: #666;"><strong>Date:</strong> ${new Date(
              order.created_at
            ).toLocaleDateString()}</p>
            <div style="margin-top: 10px;">
              <button 
                onclick="window.viewOrderDetails('${order.id}')"
                style="background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;"
              >
                View Details
              </button>
            </div>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
        if (onOrderSelect) {
          onOrderSelect(order);
        }
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      console.log(`🗺️ Setting bounds for ${newMarkers.length} markers`);
      map.fitBounds(bounds);

      // Ensure minimum zoom level
      const listener = google.maps.event.addListener(map, "idle", () => {
        const currentZoom = map.getZoom();
        console.log("🗺️ Map zoom level:", currentZoom);
        if (currentZoom! > 15) {
          console.log("🗺️ Adjusting zoom to 15");
          map.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    } else {
      console.log("🗺️ No markers to display");
    }

    setMarkers(newMarkers);
    console.log(`🗺️ Total markers set:`, newMarkers.length);

    // Global function for info window buttons
    (window as any).viewOrderDetails = (orderId: string) => {
      const order = ordersToDisplay.find((o) => o.id === orderId);
      if (order && onOrderSelect) {
        onOrderSelect(order);
      }
    };
  }, [map, ordersToDisplay, onOrderSelect]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg"
        style={{ minHeight: "400px" }}
      />

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border z-10">
        <h4 className="font-semibold text-sm mb-2">Order Status</h4>
        <div className="space-y-1">
          {Object.entries(ORDER_STATUS_COLORS).map(
            ([status, color]) =>
              status !== "default" && (
                <div key={status} className="flex items-center text-xs">
                  <div
                    className="w-3 h-3 rounded-full mr-2 border border-gray-300"
                    style={{ backgroundColor: color }}></div>
                  <span className="capitalize">{status}</span>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
}
