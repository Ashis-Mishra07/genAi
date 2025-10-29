"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/hooks";
import { useTranslateContent } from "@/lib/hooks/useTranslateContent";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Camera,
  Save,
  Palette,
  Video,
  Play,
  Loader2,
} from "lucide-react";

interface ArtisanProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  photograph?: string;
  documentation_video_url?: string;
  documentation_video_status?: string;
  gender?: string;
  origin_place?: string;
  artisan_story?: string;
  artistry_description?: string;
  work_process?: string;
  expertise_areas?: string;
}

export default function ArtisanProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { translateText, isHindi } = useTranslateContent();
  const [profile, setProfile] = useState<ArtisanProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    specialty: "",
    location: "",
    bio: "",
    avatar: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [videoSuccess, setVideoSuccess] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photographPreview, setPhotographPreview] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/auth/artisan");
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load profile");
      }

      const data = await response.json();
      setProfile(data.user);
    } catch (error) {
      setError("Failed to load profile");
      console.error("Profile load error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotographPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary via API
    setIsUploadingPhoto(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'artisan_photographs');
      formData.append('tags', 'artisan,profile,photograph');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      
      if (uploadData.success && uploadData.url) {
        // Update database immediately
        const token = localStorage.getItem("auth_token");
        const updateResponse = await fetch("/api/auth/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...profile,
            photograph: uploadData.url,
          }),
        });

        if (updateResponse.ok) {
          const data = await updateResponse.json();
          setProfile(data.user);
          setSuccess('✅ Photo uploaded and saved successfully!');
        } else {
          throw new Error('Failed to save photo to database');
        }
      } else {
        throw new Error(uploadData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      setError('❌ Failed to upload photo: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/auth/artisan");
        return;
      }

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccess(
        isHindi
          ? "प्रोफाइल सफलतापूर्वक अपडेट हो गया!"
          : "Profile updated successfully!"
      );
    } catch (error) {
      setError(
        isHindi ? "प्रोफाइल अपडेट करने में विफल" : "Failed to update profile"
      );
      console.error("Profile update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    setVideoError("");
    setVideoSuccess("");

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/auth/artisan");
        return;
      }

      const response = await fetch("/api/artisan/generate-documentation-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ artisanId: profile.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate video");
      }

      setVideoSuccess(
        "🎬 Video generation started! This will take 2-3 minutes. Your video will appear here automatically."
      );
      
      // Update status to PROCESSING
      setProfile({ ...profile, documentation_video_status: 'PROCESSING' });
      
      // Start polling for video status
      pollVideoStatus();
    } catch (error) {
      setVideoError(
        error instanceof Error ? error.message : "Failed to generate video"
      );
      console.error("Video generation error:", error);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const pollVideoStatus = () => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user.documentation_video_status === 'COMPLETED') {
            setProfile(data.user);
            setVideoSuccess("✅ Your documentation video is ready!");
            clearInterval(interval);
          } else if (data.user.documentation_video_status === 'FAILED') {
            setVideoError("❌ Video generation failed. Please try again.");
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error("Error polling video status:", error);
      }
    }, 10000); // Poll every 10 seconds

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">
            {isHindi ? "प्रोफाइल लोड हो रहा है..." : "Loading profile..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            {isHindi ? "प्रोफाइल सेटिंग्स" : "Profile Settings"}
          </h1>
          <div className="flex items-center text-slate-400">
            <User className="h-5 w-5 mr-2" />
            <span>
              {isHindi ? "अपना खाता प्रबंधित करें" : "Manage your account"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Documentation Video Card */}
          <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 border border-orange-500/30 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <Video className="h-8 w-8 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  🎬 Your Artisan Story Video
                </h3>
                <p className="text-slate-300 text-sm mb-6">
                  Share your craft journey with customers through an AI-generated documentary video
                </p>

                <button
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGeneratingVideo ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating Your Story...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      Generate My Documentation Video
                    </>
                  )}
                </button>

                {/* Success/Error Messages */}
                {videoSuccess && (
                  <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mt-4">
                    {videoSuccess}
                  </div>
                )}

                {videoError && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mt-4">
                    {videoError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {photographPreview || profile.photograph || profile.avatar ? (
                      <img
                        src={photographPreview || profile.photograph || profile.avatar}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      profile.name.charAt(0).toUpperCase() || "A"
                    )}
                  </div>
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 transition-colors cursor-pointer">
                    {isUploadingPhoto ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-slate-400 text-xs mt-2">Click camera icon to upload photo</p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    {isHindi ? "पूरा नाम *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder={
                      isHindi
                        ? "अपना पूरा नाम दर्ज करें"
                        : "Enter your full name"
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    {isHindi ? "ईमेल पता *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder={
                      isHindi ? "अपना ईमेल दर्ज करें" : "Enter your email"
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    {isHindi ? "फोन नंबर" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder={
                      isHindi
                        ? "अपना फोन नंबर दर्ज करें"
                        : "Enter your phone number"
                    }
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    <Palette className="h-4 w-4 inline mr-1" />
                    {isHindi ? "विशेषता" : "Specialty"}
                  </label>
                  <input
                    type="text"
                    name="specialty"
                    value={profile.specialty || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder={
                      isHindi
                        ? "जैसे: मिट्टी के बर्तन, आभूषण, लकड़ी का काम"
                        : "e.g., Pottery, Jewelry, Woodworking"
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {isHindi ? "स्थान" : "Location"}
                </label>
                <input
                  type="text"
                  name="location"
                  value={profile.location || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={
                    isHindi
                      ? "अपना शहर या क्षेत्र दर्ज करें"
                      : "Enter your city or region"
                  }
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  {isHindi ? "बायो" : "Bio"}
                </label>
                <textarea
                  name="bio"
                  value={profile.bio || ""}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                  placeholder={
                    isHindi
                      ? "ग्राहकों को अपनी कलाकारी और अनुभव के बारे में बताएं..."
                      : "Tell customers about your craft and experience..."
                  }
                />
              </div>

              {/* Documentation Fields */}
              <div className="border-t border-slate-600 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  📝 Documentation Details (for AI Video Generation)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={profile.gender || ""}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Origin Place
                    </label>
                    <input
                      type="text"
                      name="origin_place"
                      value={profile.origin_place || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      placeholder="e.g., Jaipur, Rajasthan"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Artisan Story
                  </label>
                  <textarea
                    name="artisan_story"
                    value={profile.artisan_story || ""}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                    placeholder="Tell your personal journey in the craft... heritage, family tradition, passion..."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Artistry Description
                  </label>
                  <textarea
                    name="artistry_description"
                    value={profile.artistry_description || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                    placeholder="Describe your unique craft style and techniques..."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Work Process
                  </label>
                  <textarea
                    name="work_process"
                    value={profile.work_process || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                    placeholder="Explain your creation process step by step..."
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Expertise Areas
                  </label>
                  <input
                    type="text"
                    name="expertise_areas"
                    value={profile.expertise_areas || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="e.g., Meenakari, Kundan work, Stone setting (comma separated)"
                  />
                </div>
              </div>

              {/* Error and Success Messages */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isHindi ? "सेव हो रहा है..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    {isHindi ? "प्रोफाइल अपडेट करें" : "Update Profile"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
