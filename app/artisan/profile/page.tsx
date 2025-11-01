"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDynamicTranslation } from "@/lib/i18n/useDynamicTranslation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Camera,
  Save,
  Palette,
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
}

export default function ArtisanProfilePage() {
  const router = useRouter();
  const { t, translateBatch, currentLocale } = useDynamicTranslation();
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

  // Pre-load translations
  useEffect(() => {
    translateBatch([
      "My Profile",
      "Manage your artisan profile and information",
      "Loading profile...",
      "Full Name",
      "Email Address",
      "Phone Number",
      "Specialty",
      "Location",
      "Bio",
      "Profile Picture",
      "Change Photo",
      "Save Changes",
      "Saving...",
      "Profile updated successfully",
      "Failed to update profile",
      "Profile Information",
      "Update your account details",
    ]);
  }, [currentLocale, translateBatch]);

  const loadProfile = useCallback(async () => {
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
        throw new Error(t('failedToLoadProfile'));
      }

      const data = await response.json();
      setProfile(data.user);
    } catch (error) {
      setError(t('failedToLoadProfile'));
      console.error("Profile load error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router, t]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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

      setSuccess(t('profileUpdatedSuccessfully'));
    } catch (error) {
      setError(t('failedToUpdateProfile'));
      console.error("Profile update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {t('Loading profile...')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            {t('My Profile')}
          </h1>
          <div className="flex items-center text-muted-foreground">
            <User className="h-5 w-5 mr-2" />
            <span>
              {t('Manage your artisan profile and information')}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Profile Form */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4">
                    {profile.avatar ? (
                      <Image
                        src={profile.avatar}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      profile.name.charAt(0).toUpperCase() || "A"
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    {t('Full Name')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder={t('Full Name')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    {t('Email Address')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder={t('Email Address')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    {t('Phone Number')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder={t('Phone Number')}
                  />
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    <Palette className="h-4 w-4 inline mr-1" />
                    {t('Specialty')}
                  </label>
                  <input
                    type="text"
                    name="specialty"
                    value={profile.specialty || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder={t('Specialty')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {t('Location')}
                </label>
                <input
                  type="text"
                  name="location"
                  value={profile.location || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder={t('Location')}
                />
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  {t('Bio')}
                </label>
                <textarea
                  name="bio"
                  value={profile.bio || ""}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder={t('Bio')}
                />
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
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl">
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                    {t('Saving...')}
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    {t('Save Changes')}
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
