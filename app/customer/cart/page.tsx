"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Heart,
  ShoppingBag,
  User,
  Package,
} from "lucide-react";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  imageUrl?: string;
  artisan?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function CustomerCartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      setIsLoading(true);
      
      // Get cart items from localStorage
      const savedCart = localStorage.getItem("customer_cart");
      if (!savedCart) {
        setCartItems([]);
        setIsLoading(false);
        return;
      }

      const cartProductIds = JSON.parse(savedCart);
      if (!Array.isArray(cartProductIds) || cartProductIds.length === 0) {
        setCartItems([]);
        setIsLoading(false);
        return;
      }

      // Fetch product details from API
      const token = localStorage.getItem("accessToken");
      const items: CartItem[] = [];

      for (const productId of cartProductIds) {
        try {
          const response = await fetch(`/api/products/${productId}`, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.product) {
              items.push({
                id: data.product.id,
                productId: data.product.id,
                name: data.product.name,
                price: data.product.price,
                currency: data.product.currency,
                quantity: 1, // Default quantity, can be updated
                imageUrl: data.product.imageUrl,
                artisan: data.product.artisan,
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
        }
      }

      setCartItems(items);
    } catch (error) {
      console.error("Error loading cart items:", error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(items =>
      items.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    // Update state
    setCartItems(items => items.filter(item => item.productId !== productId));
    
    // Update localStorage
    const savedCart = localStorage.getItem("customer_cart");
    if (savedCart) {
      const cartProductIds = JSON.parse(savedCart);
      const updatedCart = cartProductIds.filter((id: string) => id !== productId);
      localStorage.setItem("customer_cart", JSON.stringify(updatedCart));
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("customer_cart");
  };

  const moveToWishlist = (productId: string) => {
    // Remove from cart
    removeFromCart(productId);
    
    // Add to wishlist
    const savedWishlist = localStorage.getItem("customer_wishlist");
    const wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
      localStorage.setItem("customer_wishlist", JSON.stringify(wishlist));
    }
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) return;
    
    // Save only essential checkout data (without large images)
    const checkoutData = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      price: item.price,
      currency: item.currency,
      quantity: item.quantity,
      artisan: item.artisan ? {
        id: item.artisan.id,
        name: item.artisan.name
      } : undefined
    }));
    
    try {
      localStorage.setItem("checkout_items", JSON.stringify(checkoutData));
      router.push("/customer/checkout");
    } catch (error) {
      console.error("Failed to save checkout data:", error);
      // Fallback: proceed to checkout without saving to localStorage
      // The checkout page can fetch fresh data from the cart items in localStorage
      router.push("/customer/checkout");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto text-emerald-500" />
          <p className="mt-2 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Shopping Cart</h1>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </span>
            </div>
            
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
            <button
              onClick={() => router.push("/customer/products")}
              className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      
                      {item.artisan && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <User className="h-4 w-4 mr-1" />
                          {item.artisan.name}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-emerald-600">
                          {item.currency === "INR" ? "₹" : "$"}{item.price.toLocaleString()}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => moveToWishlist(item.productId)}
                              className="p-2 text-gray-400 hover:text-red-500 rounded"
                              title="Move to Wishlist"
                            >
                              <Heart className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="p-2 text-gray-400 hover:text-red-500 rounded"
                              title="Remove from Cart"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 border-b pb-4 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{getSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>₹{Math.round(getSubtotal() * 0.18).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex justify-between text-lg font-semibold text-gray-900 mb-6">
                  <span>Total</span>
                  <span>₹{Math.round(getSubtotal() * 1.18).toLocaleString()}</span>
                </div>
                
                <button
                  onClick={proceedToCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full bg-emerald-500 text-white py-3 rounded-lg font-medium hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
                
                <div className="mt-4 text-center">
                  <button
                    onClick={() => router.push("/customer/products")}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    Continue Shopping
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
