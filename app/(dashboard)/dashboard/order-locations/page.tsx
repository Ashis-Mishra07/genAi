"use client";

import React from "react";
import OrderLocationAnalytics from "@/components/dashboard/OrderLocationAnalytics";

export default function OrderLocationsPage() {
  return (
    <div className="p-6 space-y-4 bg-black min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
            Order Locations
          </h1>
          <p className="text-gray-400 text-lg">
            Geographic insights and order distribution mapping
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-orange-400 to-transparent rounded-full"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-900 rounded-lg p-6">
        <OrderLocationAnalytics />
      </div>
    </div>
  );
}
