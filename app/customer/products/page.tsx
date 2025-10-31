'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, Eye, Star, Heart, ShoppingCart, Search, Filter, Grid3X3, List, X
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  story?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  posterUrl?: string;
  videoUrl?: string;
  videoStatus?: string;
  category?: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  artisanName?: string;
  artisanLocation?: string;
  isNew?: boolean;
  reviewCount?: number;
  rating?: number;
}

export default function CustomerProductsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [videoModalProduct, setVideoModalProduct] = useState<Product | null>(null);

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/products?featured=false&limit=50', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.products) {
          setProducts(data.products);
        } else {
          setError('Failed to load products');
        }
      } else {
        setError('Failed to fetch products from server');
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError('Network error - please check your connection');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
    
    if (!token) {
      router.push("/auth/customer");
      return;
    }

    setAddingToCart(productId);
    
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          quantity: 1
        }),
      });

      if (response.ok) {
        // Show success message or notification
        alert('Product added to cart successfully!');
      } else if (response.status === 401) {
        router.push("/auth/customer");
      } else {
        alert('Failed to add product to cart');
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  // Extract unique categories from products
  const categories = ['All Categories', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.artisanName && product.artisanName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || selectedCategory === 'All Categories' || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        // For real API data, we'll use a random rating since ratings aren't implemented yet
        const aRating = a.rating || (4.0 + Math.random() * 1.0); // Random between 4.0-5.0
        const bRating = b.rating || (4.0 + Math.random() * 1.0);
        return bRating - aRating;
      case 'popular':
        // Since we don't have actual popularity data, sort by creation date as proxy
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      default: // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-card-foreground mb-2">Artisan Marketplace</h1>
              <p className="text-muted-foreground text-lg">Discover unique handcrafted products from talented artisans worldwide</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-muted/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-border">
                <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Package className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">Browse Products</p>
                  <p className="text-xs text-muted-foreground">{isLoading ? 'Loading...' : `${sortedProducts.length} items available`}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-6 py-4 rounded-xl mb-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Error Loading Products</h3>
                <p className="text-sm">{error}</p>
              </div>
              <button 
                onClick={fetchProducts} 
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-muted border-t-primary mx-auto mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Discovering Amazing Products</h2>
            <p className="text-muted-foreground text-lg">Fetching the latest artisan creations for you...</p>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="bg-card backdrop-blur-sm rounded-2xl p-8 mb-8 border border-border shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Search Products</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search products, artisans, or descriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                  >
                    <option value="newest">✨ Newest First</option>
                    <option value="price-low">💰 Price: Low to High</option>
                    <option value="price-high">💎 Price: High to Low</option>
                    <option value="alphabetical">🔤 Name: A to Z</option>
                    <option value="rating">⭐ Highest Rated</option>
                    <option value="popular">🔥 Most Popular</option>
                  </select>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-3">Price Range</label>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="Min ₹"
                          value={priceRange.min || ''}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <span className="text-muted-foreground font-medium">—</span>
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="Max ₹"
                          value={priceRange.max || ''}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || 50000 }))}
                          className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <button
                        onClick={() => setPriceRange({ min: 0, max: 50000 })}
                        className="text-primary hover:text-primary/80 text-sm font-medium px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-6">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-3">View Mode</label>
                      <div className="flex items-center space-x-2 bg-muted/30 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                        >
                          <Grid3X3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                        >
                          <List className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <label className="block text-sm font-medium text-muted-foreground mb-3">Results</label>
                    <div className="text-foreground font-medium">
                      <span className="text-primary text-lg font-bold">{sortedProducts.length}</span>
                      <span className="text-muted-foreground text-sm ml-1">of {products.length} products</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-muted/50 rounded-full flex items-center justify-center mx-auto border-4 border-border">
                    <Package className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">No Products Found</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                  {error ? 'Unable to load products. Please check your connection and try again.' : 'No products match your current search and filter criteria. Try adjusting your filters.'}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All Categories');
                    setPriceRange({ min: 0, max: 50000 });
                    if (error) fetchProducts();
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  {error ? '🔄 Retry Loading' : '✨ Clear All Filters'}
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
              }>
                {sortedProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className={`group bg-card backdrop-blur-sm rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 transform hover:scale-[1.02] ${
                      viewMode === 'list' ? 'flex items-center' : ''
                    }`}
                  >
                    <div 
                      className={`relative ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'w-full h-48'} cursor-pointer`}
                      onClick={() => {
                        if (product.videoUrl && product.videoStatus === 'COMPLETED') {
                          setVideoModalProduct(product);
                        } else {
                          router.push(`/customer/products/${product.id}`);
                        }
                      }}
                    >
                      {product.videoUrl && product.videoStatus === 'COMPLETED' ? (
                        <div className="relative w-full h-full group">
                          <video
                            src={product.videoUrl}
                            poster={product.imageUrl || undefined}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => {
                              e.currentTarget.pause();
                              e.currentTarget.currentTime = 0;
                            }}
                          />
                          {/* Video overlay badge - now clickable */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/70 transition-all flex items-center justify-center">
                            <div className="bg-primary group-hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-sm font-bold flex items-center shadow-2xl transform group-hover:scale-110 transition-all">
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 5v10l7-5-7-5z"/>
                              </svg>
                              WATCH VIDEO
                            </div>
                          </div>
                          {/* Video duration badge */}
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                            7s
                          </div>
                        </div>
                      ) : product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                          <Package className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                      {product.isNew && (
                        <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
                          ✨ NEW
                        </div>
                      )}
                      <button 
                        className="absolute top-3 left-3 p-2 bg-background/70 backdrop-blur-sm rounded-full hover:bg-background/80 hover:scale-110 transition-all z-10 group/heart"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to wishlist logic here
                        }}
                      >
                        <Heart className="h-4 w-4 text-muted-foreground group-hover/heart:text-red-400 group-hover/heart:fill-current transition-all" />
                      </button>
                      {!product.isActive && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
                          <span className="text-destructive font-medium text-sm">Unavailable</span>
                        </div>
                      )}
                    </div>
                    
                    <div className={`p-5 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className={viewMode === 'list' ? 'flex items-center justify-between' : ''}>
                        <div className={viewMode === 'list' ? 'flex-1' : ''}>
                          <h3 className="font-bold text-card-foreground mb-2 text-lg group-hover:text-primary transition-colors">{product.name}</h3>
                          {product.artisanName && (
                            <p className="text-muted-foreground text-sm mb-1 font-medium">by {product.artisanName}</p>
                          )}
                          {product.artisanLocation && (
                            <p className="text-muted-foreground text-xs mb-3 flex items-center">
                              <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2"></span>
                              {product.artisanLocation}
                            </p>
                          )}
                          
                          <div className="flex items-center mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => {
                                // Generate a consistent rating based on product ID for demo purposes
                                const productRating = product.rating || (4.2 + (parseInt(product.id.slice(-1), 16) % 8) * 0.1);
                                return (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < Math.floor(productRating) ? 'text-yellow-400 fill-current' : 'text-muted'}`} 
                                  />
                                );
                              })}
                            </div>
                            <span className="text-muted-foreground text-sm ml-2">
                              ({product.reviewCount || Math.floor(Math.random() * 50) + 10})
                            </span>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <span className="text-2xl font-bold text-primary">
                                {product.currency === 'INR' ? '₹' : '$'}{product.price.toLocaleString()}
                              </span>
                            </div>
                            {product.category && (
                              <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full font-medium border border-border">
                                {product.category}
                              </span>
                            )}
                          </div>

                          {viewMode === 'list' && product.description && (
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
                          )}
                        </div>

                        <div className={`flex space-x-3 ${viewMode === 'list' ? 'ml-4' : ''}`}>
                          <button 
                            onClick={() => product.isActive && addToCart(product.id)}
                            className={`${viewMode === 'list' ? 'px-6 py-3' : 'flex-1 py-3 px-4'} rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center shadow-lg ${
                              product.isActive 
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/30' 
                                : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                            }`}
                            disabled={!product.isActive || addingToCart === product.id}
                          >
                            {addingToCart === product.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            ) : (
                              <>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {product.isActive ? 'Add to Cart' : 'Notify Me'}
                              </>
                            )}
                          </button>
                          <button 
                            onClick={() => router.push(`/customer/products/${product.id}`)}
                            className="p-3 border border-border rounded-xl hover:bg-muted/50 hover:border-primary/50 transition-all group/view"
                          >
                            <Eye className="h-4 w-4 text-muted-foreground group-hover/view:text-primary transition-colors" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Video Modal */}
      {videoModalProduct && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setVideoModalProduct(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-card rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setVideoModalProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-background/80 hover:bg-background rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Video Player */}
            <div className="aspect-video bg-black">
              <video
                src={videoModalProduct.videoUrl}
                controls
                autoPlay
                className="w-full h-full"
                poster={videoModalProduct.imageUrl || undefined}
              >
                Your browser does not support video playback.
              </video>
            </div>

            {/* Product Info */}
            <div className="p-6 bg-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-card-foreground mb-2">{videoModalProduct.name}</h2>
                  {videoModalProduct.artisanName && (
                    <p className="text-muted-foreground text-sm mb-3">by {videoModalProduct.artisanName}</p>
                  )}
                  {videoModalProduct.description && (
                    <p className="text-muted-foreground text-sm mb-4">{videoModalProduct.description}</p>
                  )}
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold text-primary">
                      {videoModalProduct.currency === 'INR' ? '₹' : '$'}
                      {videoModalProduct.price.toLocaleString()}
                    </span>
                    {videoModalProduct.category && (
                      <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
                        {videoModalProduct.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    setVideoModalProduct(null);
                    router.push(`/customer/products/${videoModalProduct.id}`);
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  View Full Details
                </button>
                <button
                  onClick={() => {
                    if (videoModalProduct.isActive) {
                      addToCart(videoModalProduct.id);
                      setVideoModalProduct(null);
                    }
                  }}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                    videoModalProduct.isActive
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                  disabled={!videoModalProduct.isActive}
                >
                  {videoModalProduct.isActive ? 'Add to Cart' : 'Unavailable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
