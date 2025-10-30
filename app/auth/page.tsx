"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Palette, ShoppingBag, ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "customer" as "admin" | "artisan" | "customer"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect based on role
      switch (formData.role) {
        case "admin":
          router.push("/auth/admin");
          break;
        case "artisan":
          router.push("/artisan/dashboard");
          break;
        case "customer":
          router.push("/customer/dashboard");
          break;
      }
    } catch (error) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    {
      value: "customer",
      label: "Customer",
      icon: <ShoppingBag className="h-5 w-5" />,
      description: "Shop for unique handcrafted items"
    },
    {
      value: "artisan",
      label: "Artisan",
      icon: <Palette className="h-5 w-5" />,
      description: "Sell your creative works"
    },
    {
      value: "admin",
      label: "Admin",
      icon: <Shield className="h-5 w-5" />,
      description: "Manage the platform"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center text-muted-foreground hover:text-foreground mb-8 transition-all duration-300 group">
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to home
        </button>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              {isLogin ? "Welcome Back" : "Join Our Community"}
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? "Sign in to your account" : "Create your account to get started"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                I want to join as
              </label>
              <div className="grid grid-cols-1 gap-3">
                {roleOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setFormData(prev => ({ ...prev, role: option.value as any }))}
                    className={`relative flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      formData.role === option.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:border-border/80"
                    }`}>
                    <div className={`p-2 rounded-lg mr-3 ${
                      formData.role === option.value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                    {formData.role === option.value && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Name Field (Sign Up Only) */}
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-11 pr-12 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-md hover:scale-[1.02] disabled:hover:scale-100">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                  {isLogin ? "Signing in..." : "Creating account..."}
                </div>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </Button>

            {/* Toggle Auth Mode */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="font-medium text-primary">
                  {isLogin ? "Sign up" : "Sign in"}
                </span>
              </button>
            </div>

            {/* Role-specific Links */}
            {formData.role === "admin" && (
              <div className="text-center pt-4 border-t border-border">
                <Link 
                  href="/auth/admin"
                  className="text-sm text-primary hover:text-primary/80 transition-colors">
                  Admin? Use secure passcode login →
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
