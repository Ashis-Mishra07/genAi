"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDynamicTranslation } from "@/lib/i18n/useDynamicTranslation";
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
  const { translateBatch, t } = useDynamicTranslation();
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
    translateBatch([
      "Product Management",
      "Manage your product catalog",
      "Add Product",
      "Search products",
      "All",
      "Active",
      "Inactive",
      "Loading products...",
      "No products found",
      "Try adjusting your search or filters",
      "Create your first product",
      "Edit",
      "Delete",
      "View",
      "Product Name",
      "Description",
      "Price",
      "Category",
      "Image URL",
      "Save Product",
      "Cancel",
      "Creating product...",
      "Confirm delete product?",
      "Page",
      "of",
      "Previous",
      "Next",
      "Showing",
      "to",
      "results",
      "Video processing",
      "Video ready",
    ]);
  }, [translateBatch]);

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isTranslating
              ? t("Translating products...")
              : t("Loading products...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl px-6 py-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("Product Management")}</h1>
            <div className="h-1 w-32 bg-primary rounded-full mt-2 mb-2"></div>
            <p className="text-muted-foreground text-lg">
              {t("Manage your product catalog")} • {products.length} {t("products total")}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-all duration-300 flex items-center shadow-lg transform hover:scale-105">
            <Plus className="h-5 w-5 mr-2" />
            {t("Add Product")}
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("Search products")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 w-full transition-all"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "all" | "active" | "inactive")
              }
              className="bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="all">{t("All")}</option>
              <option value="active">{t("Active")}</option>
              <option value="inactive">{t("Inactive")}</option>
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
            <div className="bg-accent/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t("No products found")}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm || filterStatus !== "all"
                ? t("Try adjusting your search or filters")
                : t("Create your first product")}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 hover:shadow-lg transform hover:scale-105 transition-all">
                {t("Add Product")}
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
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-xl">
                  {/* Carousel Container */}
                  <div className="relative aspect-w-16 aspect-h-9 bg-muted group">
                    {/* Image Slide */}
                    <div className={`w-full h-48 ${currentSlide === 0 ? 'block' : 'hidden'}`}>
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
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
                                  ? 'bg-primary w-4'
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

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground line-clamp-1 text-lg">
                      {product.name}
                    </h3>
                    <button
                      onClick={() =>
                        handleToggleStatus(product.id, product.isActive)
                      }
                      className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                        product.isActive
                          ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                          : "bg-muted text-muted-foreground border border-border hover:bg-accent"
                      }`}>
                      {product.isActive ? t("Active") : t("Inactive")}
                    </button>
                  </div>

                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-primary">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground bg-accent px-3 py-1 rounded-full border border-border">
                      {product.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex space-x-1">
                      <button
                        onClick={() => router.push(`/products/${product.id}`)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-all"
                        title={t("View")}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/artisan/products/edit/${product.id}`)
                        }
                        className="p-2 text-muted-foreground hover:text-green-500 hover:bg-accent rounded-lg transition-all"
                        title={t("Edit")}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-accent rounded-lg transition-all"
                        title={t("Delete")}>
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
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-border bg-accent/30">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  {t("Add Product")}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent p-2 rounded-lg transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("Product Name")}
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder={t("Product Name")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("Description")}
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
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  placeholder={t("Description")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("Price")} (₹)
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
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("Category")}
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder={t("Category")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("Image URL")} (optional)
                </label>
                <input
                  type="url"
                  value={newProduct.imageUrl}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, imageUrl: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/20 border border-red-500/50 rounded px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex space-x-3 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 text-foreground border border-border rounded-lg hover:bg-accent transition-all font-medium">
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center font-medium">
                  {isSubmitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      {t("Save Product")}
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
