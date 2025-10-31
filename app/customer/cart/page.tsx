'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Plus, Minus, Trash2, Heart, ArrowRight, Package
} from 'lucide-react';
import { GoogleLoaderWithText } from '@/components/ui/google-loader';

interface CartItem {
  id: number;
  productId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  artisanName: string;
  artisanLocation: string;
  quantity: number;
  inStock: boolean;
  category?: string;
  addedAt: string;
}

interface CartTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function CustomerCartPage() {
  const router = useRouter();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState<CartTotals>({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCartItems();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
    const role = localStorage.getItem("user_role");

    if (!token) {
      router.push("/auth/customer");
      return false;
    }
    return true;
  };

  const fetchCartItems = async () => {
    if (!checkAuth()) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");

      const response = await fetch("/api/cart/details", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cartItems || []);
        setTotals(data.totals || { subtotal: 0, shipping: 0, tax: 0, total: 0 });
      } else if (response.status === 401) {
        router.push("/auth/customer");
      } else {
        setError('Failed to load cart items');
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError('Failed to load cart items');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id: number, change: number) => {
    const item = cartItems.find(item => item.id === id);
    if (!item) return;

    const newQuantity = Math.max(0, item.quantity + change);
    
    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
      
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          itemId: id,
          quantity: newQuantity
        }),
      });

      if (response.ok) {
        // Refresh cart items to get updated totals
        fetchCartItems();
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  const removeItem = async (id: number) => {
    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
      
      const response = await fetch(`/api/cart?itemId=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        // Refresh cart items
        fetchCartItems();
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const moveToWishlist = async (id: number) => {
    // In a real app, this would move the item to wishlist
    // For now, just remove the item
    await removeItem(id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
            <p className="text-muted-foreground mt-1">{cartItems.length} items in your cart</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-secondary rounded-xl px-4 py-3">
              <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Total: ₹{totals.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{cartItems.length} items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16">
            <GoogleLoaderWithText size="lg" text="Loading your cart..." />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Error loading cart</h2>
            <p className="text-muted-foreground mb-8">{error}</p>
            <button
              onClick={fetchCartItems}
              className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          // Empty Cart
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Add some amazing handcrafted products to your cart</p>
            <button
              onClick={() => router.push('/customer/products')}
              className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{item.name}</h3>
                          <p className="text-muted-foreground text-sm">by {item.artisanName}</p>
                          <p className="text-muted-foreground text-xs">{item.artisanLocation}</p>
                          {item.category && (
                            <span className="inline-block bg-secondary text-foreground px-3 py-1 rounded-full text-xs mt-2">
                              {item.category}
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-foreground">₹{item.price.toLocaleString()}</span>
                          </div>
                          {!item.inStock && (
                            <span className="text-red-500 text-sm font-medium">Out of Stock</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity and Actions */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center bg-secondary rounded-lg border border-border">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-2 hover:bg-background rounded-l-lg transition-colors"
                              disabled={!item.inStock}
                            >
                              <Minus className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <span className="px-4 py-2 text-foreground font-medium min-w-[40px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-2 hover:bg-background rounded-r-lg transition-colors"
                              disabled={!item.inStock}
                            >
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </div>

                          <span className="text-muted-foreground">×</span>
                          <span className="text-foreground font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => moveToWishlist(item.id)}
                            className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                            title="Move to Wishlist"
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                            title="Remove Item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Continue Shopping */}
              <button
                onClick={() => router.push('/customer/products')}
                className="w-full bg-card border border-border rounded-xl p-4 text-muted-foreground hover:text-foreground hover:border-orange-500 transition-colors"
              >
                + Add more items
              </button>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                <h3 className="text-xl font-semibold text-foreground mb-6">Order Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-medium">₹{totals.subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="font-medium">{totals.shipping === 0 ? 'Free' : `₹${totals.shipping}`}</span>
                  </div>
                  
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (GST 18%)</span>
                    <span className="font-medium">₹{totals.tax.toLocaleString()}</span>
                  </div>
                  
                  {totals.shipping === 0 && (
                    <div className="text-green-600 text-sm bg-green-50 p-2 rounded-lg">
                      🎉 Free shipping on orders above ₹5,000
                    </div>
                  )}
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between text-foreground font-semibold text-xl">
                      <span>Total</span>
                      <span>₹{totals.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => router.push('/customer/checkout')}
                  disabled={cartItems.length === 0 || cartItems.some(item => !item.inStock)}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors mt-6 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                {cartItems.some(item => !item.inStock) && (
                  <p className="text-sm text-red-400 mt-2 text-center">
                    Please remove out of stock items to proceed
                  </p>
                )}
              </div>

              {/* Delivery Info */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                <h4 className="font-semibold text-foreground mb-4">Delivery Information</h4>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="flex items-center space-x-2">
                    <span>📦</span>
                    <span>Standard Delivery: 5-7 business days</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span>🚚</span>
                    <span>Express Delivery: 2-3 business days (+₹199)</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span>🏪</span>
                    <span>Store Pickup: Available at 15+ locations</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span>↩️</span>
                    <span>Easy Returns: 30-day return policy</span>
                  </p>
                </div>
              </div>

              {/* Promo Code */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                <h4 className="font-semibold text-foreground mb-4">Promo Code</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                  <button className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
