'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Plus, Minus, Trash2, Heart, ArrowRight, Package
} from 'lucide-react';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  artisan: string;
  location: string;
  quantity: number;
  inStock: boolean;
  category: string;
}

export default function CustomerCartPage() {
  const router = useRouter();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      productId: 1,
      name: "Handwoven Silk Saree",
      price: 8500,
      originalPrice: 12000,
      image: "/api/placeholder/300/300",
      artisan: "Priya Sharma",
      location: "Varanasi, UP",
      quantity: 1,
      inStock: true,
      category: "Textiles"
    },
    {
      id: 2,
      productId: 3,
      name: "Wooden Jewelry Box",
      price: 1800,
      originalPrice: 2500,
      image: "/api/placeholder/300/300",
      artisan: "Meera Devi",
      location: "Kashmir",
      quantity: 2,
      inStock: true,
      category: "Woodwork"
    }
  ]);

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items => 
      items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const moveToWishlist = (id: number) => {
    // In a real app, this would move the item to wishlist
    removeItem(id);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 299;
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + tax;

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
                <p className="text-sm font-medium text-white">Total: ₹{total.toLocaleString()}</p>
                <p className="text-xs text-slate-400">{cartItems.length} items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {cartItems.length === 0 ? (
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
                    <div className="w-24 h-24 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="h-8 w-8 text-slate-400" />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white text-lg">{item.name}</h3>
                          <p className="text-slate-400 text-sm">by {item.artisan}</p>
                          <p className="text-slate-400 text-xs">{item.location}</p>
                          <span className="inline-block bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs mt-2">
                            {item.category}
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-white">₹{item.price.toLocaleString()}</span>
                            {item.originalPrice > item.price && (
                              <span className="text-slate-400 text-sm line-through">₹{item.originalPrice.toLocaleString()}</span>
                            )}
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
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>
                  
                  <div className="flex justify-between text-slate-400">
                    <span>Tax (GST 18%)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  
                  {shipping === 0 && (
                    <div className="text-green-400 text-sm">
                      🎉 Free shipping on orders above ₹5,000
                    </div>
                  )}
                  
                  <div className="border-t border-slate-700 pt-3">
                    <div className="flex justify-between text-white font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
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
