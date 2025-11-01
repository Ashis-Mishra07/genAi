"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Heart,
  ArrowRight,
  Package,
} from "lucide-react";
import { GoogleLoaderInline } from "@/components/ui/google-loader";

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
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCartItems();
  }, []);

  const checkAuth = () => {
    const token =
      localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
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
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      const response = await fetch("/api/cart/details", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cartItems || []);
        setTotals(
          data.totals || { subtotal: 0, shipping: 0, tax: 0, total: 0 }
        );
      } else if (response.status === 401) {
        router.push("/auth/customer");
      } else {
        setError("Failed to load cart items");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart items");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id: number, change: number) => {
    const item = cartItems.find((item) => item.id === id);
    if (!item) return;

    const newQuantity = Math.max(0, item.quantity + change);

    try {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          itemId: id,
          quantity: newQuantity,
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
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      const response = await fetch(`/api/cart?itemId=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
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
    <>
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-8 -mx-4 -mt-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Shopping Cart
              </h1>
              <p className="text-muted-foreground text-lg">
                {cartItems.length} handcrafted items ready for checkout
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-muted/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-border">
                <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <ShoppingCart className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">
                    Total: ₹{totals.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cartItems.length} items selected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <GoogleLoaderInline
                size="lg"
                text="Loading Your Cart"
                textClassName="text-foreground font-bold text-2xl"
              />
              <p className="text-muted-foreground text-lg">
                Preparing your selected items...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-muted/50 rounded-full flex items-center justify-center mx-auto border-4 border-border">
                <ShoppingCart className="h-16 w-16 text-destructive" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Cart Loading Error
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              {error}
            </p>
            <button
              onClick={fetchCartItems}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg">
              🔄 Try Again
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          // Empty Cart
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-muted/50 rounded-full flex items-center justify-center mx-auto border-4 border-border">
                <ShoppingCart className="h-16 w-16 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Discover amazing handcrafted products from talented artisans
            </p>
            <button
              onClick={() => router.push("/customer/products")}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg">
              🛍️ Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="group bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-xl hover:border-primary/50 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="w-28 h-28 bg-muted/50 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-border group-hover:border-primary/30 transition-all">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <Package className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-card-foreground text-xl group-hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-muted-foreground text-sm font-medium">
                            by {item.artisanName}
                          </p>
                          <p className="text-muted-foreground text-xs flex items-center mt-1">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2"></span>
                            {item.artisanLocation}
                          </p>
                          {item.category && (
                            <span className="inline-block bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs mt-3 font-medium border border-border">
                              {item.category}
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                              ₹{item.price.toLocaleString()}
                            </span>
                          </div>
                          {!item.inStock && (
                            <div className="bg-destructive/20 text-destructive text-sm font-medium px-3 py-1 rounded-full mt-2 border border-destructive/30">
                              Out of Stock
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity and Actions */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center bg-muted/50 rounded-xl border border-border">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-3 hover:bg-muted rounded-l-xl transition-all group/minus"
                              disabled={!item.inStock}>
                              <Minus className="h-4 w-4 text-muted-foreground group-hover/minus:text-foreground transition-colors" />
                            </button>
                            <span className="px-4 py-3 text-card-foreground font-bold min-w-[50px] text-center bg-muted">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-3 hover:bg-muted rounded-r-xl transition-all group/plus"
                              disabled={!item.inStock}>
                              <Plus className="h-4 w-4 text-muted-foreground group-hover/plus:text-foreground transition-colors" />
                            </button>
                          </div>

                          <span className="text-muted-foreground text-lg">
                            ×
                          </span>
                          <span className="text-card-foreground font-bold text-lg">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => moveToWishlist(item.id)}
                            className="p-3 text-muted-foreground hover:text-destructive transition-all rounded-xl hover:bg-destructive/10 hover:scale-110 group/heart"
                            title="Move to Wishlist">
                            <Heart className="h-4 w-4 group-hover/heart:fill-current transition-all" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-3 text-muted-foreground hover:text-destructive transition-all rounded-xl hover:bg-destructive/10 hover:scale-110"
                            title="Remove Item">
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
                onClick={() => router.push("/customer/products")}
                className="w-full bg-card border-2 border-dashed border-border rounded-2xl p-6 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all transform hover:scale-[1.02] backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-3">
                  <Plus className="h-5 w-5" />
                  <span className="font-semibold">
                    ✨ Discover More Amazing Products
                  </span>
                </div>
              </button>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-card backdrop-blur-sm rounded-2xl p-8 border border-border shadow-xl sticky top-6">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-primary/20 rounded-xl mr-3">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground">
                    Order Summary
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-semibold text-card-foreground">
                      ₹{totals.subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span
                      className={`font-semibold ${
                        totals.shipping === 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-card-foreground"
                      }`}>
                      {totals.shipping === 0 ? "FREE" : `₹${totals.shipping}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (GST 18%)</span>
                    <span className="font-semibold text-card-foreground">
                      ₹{totals.tax.toLocaleString()}
                    </span>
                  </div>

                  {totals.shipping === 0 && (
                    <div className="bg-green-500/20 border border-green-500/30 text-green-600 dark:text-green-300 text-sm p-3 rounded-xl flex items-center">
                      <span className="mr-2">🎉</span>
                      <span className="font-medium">
                        Free shipping applied!
                      </span>
                    </div>
                  )}

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between text-card-foreground font-bold text-xl">
                      <span>Total</span>
                      <span className="text-2xl bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                        ₹{totals.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/customer/checkout")}
                  disabled={
                    cartItems.length === 0 ||
                    cartItems.some((item) => !item.inStock)
                  }
                  className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 mt-6 flex items-center justify-center space-x-2 shadow-lg">
                  <span>🚀 Proceed to Checkout</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                {cartItems.some((item) => !item.inStock) && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
                    <p className="text-sm text-destructive text-center font-medium">
                      ⚠️ Please remove out of stock items to proceed
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Info */}
              <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-xl">
                <h4 className="font-bold text-card-foreground mb-4 flex items-center">
                  <div className="p-2 bg-blue-500/20 rounded-lg mr-2">
                    <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Delivery Information
                </h4>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="text-lg">📦</span>
                    <span>Standard Delivery: 5-7 business days</span>
                  </p>
                  <p className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="text-lg">🚚</span>
                    <span>Express Delivery: 2-3 business days (+₹199)</span>
                  </p>
                  <p className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="text-lg">🏪</span>
                    <span>Store Pickup: Available at 15+ locations</span>
                  </p>
                  <p className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="text-lg">↩️</span>
                    <span>Easy Returns: 30-day return policy</span>
                  </p>
                </div>
              </div>

              {/* Promo Code */}
              <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-xl">
                <h4 className="font-bold text-card-foreground mb-4 flex items-center">
                  <div className="p-2 bg-green-500/20 rounded-lg mr-2">
                    <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  💫 Promo Code
                </h4>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Enter promo code..."
                    className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                  />
                  <button className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold transform hover:scale-105 shadow-lg">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
