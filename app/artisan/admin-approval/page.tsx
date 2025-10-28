"use client";

import { useState, useEffect } from "react";
import { 
  Package, 
  Video, 
  Eye, 
  Check, 
  X, 
  Loader, 
  Play,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  image_url: string;
  video_url?: string;
  video_status?: string;
  is_active: boolean;
  user_id: string;
  artisan_name?: string;
  created_at: string;
}

export default function AdminProductApprovalPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [generatingVideo, setGeneratingVideo] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products?limit=100", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        setError(data.error || "Failed to fetch products");
      }
    } catch (error) {
      setError("Failed to load products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkVideoStatus = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/video-status?productId=${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setVideoStatus(prev => ({
          ...prev,
          [productId]: data.videoStatus
        }));
        
        // Update product in list if video is completed
        if (data.videoUrl) {
          setProducts(prev => prev.map(p => 
            p.id === productId 
              ? { ...p, video_url: data.videoUrl, video_status: data.videoStatus }
              : p
          ));
        }
      }
    } catch (error) {
      console.error("Failed to check video status:", error);
    }
  };

  const generateVideo = async (product: Product) => {
    try {
      setGeneratingVideo(product.id);
      setError("");

      const response = await fetch("/api/products/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Video generation started for ${product.name}. This may take 2-5 minutes.`);
        
        // Update product status
        setProducts(prev => prev.map(p => 
          p.id === product.id 
            ? { ...p, video_status: 'PROCESSING' }
            : p
        ));

        // Start polling for status
        const pollInterval = setInterval(() => {
          checkVideoStatus(product.id);
        }, 10000); // Check every 10 seconds

        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
        }, 300000);

      } else {
        setError(data.error || "Failed to generate video");
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      setError("Failed to start video generation");
      console.error(error);
      alert("Failed to start video generation");
    } finally {
      setGeneratingVideo(null);
    }
  };

  const publishProduct = async (productId: string, includeVideo: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          is_active: true,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Product published successfully${includeVideo ? ' with video' : ''}!`);
        fetchPendingProducts();
      } else {
        setError(data.error || "Failed to publish product");
      }
    } catch (error) {
      setError("Failed to publish product");
      console.error(error);
    }
  };

  const rejectProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to reject this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          is_active: false,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Product rejected");
        fetchPendingProducts();
      } else {
        setError(data.error || "Failed to reject product");
      }
    } catch (error) {
      setError("Failed to reject product");
      console.error(error);
    }
  };

  const getVideoStatusColor = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400';
      case 'PROCESSING':
        return 'text-yellow-400';
      case 'FAILED':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getVideoStatusIcon = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Check className="h-4 w-4" />;
      case 'PROCESSING':
        return <Loader className="h-4 w-4 animate-spin" />;
      case 'FAILED':
        return <X className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white flex flex-col items-center">
          <Loader className="h-12 w-12 animate-spin mb-4" />
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center mb-2">
            <Package className="h-8 w-8 mr-3 text-purple-400" />
            Product Approval & Video Generation
          </h1>
          <p className="text-white/70">
            Review artisan products, generate marketing videos, and publish to the platform
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden hover:border-purple-400/50 transition-all"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-white/5">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-white/30" />
                  </div>
                )}
                
                {/* Video Status Badge */}
                {product.video_status && product.video_status !== 'NOT_GENERATED' && (
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm flex items-center space-x-1 ${getVideoStatusColor(product.video_status)}`}>
                    {getVideoStatusIcon(product.video_status)}
                    <span className="text-xs font-medium">
                      {product.video_status}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2 truncate">
                  {product.name}
                </h3>
                
                <p className="text-white/60 text-sm mb-3 line-clamp-2">
                  {product.description || "No description"}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-purple-400 font-bold text-lg">
                    {product.currency} {product.price}
                  </span>
                  <span className="text-white/50 text-xs">
                    {product.category}
                  </span>
                </div>

                {/* Video Actions */}
                <div className="space-y-2 mb-4">
                  {product.video_url ? (
                    <a
                      href={product.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      View Generated Video
                    </a>
                  ) : product.video_status === 'PROCESSING' ? (
                    <button
                      disabled
                      className="w-full flex items-center justify-center px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 rounded-lg cursor-not-allowed"
                    >
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Generating Video...
                    </button>
                  ) : (
                    <button
                      onClick={() => generateVideo(product)}
                      disabled={generatingVideo === product.id}
                      className="w-full flex items-center justify-center px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingVideo === product.id ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Video className="h-4 w-4 mr-2" />
                          Generate Video
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </button>
                  
                  <button
                    onClick={() => publishProduct(product.id, !!product.video_url)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Publish
                  </button>
                  
                  <button
                    onClick={() => rejectProduct(product.id)}
                    className="flex items-center justify-center px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/50 text-lg">No products pending approval</p>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-lg border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-white/50 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {selectedProduct.image_url && (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}

              {selectedProduct.video_url && (
                <video
                  src={selectedProduct.video_url}
                  controls
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              
              <div className="space-y-4 text-white/80">
                <div>
                  <span className="font-semibold">Price:</span> {selectedProduct.currency} {selectedProduct.price}
                </div>
                <div>
                  <span className="font-semibold">Category:</span> {selectedProduct.category}
                </div>
                <div>
                  <span className="font-semibold">Description:</span>
                  <p className="mt-2">{selectedProduct.description}</p>
                </div>
                <div>
                  <span className="font-semibold">Video Status:</span>
                  <span className={`ml-2 ${getVideoStatusColor(selectedProduct.video_status)}`}>
                    {selectedProduct.video_status || 'NOT_GENERATED'}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                {!selectedProduct.video_url && selectedProduct.video_status !== 'PROCESSING' && (
                  <button
                    onClick={() => {
                      generateVideo(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 px-4 py-3 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                  >
                    <Video className="h-4 w-4 inline mr-2" />
                    Generate Video
                  </button>
                )}
                
                <button
                  onClick={() => {
                    publishProduct(selectedProduct.id, !!selectedProduct.video_url);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 px-4 py-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  Publish Product
                </button>
                
                <button
                  onClick={() => {
                    rejectProduct(selectedProduct.id);
                    setSelectedProduct(null);
                  }}
                  className="px-4 py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
