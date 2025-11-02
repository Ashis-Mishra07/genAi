"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowLeft, Mail, Lock, User, Phone } from "lucide-react";
import Pattern from "@/components/ui/bg";

type AuthMode = "signin" | "signup";

export default function CustomerAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Clear any existing tokens before login/signup
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_id");
      localStorage.removeItem("auth_token");

      const endpoint =
        mode === "signin" ? "/api/auth/signin" : "/api/auth/signup";
      const payload =
        mode === "signin"
          ? {
              email: formData.email,
              password: formData.password,
              role: "CUSTOMER",
            }
          : { ...formData, role: "CUSTOMER" };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: Include cookies
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `${mode === "signin" ? "Sign in" : "Sign up"} failed`
        );
      }

      // Store the tokens in localStorage (backup to cookies)
      if (data.data && data.data.accessToken) {
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("user_role", "CUSTOMER");
        localStorage.setItem("user_id", data.data.user.id);

        console.log(
          "Auth success - User ID:",
          data.data.user.id,
          "Role:",
          data.data.user.role
        );
      }

      router.push("/customer/dashboard");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  return (
    <div className="min-h-screen bg-background/50 backdrop-blur-md flex items-center justify-center p-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <Pattern />
      </div>
      {/* Background overlay for better blur effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-background/80 to-green-500/5" />

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to role selection
        </button>

        {/* Customer Auth Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {mode === "signin" ? "Welcome Back!" : "Join the Marketplace"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "signin"
                ? "Sign in to discover amazing crafts"
                : "Discover unique handmade treasures"}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === "signin"
                  ? "bg-green-600 text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-green-600 text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500/50 transition-all"
                  placeholder="customer@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Sign Up Fields */}
            {mode === "signup" && (
              <>
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500/50 transition-all"
                      placeholder="Your full name"
                      required={mode === "signup"}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-foreground mb-2">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500/50 transition-all"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {mode === "signin" ? "Signing In..." : "Creating Account..."}
                </div>
              ) : mode === "signin" ? (
                "🛍️ Sign In to Browse"
              ) : (
                "✨ Create Customer Account"
              )}
            </button>
          </form>

          {/* Features Preview */}
          <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border">
            <h4 className="text-foreground font-semibold mb-3 flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
              Customer Benefits
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Browse unique products</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Chat with artisans</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Cultural stories</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure ordering</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
