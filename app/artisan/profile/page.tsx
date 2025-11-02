"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, Mail, Phone, Briefcase, FileText, Edit, Camera, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  location?: string;
  origin_place?: string;
  bio?: string;
  artisan_story?: string;
  work_process?: string;
  expertise_areas?: string;
  artistry_description?: string;
  photograph?: string;
  avatar?: string;
  gender?: string;
  documentation_video_url?: string;
  documentation_video_status?: string;
}

export default function ArtisanProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
      const response = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  const getVideoStatusBadge = () => {
    switch (profile.documentation_video_status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-400">
            <Video className="w-3 h-3 mr-1" />
            Video Ready
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 animate-pulse">
            <Video className="w-3 h-3 mr-1" />
            Generating...
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-600 dark:text-red-400">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-600 dark:text-gray-400">
            No Video
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">View your artisan profile information</p>
          </div>
          <Button onClick={() => router.push("/artisan/profile/edit")} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10"></div>
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-20 mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-card bg-muted overflow-hidden">
                  {profile.photograph || profile.avatar ? (
                    <img src={profile.photograph || profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 pt-16 md:pt-12">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                    <p className="text-primary font-medium mt-1">{profile.specialty || "Artisan"}</p>
                  </div>
                  {getVideoStatusBadge()}
                </div>
                {profile.location && (
                  <div className="flex items-center text-muted-foreground mt-3">
                    <MapPin className="h-4 w-4 mr-2" />
                    {profile.location}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground">{profile.email}</p>
                  </div>
                </div>
                {profile.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="text-foreground">{profile.phone}</p>
                    </div>
                  </div>
                )}
                {profile.origin_place && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Origin Place</p>
                      <p className="text-foreground">{profile.origin_place}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Craft Details</h3>
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Specialty</p>
                    <p className="text-foreground">{profile.specialty || "Not specified"}</p>
                  </div>
                </div>
                {profile.expertise_areas && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Expertise Areas</p>
                      <p className="text-foreground">{profile.expertise_areas}</p>
                    </div>
                  </div>
                )}
                {profile.gender && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="text-foreground">{profile.gender}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {profile.bio && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">About</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}
            {profile.artisan_story && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">My Story</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.artisan_story}</p>
              </div>
            )}
            {profile.work_process && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Work Process</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.work_process}</p>
              </div>
            )}
            {profile.artistry_description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Artistry Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.artistry_description}</p>
              </div>
            )}
            {profile.documentation_video_url && profile.documentation_video_status === "COMPLETED" && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Documentation Video</h3>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <video src={profile.documentation_video_url} controls className="w-full h-full">
                    Your browser does not support video playback.
                  </video>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
