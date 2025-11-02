"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Camera,
  Save,
  ArrowLeft,
  Loader,
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
  gender?: string;
  origin_place?: string;
  artisan_story?: string;
  work_process?: string;
  expertise_areas?: string;
  artistry_description?: string;
}

export default function EditArtisanProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ArtisanProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    specialty: "",
    location: "",
    bio: "",
    avatar: "",
    photograph: "",
    gender: "",
    origin_place: "",
    artisan_story: "",
    work_process: "",
    expertise_areas: "",
    artistry_description: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photographFile, setPhotographFile] = useState<File | null>(null);
  const [photographPreview, setPhotographPreview] = useState<string>("");

  const loadProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
      if (!token) {
        router.push("/auth/artisan");
        return;
      }

      const response = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load profile");
      }

      const data = await response.json();
      setProfile(data.user);
      if (data.user.photograph) {
        setPhotographPreview(data.user.photograph);
      }
    } catch (err) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setError("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
      if (!token) {
        router.push("/auth/artisan");
        return;
      }

      let photographUrl = profile.photograph;

      // Upload photograph if a new one was selected
      if (photographFile) {
        setIsUploadingPhoto(true);
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
        } else {
          throw new Error("Failed to upload photograph");
        }
        setIsUploadingPhoto(false);
      }

      // Update profile with new photograph URL
      const updatePayload = {
        ...profile,
        photograph: photographUrl,
      };

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const data = await response.json();
      setProfile(data.user);
      setSuccess("Profile updated successfully!");
      setPhotographFile(null);
      
      // Redirect back to profile page after 1 second
      setTimeout(() => {
        router.push("/artisan/profile");
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/artisan/profile")}
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Update your artisan profile and documentation details
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg p-4">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 rounded-lg p-4">
              {success}
            </div>
          )}

          {/* Profile Form */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photograph Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden mb-4 border-2 border-border">
                    {photographPreview || profile.photograph || profile.avatar ? (
                      <img
                        src={photographPreview || profile.photograph || profile.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">No photo</p>
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="photograph"
                    className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 transition-colors cursor-pointer"
                  >
                    <Camera className="h-5 w-5" />
                    <input
                      type="file"
                      id="photograph"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {isUploadingPhoto && (
                  <p className="text-sm text-muted-foreground">Uploading photo...</p>
                )}
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Click camera icon to upload a new photograph
                </p>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={profile.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">
                      Specialty *
                    </label>
                    <input
                      type="text"
                      name="specialty"
                      value={profile.specialty}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-foreground text-sm font-medium mb-2">
                      Origin Place
                    </label>
                    <input
                      type="text"
                      name="origin_place"
                      value={profile.origin_place}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Where are you from?"
                    />
                  </div>
                </div>
              </div>

              {/* About & Story */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  About & Story
                </h3>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Brief introduction about yourself"
                  />
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Artisan Story
                  </label>
                  <textarea
                    name="artisan_story"
                    value={profile.artisan_story}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Your journey as an artisan, your passion, and inspiration"
                  />
                </div>
              </div>

              {/* Craft Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Craft Details
                </h3>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Artistry Description
                  </label>
                  <textarea
                    name="artistry_description"
                    value={profile.artistry_description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Describe your craft specialization and techniques"
                  />
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Work Process
                  </label>
                  <textarea
                    name="work_process"
                    value={profile.work_process}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Describe your step-by-step creation process"
                  />
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Expertise Areas
                  </label>
                  <input
                    type="text"
                    name="expertise_areas"
                    value={profile.expertise_areas}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Comma-separated areas of expertise"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => router.push("/artisan/profile")}
                  className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader className="h-5 w-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
