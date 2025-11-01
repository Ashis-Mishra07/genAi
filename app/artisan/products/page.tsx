"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/hooks";
import {
  useTranslatedProducts,
  useTranslateContent,
} from "@/lib/hooks/useTranslateContent";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  DollarSign,
  Camera,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  videoUrl?: string;
  videoStatus?: string;
  isActive: boolean;
  createdAt: string;
}

interface NewProduct {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
}

export default function ArtisanProductsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { translateText, isHindi } = useTranslateContent();
  const [products, setProducts] = useState<Product[]>([]);
  const { translatedProducts, isLoading: isTranslating } =
    useTranslatedProducts(products);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlides, setCurrentSlides] = useState<{ [key: string]: number }>({});

  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
  });

  useEffect(() => {
    checkAuth();
    fetchProducts();
  }, []);

  const checkAuth = () => {
    const token =
      localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
    const role = localStorage.getItem("user_role");

    if (!token || role !== "ARTISAN") {
      router.push("/auth/artisan");
      return false;
    }
    return true;
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      const response = await fetch("/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else if (response.status === 401) {
        router.push("/auth/artisan");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(
        isHindi ? "उत्पाद लोड करने में विफल" : "Failed to load products"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewProduct({
          name: "",
          description: "",
          price: "",
          category: "",
          imageUrl: "",
        });
        fetchProducts();
      } else {
        const errorData = await response.json();
        setError(
          errorData.error ||
            (isHindi ? "उत्पाद बनाने में विफल" : "Failed to create product")
        );
      }
    } catch (error) {
      setError(isHindi ? "उत्पाद बनाने में विफल" : "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmMessage = isHindi
      ? "क्या आप वाकई इस उत्पाद को हटाना चाहते हैं?"
      : "Are you sure you want to delete this product?";
    if (!confirm(confirmMessage)) return;

    try {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleToggleStatus = async (
    productId: string,
    currentStatus: boolean
  ) => {
    try {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  const filteredProducts = translatedProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && product.isActive) ||
      (filterStatus === "inactive" && !product.isActive);

    return matchesSearch && matchesFilter;
  });

  const nextSlide = (productId: string, totalSlides: number) => {
    setCurrentSlides(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalSlides
    }));
  };

  const prevSlide = (productId: string, totalSlides: number) => {
    setCurrentSlides(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + totalSlides) % totalSlides
    }));
  };

  const goToSlide = (productId: string, slideIndex: number) => {
    setCurrentSlides(prev => ({
      ...prev,
      [productId]: slideIndex
    }));
  };

  if (isLoading || isTranslating) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">
            {isTranslating
              ? isHindi
                ? "अनुवाद हो रहा है..."
                : "Translating..."
              : isHindi
              ? "उत्पाद लोड हो रहे हैं..."
              : "Loading products..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{t("products")}</h1>
            <p className="text-slate-400">
              {products.length} {isHindi ? "उत्पाद कुल" : "products total"}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            {t("createProduct")}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Filters */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={isHindi ? "उत्पाद खोजें..." : "Search products..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "all" | "active" | "inactive")
              }
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
              <option value="all">
                {isHindi ? "सभी उत्पाद" : "All Products"}
              </option>
              <option value="active">{t("active")}</option>
              <option value="inactive">{t("inactive")}</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {isHindi ? "कोई उत्पाद नहीं मिला" : "No products found"}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchTerm || filterStatus !== "all"
                ? isHindi
                  ? "अपनी खोज या फ़िल्टर को समायोजित करने का प्रयास करें"
                  : "Try adjusting your search or filter"
                : isHindi
                ? "अपना पहला उत्पाद बनाकर शुरुआत करें"
                : "Start by creating your first product"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
                {t("createProduct")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const currentSlide = currentSlides[product.id] || 0;
              const hasVideo = product.videoUrl && product.videoStatus === 'COMPLETED';
              const totalSlides = hasVideo ? 2 : 1;

              return (
                <div
                  key={product.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-orange-500/50 transition-all hover:shadow-lg">
                  {/* Carousel Container */}
                  <div className="relative aspect-w-16 aspect-h-9 bg-slate-700 group">
                    {/* Image Slide */}
                    <div className={`w-full h-48 ${currentSlide === 0 ? 'block' : 'hidden'}`}>
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
                    </div>

                    {/* Video Slide */}
                    {hasVideo && (
                      <div className={`w-full h-48 ${currentSlide === 1 ? 'block' : 'hidden'}`}>
                        <video
                          src={product.videoUrl}
                          className="w-full h-full object-cover"
                          controls
                          muted
                          loop
                        />
                      </div>
                    )}

                    {/* Carousel Navigation - only show if video exists */}
                    {hasVideo && (
                      <>
                        {/* Previous Button */}
                        <button
                          onClick={() => prevSlide(product.id, totalSlides)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Previous slide">
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        {/* Next Button */}
                        <button
                          onClick={() => nextSlide(product.id, totalSlides)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Next slide">
                          <ChevronRight className="h-4 w-4" />
                        </button>

                        {/* Slide Indicators */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                          {[...Array(totalSlides)].map((_, index) => (
                            <button
                              key={index}
                              onClick={() => goToSlide(product.id, index)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                currentSlide === index
                                  ? 'bg-orange-500 w-4'
                                  : 'bg-white/50 hover:bg-white/75'
                              }`}
                              aria-label={`Go to slide ${index + 1}`}
                            />
                          ))}
                        </div>

                        {/* Media Type Badge */}
                        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                          {currentSlide === 0 ? '📸 Poster' : '🎬 Video'}
                        </div>
                      </>
                    )}
                  </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white line-clamp-1">
                      {product.name}
                    </h3>
                    <button
                      onClick={() =>
                        handleToggleStatus(product.id, product.isActive)
                      }
                      className={`px-2 py-1 text-xs rounded-full ${
                        product.isActive
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                      }`}>
                      {product.isActive ? t("active") : t("inactive")}
                    </button>
                  </div>

                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-orange-400">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-500 bg-slate-700 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/products/${product.id}`)}
                        className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                        title={isHindi ? "उत्पाद देखें" : "View Product"}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/artisan/products/edit/${product.id}`)
                        }
                        className="p-2 text-slate-400 hover:text-green-400 transition-colors"
                        title={
                          isHindi ? "उत्पाद संपादित करें" : "Edit Product"
                        }>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                        title={isHindi ? "उत्पाद हटाएं" : "Delete Product"}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {t("createProduct")}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {isHindi ? "उत्पाद का नाम" : "Product Name"}
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={
                    isHindi ? "उत्पाद का नाम दर्ज करें" : "Enter product name"
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {isHindi ? "विवरण" : "Description"}
                </label>
                <textarea
                  required
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={
                    isHindi
                      ? "उत्पाद का विवरण दर्ज करें"
                      : "Enter product description"
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {isHindi ? "मूल्य (₹)" : "Price (₹)"}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {isHindi ? "श्रेणी" : "Category"}
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={
                    isHindi
                      ? "जैसे: वस्त्र, मिट्टी के बर्तन, आभूषण"
                      : "e.g., Textiles, Pottery, Jewelry"
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {isHindi ? "छवि URL (वैकल्पिक)" : "Image URL (optional)"}
                </label>
                <input
                  type="url"
                  value={newProduct.imageUrl}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, imageUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/20 border border-red-500/50 rounded px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors">
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {t("createProduct")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
