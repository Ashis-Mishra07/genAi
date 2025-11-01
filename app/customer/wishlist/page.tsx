'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart, ShoppingCart, Eye, Star, Package, Trash2, Grid3X3, List
} from 'lucide-react';

interface WishlistItem {
  id: number;
  productId: number;
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
  inStock: boolean;
  addedDate: string;
}

export default function CustomerWishlistPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: 1,
      productId: 1,
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
      inStock: true,
      addedDate: "2024-01-15"
    },
    {
      id: 2,
      productId: 2,
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
      inStock: true,
      addedDate: "2024-01-10"
    }
  ]);

  const removeFromWishlist = (id: number) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const addToCart = (item: WishlistItem) => {
    if (item.inStock) {
      // In a real app, this would add the item to cart
      console.log('Added to cart:', item.name);
    }
  };

  const moveAllToCart = () => {
    const inStockItems = wishlistItems.filter(item => item.inStock);
    if (inStockItems.length > 0) {
      // In a real app, this would add all in-stock items to cart
      console.log('Moving all available items to cart');
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const inStockCount = wishlistItems.filter(item => item.inStock).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">My Wishlist</h1>
            <p className="text-muted-foreground">{wishlistItems.length} items saved for later</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-muted rounded-lg px-3 py-2">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-card-foreground">{inStockCount} Available</p>
                <p className="text-xs text-muted-foreground">{wishlistItems.length} total items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {wishlistItems.length === 0 ? (
          // Empty Wishlist
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8">Save items you love to your wishlist</p>
            <button
              onClick={() => router.push('/customer/products')}
              className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <>
            {/* Actions Bar */}
            <div className="bg-card rounded-lg p-4 mb-6 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-muted-foreground text-sm">View:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {inStockCount > 0 && (
                    <button
                      onClick={moveAllToCart}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                      Add All to Cart ({inStockCount})
                    </button>
                  )}
                  <button
                    onClick={clearWishlist}
                    className="text-slate-400 hover:text-red-400 px-4 py-2 transition-colors"
                  >
                    Clear Wishlist
                  </button>
                </div>
              </div>
            </div>

            {/* Wishlist Items */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {wishlistItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors ${
                    viewMode === 'list' ? 'flex items-center' : ''
                  }`}
                >
                  <div className={`relative ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'w-full h-48'}`}>
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                    {item.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                        {item.discount}% OFF
                      </div>
                    )}
                    <button 
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-2 left-2 p-2 bg-background/80 rounded-full hover:bg-red-500/80 transition-colors"
                    >
                      <Heart className="h-4 w-4 text-red-400 fill-current" />
                    </button>
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <span className="text-destructive font-medium text-sm">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className={viewMode === 'list' ? 'flex items-center justify-between' : ''}>
                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <h3 className="font-semibold text-card-foreground mb-1">{item.name}</h3>
                        <p className="text-muted-foreground text-sm mb-2">by {item.artisan}</p>
                        <p className="text-muted-foreground text-xs mb-3">{item.location}</p>
                        
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-slate-400 text-sm ml-2">({item.reviews})</span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-lg font-bold text-card-foreground">₹{item.price.toLocaleString()}</span>
                            {item.originalPrice > item.price && (
                              <span className="text-muted-foreground text-sm line-through ml-2">₹{item.originalPrice.toLocaleString()}</span>
                            )}
                          </div>
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">{item.category}</span>
                        </div>

                        <p className="text-muted-foreground text-xs mb-3">Added {new Date(item.addedDate).toLocaleDateString()}</p>
                      </div>

                      <div className={`flex space-x-2 ${viewMode === 'list' ? 'ml-4 flex-col space-y-2 space-x-0' : ''}`}>
                        <button 
                          onClick={() => addToCart(item)}
                          className={`${viewMode === 'list' ? 'px-6 py-2' : 'flex-1 py-2 px-4'} rounded-lg font-medium transition-colors ${
                            item.inStock 
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                              : 'bg-muted text-muted-foreground cursor-not-allowed'
                          }`}
                          disabled={!item.inStock}
                        >
                          {item.inStock ? 'Add to Cart' : 'Notify Me'}
                        </button>
                        
                        <div className={`flex space-x-2 ${viewMode === 'list' ? '' : ''}`}>
                          <button className="p-2 border border-border rounded-lg hover:bg-muted transition-colors">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button 
                            onClick={() => removeFromWishlist(item.id)}
                            className="p-2 border border-border rounded-lg hover:bg-red-500/20 hover:border-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-8 bg-card rounded-lg p-6 border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">{wishlistItems.length}</div>
                  <div className="text-muted-foreground text-sm">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{inStockCount}</div>
                  <div className="text-muted-foreground text-sm">In Stock</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    ₹{wishlistItems.filter(item => item.inStock).reduce((sum, item) => sum + item.price, 0).toLocaleString()}
                  </div>
                  <div className="text-slate-400 text-sm">Total Value</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
