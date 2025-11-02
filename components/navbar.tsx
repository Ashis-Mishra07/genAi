"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  Settings,
  ShoppingBag,
  Menu,
  X,
  Sparkles,
  Home,
  MessageSquare,
  Package,
  Video,
  BarChart3,
  ChevronDown,
  Bell,
  MessageCircle,
  CreditCard,
  Headphones,
  ShoppingCart,
  MapPin,
  Plus,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeSwitch from "@/components/ui/bnwswitch";
import LanguageSelector from "@/components/ui/language-selector";
import { useDynamicTranslation } from "@/lib/i18n/useDynamicTranslation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: "admin" | "artisan" | "customer";
    avatar?: string;
  } | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

export function Navbar({ user, onLogin, onLogout }: NavbarProps) {
  const router = useRouter();
  const { t, translateBatch, currentLocale } = useDynamicTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    translateBatch([
      "Dashboard",
      "Products",
      "Create Product",
      "Orders",
      "Analytics",
      "Messages",
      "Profile",
      "My Orders",
      "Feedback",
      "Sign Out",
      "Sign in",
      "Get started",
      "AI Assistant",
      "Chats",
      "Video Gen",
      "More",
      "Support",
      "Notifications",
      "Cart",
      "Settings",
      "Maps",
      "Recent Orders",
      "Featured Products",
      "Know Your Artisan",
      "Wishlist",
      "Need Help?",
    ]);
  }, [currentLocale, translateBatch]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    router.push("/");
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    }
    router.push("/auth");
  };

  const getRoleBasedLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case "admin":
        return [
          { href: "/dashboard", label: t("Dashboard"), icon: "Home" },
          { href: "/chatbot", label: t("AI Assistant"), icon: "Sparkles" },
          { href: "/chats", label: t("Chats"), icon: "MessageSquare" },
          {
            href: "/dashboard/products",
            label: t("Products"),
            icon: "Package",
          },
          { href: "/video-generation", label: t("Video Gen"), icon: "Video" },
          {
            href: "/dashboard/orders",
            label: t("Orders"),
            icon: "ShoppingCart",
          },
          {
            href: "/dashboard/analytics",
            label: t("Analytics"),
            icon: "BarChart3",
          },
          {
            href: "/dashboard/order-locations",
            label: t("Maps"),
            icon: "MapPin",
          },
          {
            href: "/dashboard/settings",
            label: t("Settings"),
            icon: "Settings",
          },
        ];
      case "artisan":
        return [
          { href: "/artisan/dashboard", label: t("Dashboard"), icon: "Home" },
          { href: "/artisan/products", label: t("Products"), icon: "Package" },
          {
            href: "/artisan/products/new",
            label: t("Create Product"),
            icon: "Plus",
          },
          {
            href: "/artisan/analytics",
            label: t("Analytics"),
            icon: "BarChart3",
          },
          {
            href: "/artisan/messages",
            label: t("Admin Support"),
            icon: "MessageSquare",
          },
          {
            href: "/artisan/notifications",
            label: t("Notifications"),
            icon: "Bell",
          },
          {
            href: "/artisan/feedback",
            label: t("Feedback"),
            icon: "MessageCircle",
          },
        ];
      case "customer":
        return [
          { href: "/customer/dashboard", label: t("Dashboard"), icon: "Home" },
          {
            href: "/customer/orders",
            label: t("Recent Orders"),
            icon: "ShoppingBag",
          },
          {
            href: "/customer/products",
            label: t("Featured Products"),
            icon: "Package",
          },
          {
            href: "/customer/artisan-stories",
            label: t("Know Your Artisan"),
            icon: "Video",
          },
          { href: "/customer/cart", label: t("Cart"), icon: "ShoppingCart" },
          { href: "/customer/wishlist", label: t("Wishlist"), icon: "Heart" },
          { href: "/customer/profile", label: t("Profile"), icon: "User" },
          {
            href: "/customer/help",
            label: t("Need Help?"),
            icon: "Headphones",
          },
        ];
      default:
        return [];
    }
  };

  const navLinks = getRoleBasedLinks();

  // Helper to get tour data attribute for artisans
  const getTourAttribute = (href: string) => {
    if (user?.role !== "artisan") return {};
    
    const tourMap: Record<string, string> = {
      "/artisan/messages": "admin-support",
      "/artisan/products/new": "create-product",
      "/artisan/analytics": "analytics",
      "/artisan/feedback": "feedback",
    };
    
    const tourId = tourMap[href];
    return tourId ? { "data-tour": tourId } : {};
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-4 group">
            <div className="relative">
              <Image
                src="/1000098944-removebg-preview.png"
                alt="Artisan Marketplace Logo"
                width={40}
                height={40}
                className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                priority
              />
              {/* Subtle glow effect on hover */}
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight leading-none transition-all duration-300 group-hover:scale-105">
                <span className="text-blue-600 dark:text-blue-400 drop-shadow-sm">
                  A
                </span>
                <span className="text-red-500 dark:text-red-400 drop-shadow-sm">
                  r
                </span>
                <span className="text-yellow-500 dark:text-yellow-400 drop-shadow-sm">
                  t
                </span>
                <span className="text-blue-600 dark:text-blue-400 drop-shadow-sm">
                  i
                </span>
                <span className="text-green-500 dark:text-green-400 drop-shadow-sm">
                  s
                </span>
                <span className="text-red-500 dark:text-red-400 drop-shadow-sm">
                  a
                </span>
                <span className="text-blue-600 dark:text-blue-400 drop-shadow-sm">
                  n
                </span>
              </span>
              <span className="text-lg font-medium text-muted-foreground/90 tracking-wide leading-none -mt-1 transition-colors duration-300 group-hover:text-muted-foreground">
                Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              // Show dashboard navigation for logged in users
              <>
                {navLinks.slice(0, 3).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
                    {...getTourAttribute(link.href)}>
                    {link.label}
                  </Link>
                ))}
                {navLinks.length > 3 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="group relative text-base font-medium text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg px-3 py-2 hover:bg-accent/50">
                        {t("More")}
                        <ChevronDown className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-180 group-data-[state=open]:rotate-180" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      side="bottom"
                      className="w-48 z-50 bg-background/95 backdrop-blur-sm border shadow-lg rounded-lg p-1"
                      sideOffset={8}
                      alignOffset={0}
                      avoidCollisions={true}
                      collisionPadding={16}>
                      {navLinks.slice(3).map((link) => (
                        <DropdownMenuItem key={link.href} asChild>
                          <Link
                            href={link.href}
                            className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                            {...getTourAttribute(link.href)}>
                            <span className="truncate">{link.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            ) : (
              // Show general navigation for guests
              navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            <LanguageSelector />
            <ThemeSwitch />

            {user ? (
              <div className="flex items-center space-x-2">
                {/* Cart for customers */}
                {user.role === "customer" && (
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingBag className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      0
                    </span>
                  </Button>
                )}

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 hover:bg-accent rounded-lg px-3 py-2 transition-colors">
                      <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="hidden md:block text-base font-medium">
                        {user.name}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 z-50 bg-background/95 backdrop-blur-sm border shadow-lg rounded-lg p-2"
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    alignOffset={-4}
                    avoidCollisions={true}
                    collisionPadding={16}
                    forceMount>
                    <DropdownMenuLabel className="font-normal px-2 py-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs leading-none text-primary capitalize">
                          {user.role}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === "artisan" && (
                      <DropdownMenuItem
                        onClick={() => router.push("/artisan/profile")}
                        className="px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        {t("View Profile")}
                      </DropdownMenuItem>
                    )}
                    {user.role === "customer" && (
                      <DropdownMenuItem
                        onClick={() => router.push("/customer/profile")}
                        className="px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        {t("View Profile")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("Sign Out")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={handleLogin}>
                  {t("Sign in")}
                </Button>
                <Button onClick={handleLogin}>{t("Get started")}</Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}

              {!user && (
                <div className="px-4 pt-4 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      handleLogin();
                      setIsMobileMenuOpen(false);
                    }}>
                    {t("Sign in")}
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => {
                      handleLogin();
                      setIsMobileMenuOpen(false);
                    }}>
                    {t("Get started")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
