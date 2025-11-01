"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useTheme } from "next-themes";

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
  const { theme } = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dark mode map styles
  const darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ];

  // Light mode map styles
  const lightMapStyles = [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ];

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
            styles: theme === "dark" ? darkMapStyles : lightMapStyles,
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
              styles: theme === "dark" ? darkMapStyles : lightMapStyles,
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
            styles: theme === "dark" ? darkMapStyles : lightMapStyles,
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

  // Update map styles when theme changes
  useEffect(() => {
    if (map) {
      map.setOptions({
        styles: theme === "dark" ? darkMapStyles : lightMapStyles,
      });
    }
  }, [theme, map]);

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

      // Create custom marker with visible red circular design for better demography
      const marker = new google.maps.Marker({
        position,
        map,
        title: `Order #${order.order_number} - ${order.customer.name}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#EF4444", // Bright red color for maximum visibility
          fillOpacity: 0.85,
          strokeColor: "#FFFFFF",
          strokeWeight: 3,
          scale: 12, // Larger size for better visibility
        },
        animation: google.maps.Animation.DROP,
        zIndex: 1000,
        optimized: false, // Ensures markers render with better quality
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

      // Create info window with theme-aware styling
      const isDark = theme === "dark";
      const bgColor = isDark ? "#1f2937" : "#ffffff";
      const textColor = isDark ? "#f9fafb" : "#1f2937";
      const mutedColor = isDark ? "#9ca3af" : "#6b7280";
      const borderColor = isDark ? "#374151" : "#e5e7eb";
      
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 220px; font-family: system-ui, -apple-system, sans-serif; background: ${bgColor}; color: ${textColor};">
            <h3 style="margin: 0 0 12px 0; color: ${textColor}; font-size: 16px; font-weight: 600; border-bottom: 2px solid #EF4444; padding-bottom: 6px;">
              Order #${order.order_number}
            </h3>
            <div style="display: flex; align-items: center; margin: 6px 0;">
              <span style="color: ${mutedColor}; font-size: 13px; min-width: 70px;">Customer:</span>
              <span style="color: ${textColor}; font-size: 13px; font-weight: 500;">${order.customer.name}</span>
            </div>
            <div style="display: flex; align-items: center; margin: 6px 0;">
              <span style="color: ${mutedColor}; font-size: 13px; min-width: 70px;">Status:</span>
              <span style="color: ${color}; font-size: 13px; font-weight: 600; text-transform: uppercase; background: ${color}15; padding: 2px 8px; border-radius: 12px;">${order.status}</span>
            </div>
            <div style="display: flex; align-items: center; margin: 6px 0;">
              <span style="color: ${mutedColor}; font-size: 13px; min-width: 70px;">Amount:</span>
              <span style="color: #059669; font-size: 14px; font-weight: 600;">₹${order.total_amount.toLocaleString()}</span>
            </div>
            <div style="display: flex; align-items: center; margin: 6px 0;">
              <span style="color: ${mutedColor}; font-size: 13px; min-width: 70px;">Date:</span>
              <span style="color: ${textColor}; font-size: 13px;">${new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid ${borderColor};">
              <button 
                onclick="window.viewOrderDetails('${order.id}')"
                style="background: #EF4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; width: 100%; transition: all 0.2s;"
                onmouseover="this.style.background='#DC2626'"
                onmouseout="this.style.background='#EF4444'"
              >
                📍 View Full Details
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
      <div className="flex items-center justify-center h-96 bg-accent/20 rounded-xl border-2 border-dashed border-border">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-accent/20 rounded-xl flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground font-medium">Loading map...</p>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg"
        style={{ minHeight: "400px" }}
      />

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border-2 border-red-500/20 z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <h4 className="font-bold text-sm text-foreground">Order Locations</h4>
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          <span className="font-semibold text-red-500">{ordersToDisplay.length}</span> orders displayed
        </div>
        <div className="pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-background"></div>
            <span>Click marker for details</span>
          </div>
        </div>
      </div>
    </div>
  );
}
