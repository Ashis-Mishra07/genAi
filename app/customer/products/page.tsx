'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, Eye, Star, Heart, ShoppingCart, Search, Filter, Grid3X3, List
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  artisan: string;
  location: string;
  rating: number;
  reviews: number;
  category: string;
  discount: number;
  description: string;
  inStock: boolean;
}

export default function CustomerProductsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });

  // Enhanced dummy products data
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: "Handwoven Silk Saree",
      price: 8500,
      originalPrice: 12000,
      image: "/api/placeholder/300/300",
      artisan: "Priya Sharma",
      location: "Varanasi, UP",
      rating: 4.8,
      reviews: 156,
      category: "Textiles",
      discount: 29,
      description: "Exquisite handwoven silk saree with intricate traditional patterns. Made using premium quality silk threads.",
      inStock: true
    },
    {
      id: 2,
      name: "Ceramic Tea Set",
      price: 2400,
      originalPrice: 3200,
      image: "/api/placeholder/300/300",
      artisan: "Rajesh Kumar",
      location: "Jaipur, RJ",
      rating: 4.6,
      reviews: 89,
      category: "Pottery",
      discount: 25,
      description: "Beautiful handcrafted ceramic tea set with traditional Rajasthani blue pottery design.",
      inStock: true
    },
    {
      id: 3,
      name: "Wooden Jewelry Box",
      price: 1800,
      originalPrice: 2500,
      image: "/api/placeholder/300/300",
      artisan: "Meera Devi",
      location: "Kashmir",
      rating: 4.9,
      reviews: 203,
      category: "Woodwork",
      discount: 28,
      description: "Intricately carved wooden jewelry box with traditional Kashmiri walnut wood craftsmanship.",
      inStock: true
    },
    {
      id: 4,
      name: "Brass Decorative Lamp",
      price: 3200,
      originalPrice: 4000,
      image: "/api/placeholder/300/300",
      artisan: "Arjun Singh",
      location: "Moradabad, UP",
      rating: 4.7,
      reviews: 134,
      category: "Metalwork",
      discount: 20,
      description: "Elegant brass decorative lamp with traditional engravings and antique finish.",
      inStock: false
    },
    {
      id: 5,
      name: "Embroidered Cushion Covers",
      price: 1200,
      originalPrice: 1600,
      image: "/api/placeholder/300/300",
      artisan: "Sita Patel",
      location: "Gujarat",
      rating: 4.5,
      reviews: 78,
      category: "Textiles",
      discount: 25,
      description: "Set of 4 beautifully embroidered cushion covers with mirror work and vibrant colors.",
      inStock: true
    },
    {
      id: 6,
      name: "Traditional Puppet Set",
      price: 2800,
      originalPrice: 3500,
      image: "/api/placeholder/300/300",
      artisan: "Vikram Joshi",
      location: "Rajasthan",
      rating: 4.8,
      reviews: 92,
      category: "Toys & Crafts",
      discount: 20,
      description: "Authentic Rajasthani kathputli (puppet) set with colorful traditional costumes.",
      inStock: true
    },
    {
      id: 7,
      name: "Handmade Paper Journals",
      price: 850,
      originalPrice: 1200,
      image: "/api/placeholder/300/300",
      artisan: "Kavya Reddy",
      location: "Hyderabad, TS",
      rating: 4.4,
      reviews: 67,
      category: "Paper Crafts",
      discount: 29,
      description: "Set of 3 handmade journals with eco-friendly paper and traditional binding.",
      inStock: true
    },
    {
      id: 8,
      name: "Silver Filigree Earrings",
      price: 4500,
      originalPrice: 6000,
      image: "/api/placeholder/300/300",
      artisan: "Lakshmi Nair",
      location: "Cuttack, OD",
      rating: 4.9,
      reviews: 245,
      category: "Jewelry",
      discount: 25,
      description: "Exquisite silver filigree earrings showcasing the traditional art of Cuttack.",
      inStock: true
    }
  ]);

  const categories = ['All Categories', 'Textiles', 'Pottery', 'Woodwork', 'Metalwork', 'Jewelry', 'Toys & Crafts', 'Paper Crafts'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.artisan.toLowerCase().includes(searchTerm.toLowerCase());
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
        return b.rating - a.rating;
      case 'popular':
        return b.reviews - a.reviews;
      default:
        return b.id - a.id; // newest first
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
                <p className="text-xs text-slate-400">{sortedProducts.length} products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
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
            <p className="text-slate-400 mb-8">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setPriceRange({ min: 0, max: 50000 });
              }}
              className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Clear Filters
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
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                    <Package className="h-12 w-12 text-slate-400" />
                  </div>
                  {product.discount > 0 && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                      {product.discount}% OFF
                    </div>
                  )}
                  <button className="absolute top-2 left-2 p-2 bg-slate-800/80 rounded-full hover:bg-slate-700">
                    <Heart className="h-4 w-4 text-slate-400 hover:text-red-400" />
                  </button>
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                      <span className="text-red-400 font-medium text-sm">Out of Stock</span>
                    </div>
                  )}
                </div>
                
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className={viewMode === 'list' ? 'flex items-center justify-between' : ''}>
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <h3 className="font-semibold text-white mb-1">{product.name}</h3>
                      <p className="text-slate-400 text-sm mb-2">by {product.artisan}</p>
                      <p className="text-slate-400 text-xs mb-3">{product.location}</p>
                      
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-slate-400 text-sm ml-2">({product.reviews})</span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-lg font-bold text-white">₹{product.price.toLocaleString()}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-slate-400 text-sm line-through ml-2">₹{product.originalPrice.toLocaleString()}</span>
                          )}
                        </div>
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{product.category}</span>
                      </div>

                      {viewMode === 'list' && (
                        <p className="text-slate-400 text-sm mb-3">{product.description}</p>
                      )}
                    </div>

                    <div className={`flex space-x-2 ${viewMode === 'list' ? 'ml-4' : ''}`}>
                      <button 
                        className={`${viewMode === 'list' ? 'px-6 py-2' : 'flex-1 py-2 px-4'} rounded-lg font-medium transition-colors ${
                          product.inStock 
                            ? 'bg-orange-500 text-white hover:bg-orange-600' 
                            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        }`}
                        disabled={!product.inStock}
                      >
                        {product.inStock ? 'Add to Cart' : 'Notify Me'}
                      </button>
                      <button className="p-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors">
                        <Eye className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
