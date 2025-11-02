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
  Upload,
  Image as ImageIcon,
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
    gender: "",
    originPlace: "",
    artisanStory: "",
    workProcess: "",
    expertiseAreas: "",
    artistryDescription: "",
  });
  const [photographFile, setPhotographFile] = useState<File | null>(null);
  const [photographPreview, setPhotographPreview] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "signin" ? "/api/auth/signin" : "/api/auth/signup";

      if (mode === "signin") {
        // Sign in - simple JSON payload
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            role: "ARTISAN",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Sign in failed");
        }

        // Store the tokens and redirect to artisan dashboard
        localStorage.setItem("auth_token", data.data.accessToken);
        localStorage.setItem("refresh_token", data.data.refreshToken);
        localStorage.setItem("user_role", "ARTISAN");
        localStorage.setItem("user_id", data.data.user.id);

        router.push("/artisan/dashboard");
      } else {
        // Sign up - upload photograph first if provided
        let photographUrl = "";

        if (photographFile) {
          console.log("📸 Uploading photograph...");
          const uploadFormData = new FormData();
          uploadFormData.append("file", photographFile);
          uploadFormData.append("folder", "artisan-photos");

          const uploadResponse = await fetch("/api/upload/photograph", {
            method: "POST",
            body: uploadFormData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            photographUrl = uploadData.url;
            console.log("✅ Photograph uploaded:", photographUrl);
          } else {
            const errorData = await uploadResponse.json();
            console.error("❌ Failed to upload photograph:", errorData);
            throw new Error("Failed to upload photograph. Please try again.");
          }
        } else {
          console.warn("⚠️ No photograph file selected");
        }

        // Sign up with all artisan data
        const signUpPayload = {
          ...formData,
          role: "ARTISAN",
          photograph: photographUrl,
        };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signUpPayload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Sign up failed");
        }

        // Store the tokens and redirect to artisan dashboard
        localStorage.setItem("auth_token", data.data.accessToken);
        localStorage.setItem("refresh_token", data.data.refreshToken);
        localStorage.setItem("user_role", "ARTISAN");
        localStorage.setItem("user_id", data.data.user.id);

        router.push("/artisan/dashboard");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotographFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotographPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background/50 backdrop-blur-md flex items-center justify-center p-4 py-12 relative">
      {/* Background overlay for better blur effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-background/80 to-orange-500/5" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to role selection
        </button>

        {/* Artisan Auth Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Palette className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {mode === "signin"
                ? "Welcome Back, Artisan!"
                : "Join Our Artisan Community"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "signin"
                ? "Sign in to showcase your crafts and connect with customers"
                : "Share your craft with the world and build your brand"}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === "signin"
                  ? "bg-orange-600 text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-orange-600 text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all"
                    placeholder="artisan@example.com"
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
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sign Up Fields */}
            {mode === "signup" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all"
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
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Specialty */}
                  <div>
                    <label
                      htmlFor="specialty"
                      className="block text-sm font-medium text-foreground mb-2">
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
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all"
                        placeholder="e.g., Pottery, Weaving, Jewelry"
                        required={mode === "signup"}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-foreground mb-2">
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
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all"
                        placeholder="City, State"
                        required={mode === "signup"}
                      />
                    </div>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Gender
                  </label>
                  <div className="flex space-x-4">
                    {["Male", "Female", "Other"].map((genderOption) => (
                      <label key={genderOption} className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value={genderOption}
                          checked={formData.gender === genderOption}
                          onChange={handleInputChange}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-foreground">
                          {genderOption}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Photograph Upload */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Profile Photograph (Optional)
                  </label>
                  <div className="flex items-center space-x-4">
                    {photographPreview && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-border">
                        <img
                          src={photographPreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <label htmlFor="photograph" className="cursor-pointer">
                      <div className="flex items-center justify-center px-4 py-3 bg-muted border border-border rounded-xl text-foreground hover:bg-muted/70 transition-colors">
                        <Upload className="h-5 w-5 mr-2" />
                        Choose Photo
                      </div>
                      <input
                        type="file"
                        id="photograph"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-foreground mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all resize-none"
                    placeholder="Tell customers about yourself and your craft..."
                  />
                </div>

                {/* Additional Fields */}
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="originPlace"
                      className="block text-sm font-medium text-foreground mb-2">
                      Origin Place
                    </label>
                    <input
                      type="text"
                      id="originPlace"
                      name="originPlace"
                      value={formData.originPlace}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all"
                      placeholder="Where your craft tradition originates"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="expertiseAreas"
                      className="block text-sm font-medium text-foreground mb-2">
                      Expertise Areas
                    </label>
                    <input
                      type="text"
                      id="expertiseAreas"
                      name="expertiseAreas"
                      value={formData.expertiseAreas}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all"
                      placeholder="e.g., Traditional pottery, Modern ceramics"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="artistryDescription"
                      className="block text-sm font-medium text-foreground mb-2">
                      Artistry Description
                    </label>
                    <textarea
                      id="artistryDescription"
                      name="artistryDescription"
                      value={formData.artistryDescription}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all resize-none"
                      placeholder="Describe your artistic style and approach..."
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {mode === "signin" ? "Signing In..." : "Creating Account..."}
                </div>
              ) : mode === "signin" ? (
                "🎨 Sign In to Create"
              ) : (
                "✨ Join Artisan Community"
              )}
            </button>
          </form>

          {/* Features Preview */}
          <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border">
            <h4 className="text-foreground font-semibold mb-3 flex items-center">
              <Palette className="h-4 w-4 mr-2 text-orange-600 dark:text-orange-400" />
              Artisan Benefits
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Showcase your crafts</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>AI-powered stories</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Connect with customers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Global marketplace</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
