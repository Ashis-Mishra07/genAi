"use client";

import React from "react";
import OrderLocationAnalytics from "@/components/dashboard/OrderLocationAnalytics";

export default function OrderLocationsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Order Locations
          </h1>
          <p className="text-muted-foreground text-base">
            Geographic insights and order distribution mapping
          </p>
        </div>
      </div>

      {/* Main Content */}
      <OrderLocationAnalytics />
    </div>
  );
}
