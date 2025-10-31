"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/hooks";
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
import { GoogleLoaderWithText, GoogleLoaderInline } from '@/components/ui/google-loader';

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
  const { t } = useTranslation();
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
                    <GoogleLoaderWithText size="xl" text="Loading profile..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t('profileSettings')}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t('manageYourAccount')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Profile Form */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-lg">
                    {profile.avatar ? (
                      <Image
                        src={profile.avatar}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      profile.name.charAt(0).toUpperCase() || "A"
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-2 right-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-center mt-4">
                  <h3 className="text-lg font-semibold text-foreground">Profile Photo</h3>
                  <p className="text-sm text-muted-foreground">Update your avatar to personalize your profile</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center text-foreground text-sm font-medium">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    {t('fullName')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    placeholder={t('enterFullName')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-foreground text-sm font-medium">
                    <Mail className="h-4 w-4 mr-2 text-primary" />
                    {t('emailAddress')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    placeholder={t('enterEmail')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-foreground text-sm font-medium">
                    <Phone className="h-4 w-4 mr-2 text-primary" />
                    {t('phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    placeholder={t('enterPhoneNumber')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-foreground text-sm font-medium">
                    <Palette className="h-4 w-4 mr-2 text-primary" />
                    {t('specialty')}
                  </label>
                  <input
                    type="text"
                    name="specialty"
                    value={profile.specialty || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    placeholder={t('specialtyPlaceholder')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-foreground text-sm font-medium">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  {t('location')}
                </label>
                <input
                  type="text"
                  name="location"
                  value={profile.location || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder={t('enterLocation')}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-foreground text-sm font-medium">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  {t('bio')}
                </label>
                <textarea
                  name="bio"
                  value={profile.bio || ""}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all duration-200"
                  placeholder={t('bioPlaceholder')}
                />
              </div>

              {/* Error and Success Messages */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md hover:scale-[1.02] transform">
                {isSaving ? (
                  <>
                    <GoogleLoaderInline size="sm" />
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    {t('updateProfile')}
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
