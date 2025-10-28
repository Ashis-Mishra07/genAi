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
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-orange-500 mr-3" />
              <h1 className="text-3xl font-bold text-white">AI Video Generation</h1>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                fetchProducts();
              }}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Loader className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
          <p className="text-gray-400">
            Generate AI-powered product demonstration videos using Google Vertex AI Veo 3
          </p>
          <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              💡 <strong>How it works:</strong> Click "Generate Video" to create a 7-second professional product demonstration video showing a person using or wearing the product. Videos are generated using Google's Vertex AI Veo 3 model.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-1">Total Products</p>
            <p className="text-3xl font-bold text-white">{products.length}</p>
          </div>
          <div className="bg-gray-900 border border-green-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-1">Videos Ready</p>
            <p className="text-3xl font-bold text-green-400">
              {products.filter(p => p.videoStatus === 'COMPLETED').length}
            </p>
          </div>
          <div className="bg-gray-900 border border-yellow-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-1">Processing</p>
            <p className="text-3xl font-bold text-yellow-400">
              {products.filter(p => p.videoStatus === 'PROCESSING').length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-1">No Video</p>
            <p className="text-3xl font-bold text-gray-400">
              {products.filter(p => !p.videoStatus || p.videoStatus === 'NOT_GENERATED').length}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-orange-500/50 transition-colors"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-800">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    No Image
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(product.videoStatus)}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                  {product.description || 'No description'}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-orange-400 font-bold">₹{product.price}</span>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {product.videoStatus === 'COMPLETED' && product.videoUrl ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch Video
                      </button>
                      <button
                        onClick={() => handleGenerateVideo(product.id)}
                        disabled={generatingVideo === product.id}
                        className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600/50 text-white rounded-lg cursor-not-allowed"
                    >
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Generating Video...
                    </button>
                  ) : (
                    <button
                      onClick={() => handleGenerateVideo(product.id)}
                      disabled={generatingVideo === product.id}
                      className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="text-center py-12">
            <Video className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No products found</p>
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
            className="bg-gray-900 border border-gray-800 rounded-lg max-w-4xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
                <p className="text-gray-400 mt-1">AI Generated Product Video</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <video
                src={selectedProduct.videoUrl}
                controls
                autoPlay
                className="w-full rounded-lg"
              >
                Your browser does not support video playback.
              </video>
              <div className="mt-4 flex items-center justify-between">
                <a
                  href={selectedProduct.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 text-sm"
                >
                  Open in new tab →
                </a>
                <span className="text-xs text-gray-500">
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
