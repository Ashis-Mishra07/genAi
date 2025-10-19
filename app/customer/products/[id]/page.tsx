"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Share2,
  Star,
  User,
  MapPin,
  Package,
  Shield,
  Truck,
  MessageCircle,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

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
  artisan?: {
    id: string;
    name: string;
    email: string;
    location?: string;
    specialty?: string;
    bio?: string;
  };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideo, setShowVideo] = useState(true); // Show video by default if available

  useEffect(() => {
    if (id) {
      fetchProduct();
      loadWishlist();
      loadCart();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch(`/api/products/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProduct(data.product);
        } else {
          console.error("Product not found");
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWishlist = () => {
    const saved = localStorage.getItem("customer_wishlist");
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  };

  const loadCart = () => {
    const saved = localStorage.getItem("customer_cart_items");
    if (saved) {
      setCart(JSON.parse(saved));
    }
  };

  const toggleWishlist = () => {
    if (!product) return;
    
    const newWishlist = wishlist.includes(product.id)
      ? wishlist.filter(id => id !== product.id)
      : [...wishlist, product.id];
    
    setWishlist(newWishlist);
    localStorage.setItem("customer_wishlist", JSON.stringify(newWishlist));
  };

  const addToCart = () => {
    if (!product) return;
    
    const newCart = { ...cart };
    newCart[product.id] = (newCart[product.id] || 0) + quantity;
    
    setCart(newCart);
    localStorage.setItem("customer_cart_items", JSON.stringify(newCart));
    
    // Also update simple cart array for header count
    const cartIds = Object.keys(newCart);
    localStorage.setItem("customer_cart", JSON.stringify(cartIds));
  };

  const buyNow = () => {
    addToCart();
    router.push("/customer/cart");
  };

  const shareProduct = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || "Check out this amazing handmade product!",
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        alert("Product link copied to clipboard!");
      }
    } else {
      // Fallback for browsers that don't support native sharing
      navigator.clipboard.writeText(window.location.href);
      alert("Product link copied to clipboard!");
    }
  };

  const contactArtisan = () => {
    if (product?.artisan) {
      router.push(`/customer/chat/${product.artisan.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push("/customer/products")}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const images = [product.imageUrl, product.posterUrl].filter(Boolean) as string[];
  const hasVideo = product.videoUrl && product.videoStatus === 'COMPLETED';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-emerald-600 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </button>
            <h1 className="text-lg font-medium text-gray-900 truncate">
              {product.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images & Video */}
          <div className="space-y-4">
            {/* View Selector - Show when both video and image exist */}
            {hasVideo && product.imageUrl && (
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setShowVideo(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    showVideo
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="inline-flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l7-5-7-5z"/>
                    </svg>
                    Video Demo
                  </span>
                </button>
                <button
                  onClick={() => setShowVideo(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    !showVideo
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="inline-flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Product Image
                  </span>
                </button>
              </div>
            )}
            
            {/* Main Display Area */}
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
              {hasVideo && showVideo ? (
                <video
                  key={product.videoUrl} 
                  src={product.videoUrl}
                  controls
                  controlsList="nodownload"
                  playsInline
                  className="w-full h-full object-contain bg-black"
                  poster={product.imageUrl || undefined}
                >
                  Your browser does not support the video tag.
                </video>
              ) : images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>

            {/* Video Info Badge */}
            {hasVideo && showVideo && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-900">AI-Generated Product Video</p>
                    <p className="text-xs text-emerald-700">Click ▶️ play button to watch the demo</p>
                  </div>
                </div>
              </div>
            )}

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex space-x-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? "border-emerald-500" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <button
                  onClick={shareProduct}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-emerald-600">
                  {product.currency === "INR" ? "₹" : "$"}{product.price.toLocaleString()}
                </span>
                {product.category && (
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                    {product.category}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Artisan Info */}
            {product?.artisan && (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Meet the Artisan
                </h3>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.artisan.name}</h4>
                    {product.artisan.location && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {product.artisan.location}
                      </div>
                    )}
                    {product.artisan.specialty && (
                      <p className="text-sm text-gray-600 mt-1">{product.artisan.specialty}</p>
                    )}
                    {product.artisan.bio && (
                      <p className="text-sm text-gray-600 mt-2">{product.artisan.bio}</p>
                    )}
                    <button
                      onClick={contactArtisan}
                      className="mt-3 flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Contact Artisan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Cultural Story */}
            {product.story && (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Cultural Story
                </h3>
                <p className="text-gray-600 leading-relaxed">{product.story}</p>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center space-x-4 mb-6">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={buyNow}
                  className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
                >
                  Buy Now
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={addToCart}
                    className="flex items-center justify-center py-3 border border-emerald-500 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </button>
                  
                  <button
                    onClick={toggleWishlist}
                    className={`flex items-center justify-center py-3 border rounded-lg font-medium transition-colors ${
                      wishlist.includes(product.id)
                        ? "border-red-500 text-red-600 bg-red-50"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${
                      wishlist.includes(product.id) ? "fill-current" : ""
                    }`} />
                    {wishlist.includes(product.id) ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </div>

            {/* Product Guarantees */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Promise</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-gray-600">
                    Authentic handmade products
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-gray-600">
                    Safe and secure delivery
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-gray-600">
                    Direct communication with artisan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X className="h-8 w-8" />
            </button>
            
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={() => setSelectedImage((selectedImage + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
