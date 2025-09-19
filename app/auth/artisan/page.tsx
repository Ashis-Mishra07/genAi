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
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-white/70 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to role selection
        </button>

        {/* Artisan Auth Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="h-8 w-8 text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {mode === "signin"
                ? "Welcome Back, Artisan!"
                : "Join Our Artisan Community"}
            </h1>
            <p className="text-white/70">
              {mode === "signin"
                ? "Sign in to showcase your crafts"
                : "Share your craft with the world"}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-white/5 rounded-lg p-1 mb-6">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === "signin"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}>
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}>
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="artisan@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="block text-sm font-medium text-white/80 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Your full name"
                      required={mode === "signup"}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-white/80 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                {/* Specialty */}
                <div>
                  <label
                    htmlFor="specialty"
                    className="block text-sm font-medium text-white/80 mb-2">
                    Craft Specialty
                  </label>
                  <div className="relative">
                    <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                    <input
                      type="text"
                      id="specialty"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., Pottery, Textile, Jewelry"
                      required={mode === "signup"}
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-white/80 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="City, State, Country"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-white/80 mb-2">
                    Brief Bio
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      placeholder="Tell customers about your craft and heritage..."
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
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
