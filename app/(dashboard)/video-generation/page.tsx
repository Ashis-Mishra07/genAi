'use client';

import { useState, useEffect } from 'react';
import { Video, Play, Loader, Eye, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  videoUrl?: string;
  videoStatus?: string;
  createdAt: string;
}

export default function AdminVideoGenerationPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [generatingVideo, setGeneratingVideo] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<{ [key: string]: string }>({});

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      console.log('Products fetched:', data.products); // Debug log
      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Poll for video status updates
  useEffect(() => {
    const interval = setInterval(() => {
      products.forEach(async (product) => {
        if (product.videoStatus === 'PROCESSING') {
          try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/products/video-status?productId=${product.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.videoStatus !== 'PROCESSING') {
                // Refresh products list when status changes
                fetchProducts();
              }
            }
          } catch (error) {
            console.error('Error checking video status:', error);
          }
        }
      });
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [products]);

  const handleGenerateVideo = async (productId: string) => {
    setGeneratingVideo(productId);
    setVideoStatus(prev => ({ ...prev, [productId]: 'PROCESSING' }));

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/products/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate video');
      }

      const data = await response.json();
      console.log('Video generation started:', data);

      // Refresh products to show updated status
      await fetchProducts();
      
      alert('Video generation started! This will take a few minutes. The status will update automatically.');
    } catch (err) {
      console.error('Error generating video:', err);
      alert(err instanceof Error ? err.message : 'Failed to start video generation');
      setVideoStatus(prev => ({ ...prev, [productId]: 'FAILED' }));
    } finally {
      setGeneratingVideo(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Video Ready
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse">
            <Clock className="h-3 w-3 mr-1 animate-spin" />
            Generating...
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
            <AlertCircle className="h-3 w-3 mr-1" />
            No Video
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Video className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">AI Video Generation</h1>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                fetchProducts();
              }}
              className="flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Loader className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
          <p className="text-muted-foreground text-lg mb-4">
            Generate AI-powered product demonstration videos using Google Vertex AI Veo 3
          </p>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <p className="text-blue-600 dark:text-blue-400 text-sm">
              💡 <strong>How it works:</strong> Click "Generate Video" to create a 7-second professional product demonstration video showing a person using or wearing the product. Videos are generated using Google's Vertex AI Veo 3 model.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <p className="text-muted-foreground text-sm mb-1">Total Products</p>
            <p className="text-3xl font-bold text-foreground">{products.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <p className="text-muted-foreground text-sm mb-1">Videos Ready</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {products.filter(p => p.videoStatus === 'COMPLETED').length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <p className="text-muted-foreground text-sm mb-1">Processing</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {products.filter(p => p.videoStatus === 'PROCESSING').length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <p className="text-muted-foreground text-sm mb-1">No Video</p>
            <p className="text-3xl font-bold text-muted-foreground">
              {products.filter(p => !p.videoStatus || p.videoStatus === 'NOT_GENERATED').length}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-muted">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(product.videoStatus)}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {product.description || 'No description'}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-foreground font-bold">₹{product.price}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {product.videoStatus === 'COMPLETED' && product.videoUrl ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="w-full flex items-center justify-center px-4 py-3 bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-500 dark:hover:bg-green-400 transition-colors"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch Video
                      </button>
                      <button
                        onClick={() => handleGenerateVideo(product.id)}
                        disabled={generatingVideo === product.id}
                        className="w-full flex items-center justify-center px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingVideo === product.id ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <Video className="h-4 w-4 mr-2" />
                            Regenerate Video
                          </>
                        )}
                      </button>
                    </div>
                  ) : product.videoStatus === 'PROCESSING' ? (
                    <button
                      disabled
                      className="w-full flex items-center justify-center px-4 py-3 bg-yellow-600/50 dark:bg-yellow-500/50 text-white rounded-xl cursor-not-allowed"
                    >
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Generating Video...
                    </button>
                  ) : (
                    <button
                      onClick={() => handleGenerateVideo(product.id)}
                      disabled={generatingVideo === product.id}
                      className="w-full flex items-center justify-center px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16">
            <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No products found</p>
          </div>
        )}
      </div>

      {/* Video Preview Modal */}
      {selectedProduct && selectedProduct.videoUrl && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl max-w-4xl w-full overflow-hidden shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{selectedProduct.name}</h2>
                <p className="text-muted-foreground mt-1">AI Generated Product Video</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <video
                src={selectedProduct.videoUrl}
                controls
                autoPlay
                className="w-full rounded-xl"
              >
                Your browser does not support video playback.
              </video>
              <div className="mt-4 flex items-center justify-between">
                <a
                  href={selectedProduct.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Open in new tab →
                </a>
                <span className="text-sm text-muted-foreground">
                  Category: {selectedProduct.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
