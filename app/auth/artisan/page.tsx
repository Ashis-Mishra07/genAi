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
          const uploadFormData = new FormData();
          uploadFormData.append("file", photographFile);
          uploadFormData.append("upload_preset", "artisan_photos");

          const uploadResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'swasthik'}/image/upload`,
            {
              method: "POST",
              body: uploadFormData,
            }
          );

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            photographUrl = uploadData.secure_url;
          }
        }

        // Create signup payload
        const signupPayload = {
          ...formData,
          role: "ARTISAN",
          photograph: photographUrl,
          origin_place: formData.originPlace,
          artisan_story: formData.artisanStory,
          work_process: formData.workProcess,
          expertise_areas: formData.expertiseAreas,
          artistry_description: formData.artistryDescription,
        };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signupPayload),
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handlePhotographChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotographFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotographPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
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

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Gender
                  </label>
                  <div className="flex gap-4">
                    {["Male", "Female", "Other"].map((genderOption) => (
                      <label
                        key={genderOption}
                        className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value={genderOption}
                          checked={formData.gender === genderOption}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-orange-500 bg-white/5 border-white/20 focus:ring-orange-500 focus:ring-2"
                        />
                        <span className="ml-2 text-white/80">{genderOption}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Photograph Upload */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Your Photograph (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    {photographPreview ? (
                      <div className="relative">
                        <img
                          src={photographPreview}
                          alt="Preview"
                          className="w-24 h-24 rounded-lg object-cover border-2 border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotographFile(null);
                            setPhotographPreview("");
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-white/40" />
                      </div>
                    )}
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotographChange}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/80 hover:bg-white/10 cursor-pointer transition-colors">
                        <Upload className="h-5 w-5 mr-2" />
                        {photographFile ? "Change Photo" : "Upload Photo"}
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    Used for your artisan story video. Shows your face in the documentation.
                  </p>
                </div>

                {/* Origin Place */}
                <div>
                  <label
                    htmlFor="originPlace"
                    className="block text-sm font-medium text-white/80 mb-2">
                    Where Are You From?
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                    <input
                      type="text"
                      id="originPlace"
                      name="originPlace"
                      value={formData.originPlace}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Your hometown or village"
                    />
                  </div>
                </div>

                {/* Artisan Story */}
                <div>
                  <label
                    htmlFor="artisanStory"
                    className="block text-sm font-medium text-white/80 mb-2">
                    Your Story & Journey
                  </label>
                  <textarea
                    id="artisanStory"
                    name="artisanStory"
                    value={formData.artisanStory}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Share your journey as an artisan, your struggles, inspiration, and what drives your passion for this craft..."
                  />
                  <p className="text-xs text-white/50 mt-1">
                    This will be featured in your artisan documentation video
                  </p>
                </div>

                {/* Artistry Description */}
                <div>
                  <label
                    htmlFor="artistryDescription"
                    className="block text-sm font-medium text-white/80 mb-2">
                    Describe Your Craft
                  </label>
                  <textarea
                    id="artistryDescription"
                    name="artistryDescription"
                    value={formData.artistryDescription}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Describe the unique aspects of your craft, techniques you use, materials, etc."
                  />
                </div>

                {/* Work Process */}
                <div>
                  <label
                    htmlFor="workProcess"
                    className="block text-sm font-medium text-white/80 mb-2">
                    How Do You Create Your Products?
                  </label>
                  <textarea
                    id="workProcess"
                    name="workProcess"
                    value={formData.workProcess}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Explain your creative process from start to finish..."
                  />
                </div>

                {/* Expertise Areas */}
                <div>
                  <label
                    htmlFor="expertiseAreas"
                    className="block text-sm font-medium text-white/80 mb-2">
                    Areas of Expertise
                  </label>
                  <input
                    type="text"
                    id="expertiseAreas"
                    name="expertiseAreas"
                    value={formData.expertiseAreas}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Hand weaving, Natural dyes, Traditional patterns"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    Separate multiple areas with commas
                  </p>
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
