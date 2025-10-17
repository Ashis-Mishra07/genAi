'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, Eye, Star, Heart, ShoppingCart, Search, Filter, Grid3X3, List
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

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/products?featured=false&limit=50');
      
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
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Network error - please check your connection');
    } finally {
      setIsLoading(false);
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
        return (b.rating || 0) - (a.rating || 0);
      case 'popular':
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // newest first
    }
  });

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Featured Products</h1>
            <p className="text-slate-400">Discover amazing handcrafted products from talented artisans</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-700 rounded-lg px-3 py-2">
              <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">C</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">Customer</p>
                <p className="text-xs text-slate-400">{isLoading ? 'Loading...' : `${sortedProducts.length} products`}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
            <button 
              onClick={fetchProducts} 
              className="ml-4 text-red-400 hover:text-red-300 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-white mb-2">Loading Products...</h2>
            <p className="text-slate-400">Fetching the latest artisan creations</p>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search products or artisans..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>

              {/* Additional Filters */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center space-x-4">
                  <span className="text-slate-400 text-sm">View:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-slate-400 text-sm">
                  Showing {sortedProducts.length} of {products.length} products
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-24 w-24 text-slate-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">No products found</h2>
                <p className="text-slate-400 mb-8">
                  {error ? 'Unable to load products. Please try again.' : 'Try adjusting your search or filter criteria'}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setPriceRange({ min: 0, max: 50000 });
                    if (error) fetchProducts();
                  }}
                  className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  {error ? 'Retry' : 'Clear Filters'}
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
                    className={`bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-orange-500/50 transition-colors ${
                      viewMode === 'list' ? 'flex items-center' : ''
                    }`}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'w-full h-48'}`}>
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                          <Package className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                      {product.isNew && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                          NEW
                        </div>
                      )}
                      <button className="absolute top-2 left-2 p-2 bg-slate-800/80 rounded-full hover:bg-slate-700">
                        <Heart className="h-4 w-4 text-slate-400 hover:text-red-400" />
                      </button>
                      {!product.isActive && (
                        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                          <span className="text-red-400 font-medium text-sm">Unavailable</span>
                        </div>
                      )}
                    </div>
                    
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className={viewMode === 'list' ? 'flex items-center justify-between' : ''}>
                        <div className={viewMode === 'list' ? 'flex-1' : ''}>
                          <h3 className="font-semibold text-white mb-1">{product.name}</h3>
                          {product.artisanName && (
                            <p className="text-slate-400 text-sm mb-2">by {product.artisanName}</p>
                          )}
                          {product.artisanLocation && (
                            <p className="text-slate-400 text-xs mb-3">{product.artisanLocation}</p>
                          )}
                          
                          <div className="flex items-center mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-slate-400 text-sm ml-2">({product.reviewCount || 0})</span>
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-lg font-bold text-white">
                                {product.currency === 'INR' ? '₹' : '$'}{product.price.toLocaleString()}
                              </span>
                            </div>
                            {product.category && (
                              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{product.category}</span>
                            )}
                          </div>

                          {viewMode === 'list' && product.description && (
                            <p className="text-slate-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                          )}
                        </div>

                        <div className={`flex space-x-2 ${viewMode === 'list' ? 'ml-4' : ''}`}>
                          <button 
                            className={`${viewMode === 'list' ? 'px-6 py-2' : 'flex-1 py-2 px-4'} rounded-lg font-medium transition-colors ${
                              product.isActive 
                                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            }`}
                            disabled={!product.isActive}
                          >
                            {product.isActive ? 'Add to Cart' : 'Notify Me'}
                          </button>
                          <button 
                            onClick={() => router.push(`/products/${product.id}`)}
                            className="p-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
                          >
                            <Eye className="h-4 w-4 text-slate-400" />
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
    </div>
  );
}
