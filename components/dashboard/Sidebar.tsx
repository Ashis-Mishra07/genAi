"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  MessageSquare,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  X,
  Sparkles,
  Users,
  LogOut,
  Video,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "AI Assistant", href: "/chatbot", icon: Sparkles },
  { name: "Chats", href: "/chats", icon: MessageSquare },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Video Generation", href: "/video-generation", icon: Video },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Order Locations", href: "/dashboard/order-locations", icon: MapPin },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Get user info from localStorage or API
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Decode basic user info (you could also fetch from API)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserInfo({
          name: payload.name || "User",
          email: payload.email || "",
          role: payload.role || "USER",
        });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleSignOut = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      // Call logout API
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          refreshToken,
          logoutAll: false,
        }),
      });

      // Clear local storage regardless of API response
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local storage and redirect on error
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-orange-500" />
            <span className="text-xl font-bold text-orange-400">
              Artisan AI
            </span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-orange-500/20 text-orange-400 border-r-2 border-orange-500"
                    : "text-gray-300 hover:bg-gray-800 hover:text-orange-300"
                )}
                onClick={() => setSidebarOpen(false)}>
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive
                      ? "text-orange-500"
                      : "text-gray-400 group-hover:text-orange-400"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-orange-400">
                  {userInfo?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-orange-400 truncate">
                  {userInfo?.name || "User"}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {userInfo?.role?.toLowerCase() || "user"}
                </p>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isLoggingOut
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "text-gray-400 hover:bg-red-500/20 hover:text-red-400"
              )}
              title="Sign Out">
              {isLoggingOut ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-gray-900 border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-orange-400">
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-orange-500" />
              <span className="text-lg font-bold text-orange-400">
                Artisan AI
              </span>
            </div>

            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isLoggingOut
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "text-gray-400 hover:bg-red-500/20 hover:text-red-400"
              )}
              title="Sign Out">
              {isLoggingOut ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-black">{children}</main>
      </div>
    </div>
  );
}
