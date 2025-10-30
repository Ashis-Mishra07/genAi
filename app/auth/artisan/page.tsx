"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";

type AuthMode = "signin" | "signup";

export default function ArtisanAuthPage() {
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
    specialty: "",
    location: "",
    bio: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "signin" ? "/api/auth/signin" : "/api/auth/signup";
      const payload =
        mode === "signin"
          ? {
              email: formData.email,
              password: formData.password,
              role: "ARTISAN",
            }
          : { ...formData, role: "ARTISAN" };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `${mode === "signin" ? "Sign in" : "Sign up"} failed`
        );
      }

      // Store the tokens and redirect to artisan dashboard
      localStorage.setItem("auth_token", data.data.accessToken);
      localStorage.setItem("refresh_token", data.data.refreshToken);
      localStorage.setItem("user_role", "ARTISAN");
      localStorage.setItem("user_id", data.data.user.id);

      router.push("/artisan/dashboard");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-muted-foreground hover:text-foreground mb-8 transition-all duration-300 group">
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to role selection
        </button>

        {/* Artisan Auth Card */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Palette className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              {mode === "signin"
                ? "Welcome Back, Artisan!"
                : "Join Our Artisan Community"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "signin"
                ? "Sign in to showcase your crafts"
                : "Share your craft with the world"}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-muted/30 rounded-xl p-1 mb-8">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === "signin"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}>
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === "signup"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}>
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground">
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
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="artisan@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground">
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
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Sign Up Fields */}
            {mode === "signup" && (
              <>
                {/* Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground">
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
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      placeholder="Your full name"
                      required={mode === "signup"}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-foreground">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <label
                    htmlFor="specialty"
                    className="block text-sm font-medium text-foreground">
                    Craft Specialty
                  </label>
                  <div className="relative">
                    <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      id="specialty"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      placeholder="e.g., Pottery, Textile, Jewelry"
                      required={mode === "signup"}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-foreground">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      placeholder="City, State, Country"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-foreground">
                    Brief Bio
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all duration-200"
                      placeholder="Tell customers about your craft and heritage..."
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                  {mode === "signin" ? "Signing In..." : "Creating Account..."}
                </div>
              ) : mode === "signin" ? (
                "Sign In to Dashboard"
              ) : (
                "Create Artisan Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
