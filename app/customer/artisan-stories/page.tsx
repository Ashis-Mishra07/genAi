"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Play, MapPin, Palette, Users, X, Loader } from "lucide-react";

interface Artisan {
  id: string;
  name: string;
  email: string;
  specialty?: string;
  location?: string;
  origin_place?: string;
  bio?: string;
  artisan_story?: string;
  photograph?: string;
  avatar?: string;
  documentation_video_url?: string;
  documentation_video_status?: string;
  gender?: string;
  expertise_areas?: string;
}

export default function ArtisanStoriesPage() {
  const router = useRouter();
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    fetchArtisans();
  }, []);

  const fetchArtisans = async () => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("auth_token");
      const response = await fetch("/api/artisans", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setArtisans(data.artisans || []);
      }
    } catch (error) {
      console.error("Failed to fetch artisans:", error);
    } finally {
      setLoading(false);
    }
  };

  const openVideoModal = (artisan: Artisan) => {
    setSelectedArtisan(artisan);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedArtisan(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading artisan stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <Users className="h-10 w-10 mr-3" />
            <h1 className="text-4xl font-bold">Meet Our Artisans</h1>
          </div>
          <p className="text-orange-100 text-lg">
            Discover the stories, craftsmanship, and passion behind every creation
          </p>
        </div>
      </div>

      {/* Artisans Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {artisans.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              No Artisan Stories Yet
            </h3>
            <p className="text-slate-500">
              Check back soon to discover amazing artisan stories!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisans.map((artisan) => (
              <div
                key={artisan.id}
                className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-orange-500 transition-all duration-300 group cursor-pointer"
                onClick={() => {
                  if (artisan.documentation_video_url && artisan.documentation_video_status === 'COMPLETED') {
                    openVideoModal(artisan);
                  }
                }}
              >
                {/* Artisan Image */}
                <div className="relative h-64 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
                  {artisan.photograph || artisan.avatar ? (
                    <img
                      src={artisan.photograph || artisan.avatar}
                      alt={artisan.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-4xl font-bold">
                        {artisan.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    </div>
                  )}
                  
                  {/* Play Button Overlay */}
                  {artisan.documentation_video_url && artisan.documentation_video_status === 'COMPLETED' && (
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                      <div className="bg-orange-500 rounded-full p-5 group-hover:scale-110 transition-transform duration-300">
                        <Play className="h-8 w-8 text-white fill-white" />
                      </div>
                    </div>
                  )}

                  {/* Video Status Badge */}
                  {artisan.documentation_video_status === 'PROCESSING' && (
                    <div className="absolute top-4 right-4 bg-yellow-500/90 text-yellow-900 px-3 py-1 rounded-full text-xs font-medium">
                      Video Processing...
                    </div>
                  )}
                  {!artisan.documentation_video_url && artisan.documentation_video_status === 'NOT_GENERATED' && (
                    <div className="absolute top-4 right-4 bg-slate-700/90 text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
                      Story Coming Soon
                    </div>
                  )}
                </div>

                {/* Artisan Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                    {artisan.name}
                  </h3>
                  
                  {artisan.specialty && (
                    <div className="flex items-center text-orange-400 mb-2">
                      <Palette className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">{artisan.specialty}</span>
                    </div>
                  )}

                  {(artisan.location || artisan.origin_place) && (
                    <div className="flex items-center text-slate-400 mb-3">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{artisan.origin_place || artisan.location}</span>
                    </div>
                  )}

                  {artisan.bio && (
                    <p className="text-slate-300 text-sm line-clamp-3 mb-4">
                      {artisan.bio}
                    </p>
                  )}

                  {artisan.expertise_areas && (
                    <div className="flex flex-wrap gap-2">
                      {artisan.expertise_areas.split(',').slice(0, 3).map((expertise, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs"
                        >
                          {expertise.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {artisan.documentation_video_url && artisan.documentation_video_status === 'COMPLETED' && (
                    <button className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                      <Play className="h-4 w-4 mr-2" />
                      Watch Their Story
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedArtisan && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeVideoModal}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeVideoModal}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-900/80 hover:bg-slate-900 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Video Player */}
            <div className="aspect-video bg-black">
              <video
                src={selectedArtisan.documentation_video_url}
                controls
                autoPlay
                className="w-full h-full"
                poster={selectedArtisan.photograph || selectedArtisan.avatar}
              >
                Your browser does not support video playback.
              </video>
            </div>

            {/* Artisan Info Below Video */}
            <div className="p-6 bg-slate-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedArtisan.name}
                  </h2>
                  {selectedArtisan.specialty && (
                    <div className="flex items-center text-orange-400 mb-2">
                      <Palette className="h-5 w-5 mr-2" />
                      <span className="font-medium">{selectedArtisan.specialty}</span>
                    </div>
                  )}
                  {(selectedArtisan.origin_place || selectedArtisan.location) && (
                    <div className="flex items-center text-slate-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {selectedArtisan.origin_place || selectedArtisan.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedArtisan.artisan_story && (
                <div className="mb-4">
                  <h3 className="text-white font-semibold mb-2">Their Story</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {selectedArtisan.artisan_story}
                  </p>
                </div>
              )}

              {selectedArtisan.expertise_areas && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedArtisan.expertise_areas.split(',').map((expertise, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm"
                      >
                        {expertise.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => router.push(`/customer/products?artisan=${selectedArtisan.id}`)}
                className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                View {selectedArtisan.name}'s Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
