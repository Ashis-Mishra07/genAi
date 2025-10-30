"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  Headphones
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import LanguageSelector from "@/components/ui/language-selector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavbarProps {
  user?: {
    name: string
    email: string
    role: "admin" | "artisan" | "customer"
    avatar?: string
  } | null
  onLogin?: () => void
  onLogout?: () => void
}

export function Navbar({ user, onLogin, onLogout }: NavbarProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
    router.push("/")
  }

  const handleLogin = () => {
    if (onLogin) {
      onLogin()
    }
    router.push("/auth")
  }

  const getRoleBasedLinks = () => {
    if (!user) return []

    switch (user.role) {
      case "admin":
        return [
          { href: "/dashboard", label: "Dashboard", icon: "Home" },
          { href: "/chatbot", label: "AI Assistant", icon: "Sparkles" },
          { href: "/chats", label: "Chats", icon: "MessageSquare" },
          { href: "/dashboard/products", label: "Products", icon: "Package" },
          { href: "/video-generation", label: "Video Gen", icon: "Video" },
          { href: "/dashboard/orders", label: "Orders", icon: "ShoppingCart" },
          { href: "/dashboard/analytics", label: "Analytics", icon: "BarChart3" }
        ]
      case "artisan":
        return [
          { href: "/artisan/dashboard", label: "Dashboard", icon: "Home" },
          { href: "/artisan/products", label: "Products", icon: "Package" },
          { href: "/artisan/analytics", label: "Analytics", icon: "BarChart3" },
          { href: "/artisan/support-dashboard", label: "Support", icon: "HeadphonesIcon" },
          { href: "/artisan/messages", label: "Messages", icon: "MessageSquare" },
          { href: "/artisan/notifications", label: "Notifications", icon: "Bell" },
          { href: "/artisan/profile", label: "Profile", icon: "User" },
          { href: "/artisan/feedback", label: "Feedback", icon: "MessageCircle" },
          { href: "/artisan/payment-reminders", label: "Payments", icon: "CreditCard" }
        ]
      case "customer":
        return [
          { href: "/products", label: "Products", icon: "Package" },
          { href: "/customer/orders", label: "My Orders", icon: "ShoppingCart" },
          { href: "/customer/profile", label: "Profile", icon: "User" }
        ]
      default:
        return []
    }
  }

  const navLinks = getRoleBasedLinks()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Artisan Marketplace
            </span>
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
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                ))}
                {navLinks.length > 3 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-3 py-2">
                        More
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="center" 
                      side="bottom" 
                      className="w-48 max-h-80 overflow-y-auto z-50"
                      sideOffset={8}
                      alignOffset={0}
                      avoidCollisions={true}
                      collisionPadding={16}
                    >
                      {navLinks.slice(3).map((link) => (
                        <DropdownMenuItem key={link.href} asChild>
                          <Link href={link.href} className="flex items-center w-full">
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
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            <LanguageSelector />
            <ThemeToggle />
            
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
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="hidden md:block text-sm font-medium">
                        {user.name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-56 z-50" 
                    align="end" 
                    side="bottom"
                    sideOffset={8}
                    alignOffset={-4}
                    avoidCollisions={true}
                    collisionPadding={16}
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs leading-none text-primary capitalize">
                          {user.role}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={handleLogin}>
                  Sign in
                </Button>
                <Button onClick={handleLogin}>
                  Get started
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
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
                  className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {!user && (
                <div className="px-4 pt-4 space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => {
                      handleLogin()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Sign in
                  </Button>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      handleLogin()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Get started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
