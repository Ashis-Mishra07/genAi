"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Trash2,
  Package,
  User,
} from "lucide-react";

interface WishlistItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  category?: string;
  artisanName?: string;
}

export default function CustomerWishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<string[]>([]);

  useEffect(() => {
    loadWishlistItems();
    loadCart();
  }, []);

  const loadWishlistItems = async () => {
    try {
      setIsLoading(true);
      
      // Get wishlist from localStorage
      const wishlistData = localStorage.getItem("customer_wishlist");
      if (!wishlistData) {
        setWishlistItems([]);
        setIsLoading(false);
        return;
      }

      const wishlist = JSON.parse(wishlistData);
      const wishlistItemsArray: WishlistItem[] = [];

      // Fetch product details for each item in wishlist
      for (const productId of wishlist) {
        try {
          const response = await fetch(`/api/products/${productId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              wishlistItemsArray.push({
                id: data.product.id,
                name: data.product.name,
                description: data.product.description,
                price: data.product.price,
                currency: data.product.currency,
                imageUrl: data.product.imageUrl,
                category: data.product.category,
                artisanName: `Artisan ${data.product.userId.slice(0, 8)}`,
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
        }
      }

      setWishlistItems(wishlistItemsArray);
    } catch (error) {
      console.error("Error loading wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCart = () => {
    const saved = localStorage.getItem("customer_cart");
    if (saved) {
      setCart(JSON.parse(saved));
    }
  };

  const removeFromWishlist = (productId: string) => {
    const updatedItems = wishlistItems.filter(item => item.id !== productId);
    setWishlistItems(updatedItems);

    // Update localStorage
    const wishlistIds = updatedItems.map(item => item.id);
    localStorage.setItem("customer_wishlist", JSON.stringify(wishlistIds));
  };

  const addToCart = (productId: string) => {
    if (!cart.includes(productId)) {
      const newCart = [...cart, productId];
      setCart(newCart);
      localStorage.setItem("customer_cart", JSON.stringify(newCart));

      // Also update cart items with quantity
      const cartItems = JSON.parse(localStorage.getItem("customer_cart_items") || "{}");
      cartItems[productId] = 1;
      localStorage.setItem("customer_cart_items", JSON.stringify(cartItems));
    }
  };

  const moveToCart = (productId: string) => {
    addToCart(productId);
    removeFromWishlist(productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem("customer_wishlist");
  };

  const handleProductClick = (productId: string) => {
    router.push(`/customer/products/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-emerald-600 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back
              </button>
              <div className="flex items-center">
                <Heart className="h-6 w-6 text-red-500 mr-2" />
                <h1 className="text-xl font-semibold text-gray-900">
                  My Wishlist ({wishlistItems.length} items)
                </h1>
              </div>
            </div>

            {wishlistItems.length > 0 && (
              <button
                onClick={clearWishlist}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">
              Save products you love to easily find them later
            </p>
            <button
              onClick={() => router.push("/customer/products")}
              className="bg-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
            >
              Discover Products
            </button>
          </div>
        ) : (
          <div>
            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {wishlistItems.length} product{wishlistItems.length !== 1 ? "s" : ""} saved
              </p>
              <button
                onClick={() => router.push("/customer/products")}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Continue Shopping
              </button>
            </div>

            {/* Wishlist Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
                >
                  {/* Product Image */}
                  <div
                    className="aspect-square cursor-pointer"
                    onClick={() => handleProductClick(item.id)}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3
                        className="font-semibold text-gray-900 line-clamp-2 cursor-pointer flex-1"
                        onClick={() => handleProductClick(item.id)}
                      >
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="ml-2 p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {item.artisanName && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <User className="h-4 w-4 mr-1" />
                        {item.artisanName}
                      </div>
                    )}

                    {item.category && (
                      <div className="mb-3">
                        <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-emerald-600">
                        {item.currency === "INR" ? "₹" : "$"}{item.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => moveToCart(item.id)}
                        disabled={cart.includes(item.id)}
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                          cart.includes(item.id)
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-emerald-500 text-white hover:bg-emerald-600"
                        }`}
                      >
                        {cart.includes(item.id) ? "In Cart" : "Move to Cart"}
                      </button>
                      
                      <button
                        onClick={() => addToCart(item.id)}
                        disabled={cart.includes(item.id)}
                        className={`w-full py-2 border rounded-lg text-sm font-medium transition-colors ${
                          cart.includes(item.id)
                            ? "border-gray-200 text-gray-500 cursor-not-allowed"
                            : "border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4 inline mr-1" />
                        {cart.includes(item.id) ? "Added" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => router.push("/customer/cart")}
                className="bg-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors flex items-center"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                View Cart ({cart.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
