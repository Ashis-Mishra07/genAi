'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Plus, Minus, Trash2, Heart, ArrowRight, Package
} from 'lucide-react';

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
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
            <p className="text-slate-400">{cartItems.length} items in your cart</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-700 rounded-lg px-3 py-2">
              <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">Total: ₹{totals.total.toLocaleString()}</p>
                <p className="text-xs text-slate-400">{cartItems.length} items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading your cart...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 text-slate-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Error loading cart</h2>
            <p className="text-slate-400 mb-8">{error}</p>
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
            <ShoppingCart className="h-24 w-24 text-slate-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
            <p className="text-slate-400 mb-8">Add some amazing handcrafted products to your cart</p>
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
                <div key={item.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-slate-400" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white text-lg">{item.name}</h3>
                          <p className="text-slate-400 text-sm">by {item.artisanName}</p>
                          <p className="text-slate-400 text-xs">{item.artisanLocation}</p>
                          {item.category && (
                            <span className="inline-block bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs mt-2">
                              {item.category}
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-white">₹{item.price.toLocaleString()}</span>
                          </div>
                          {!item.inStock && (
                            <span className="text-red-400 text-sm font-medium">Out of Stock</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity and Actions */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center bg-slate-700 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-2 hover:bg-slate-600 rounded-l-lg transition-colors"
                              disabled={!item.inStock}
                            >
                              <Minus className="h-4 w-4 text-slate-400" />
                            </button>
                            <span className="px-4 py-2 text-white font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-2 hover:bg-slate-600 rounded-r-lg transition-colors"
                              disabled={!item.inStock}
                            >
                              <Plus className="h-4 w-4 text-slate-400" />
                            </button>
                          </div>

                          <span className="text-slate-400">×</span>
                          <span className="text-white font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => moveToWishlist(item.id)}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            title="Move to Wishlist"
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
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
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-4 text-slate-400 hover:text-white hover:border-orange-500 transition-colors"
              >
                + Add more items
              </button>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{totals.subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping</span>
                    <span>{totals.shipping === 0 ? 'Free' : `₹${totals.shipping}`}</span>
                  </div>
                  
                  <div className="flex justify-between text-slate-400">
                    <span>Tax (GST 18%)</span>
                    <span>₹{totals.tax.toLocaleString()}</span>
                  </div>
                  
                  {totals.shipping === 0 && (
                    <div className="text-green-400 text-sm">
                      🎉 Free shipping on orders above ₹5,000
                    </div>
                  )}
                  
                  <div className="border-t border-slate-700 pt-3">
                    <div className="flex justify-between text-white font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{totals.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors mt-6 flex items-center justify-center space-x-2">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Delivery Info */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h4 className="font-semibold text-white mb-3">Delivery Information</h4>
                <div className="space-y-2 text-sm text-slate-400">
                  <p>📦 Standard Delivery: 5-7 business days</p>
                  <p>🚚 Express Delivery: 2-3 business days (+₹199)</p>
                  <p>🏪 Store Pickup: Available at 15+ locations</p>
                  <p>↩️ Easy Returns: 30-day return policy</p>
                </div>
              </div>

              {/* Promo Code */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h4 className="font-semibold text-white mb-3">Promo Code</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">
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
