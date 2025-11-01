"use client";

import { useDynamicTranslation } from "@/lib/i18n/useDynamicTranslation";
import { useTranslatedProducts } from "@/lib/hooks/useTranslateContent";
import {
  Calendar,
  DollarSign,
  Edit,
  Eye,
  Heart,
  Package,
  Plus,
  Tag,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalViews: number;
  totalOrders: number;
}

export default function ArtisanDashboard() {
  const router = useRouter();
  const { translateBatch, t } = useDynamicTranslation();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const { translatedProducts, isLoading: isTranslating } =
    useTranslatedProducts(products);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeProducts: 0,
    totalViews: 0,
    totalOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    translateBatch([
      "Artisan Studio",
      "Welcome back",
      "Total Products",
      "Active Products",
      "Total Views",
      "Total Orders",
      "Quick Actions",
      "Create Product",
      "Chat with Customers",
      "Customer Feedback",
      "View Analytics",
      "Recent Products",
      "No products yet",
      "Start creating your first product",
      "Loading dashboard...",
      "Product Details",
      "Description",
      "Category",
      "Created At",
      "Status",
      "Product ID",
      "Active",
      "Inactive",
      "View Product",
      "Edit Product",
      "Delete Product",
      "Confirm delete product?",
      "Cancel",
      "View Live",
      "Translating products...",
      "Handmade",
      "Textile",
      "Pottery",
      "Jewelry",
      "Woodwork",
      "Metalwork",
      "Paintings",
      "Home Decor",
      "Traditional Wear",
      "Sculptures",
      "Other",
    ]);
  }, [translateBatch]);

  useEffect(() => {
    console.log("Component mounted, checking authentication...");
    if (checkAuth()) {
      fetchDashboardData();
    }
  }, []);

  const checkAuth = () => {
    const token =
      localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
    const role = localStorage.getItem("user_role");

    console.log("Auth check:", { hasToken: !!token, role });

    if (!token || role !== "ARTISAN") {
      console.log("Authentication failed, redirecting to login");
      router.push("/auth/artisan");
      return false;
    }
    return true;
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Get token from localStorage or cookies
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      if (!token) {
        console.error("No authentication token found");
        router.push("/auth/artisan");
        return;
      }

      console.log("Fetching user data...");

      // Fetch user info
      const userResponse = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      console.log("User API response:", userResponse.status);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log("User data received:", userData);
        setUser(userData.user);
      } else {
        console.error("Failed to fetch user data:", userResponse.status);

        if (userResponse.status === 401) {
          // Token might be expired, redirect to login
          localStorage.removeItem("auth_token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user_role");
          router.push("/auth/artisan");
          return;
        }
      }

      // Fetch products and stats
      const productsResponse = await fetch("/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      console.log("Products API response:", productsResponse.status);

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        console.log("Products data received:", productsData);

        // Set products with proper mapping
        const mappedProducts = (productsData.products || []).map(
          (product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            category: product.category,
            imageUrl: product.imageUrl,
            isActive: product.isActive,
            createdAt: product.createdAt,
          })
        );

        setProducts(mappedProducts);

        // Set stats from API response
        if (productsData.stats) {
          setStats(productsData.stats);
        } else {
          // Fallback calculation if stats not provided
          const totalProducts = mappedProducts.length;
          const activeProducts = mappedProducts.filter(
            (p: Product) => p.isActive
          ).length;

          setStats({
            totalProducts,
            activeProducts,
            totalViews: 0, // TODO: Implement proper analytics
            totalOrders: 0, // TODO: Implement proper order tracking
          });
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    router.push("/artisan/products/new");
  };

  const handleViewProduct = (productId: string) => {
    const product = translatedProducts.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowProductModal(true);
    }
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/artisan/products/edit/${productId}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm(t("Confirm delete product?"))) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("auth_token") ||
              localStorage.getItem("accessToken")
            }`,
          },
          credentials: "include",
        });

        if (response.ok) {
          fetchDashboardData(); // Refresh data
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const getCategoryTranslation = (category: string | undefined): string => {
    if (!category) return t('Other');
    
    // Map common category values to translation keys
    const categoryMap: Record<string, string> = {
      'handmade': 'Handmade',
      'textile': 'Textile',
      'textiles': 'Textile',
      'pottery': 'Pottery',
      'jewelry': 'Jewelry',
      'jewellery': 'Jewelry',
      'woodwork': 'Woodwork',
      'metalwork': 'Metalwork',
      'paintings': 'Paintings',
      'art': 'Paintings',
      'homeDecor': 'Home Decor',
      'home decor': 'Home Decor',
      'traditionalWear': 'Traditional Wear',
      'traditional wear': 'Traditional Wear',
      'sculptures': 'Sculptures',
      'other': 'Other'
    };
    
    const key = categoryMap[category.toLowerCase()] || 'Other';
    return t(key);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("Loading dashboard...")}</p>
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
            <h1 className="text-3xl font-bold text-foreground">
              {t("Artisan Studio")}
            </h1>
            <div className="h-1 w-32 bg-primary rounded-full mt-2 mb-2"></div>
            <p className="text-muted-foreground text-lg">
              {t("Welcome back")}, {user?.name || user?.email || "Artisan"}
              {user?.location && ` from ${user.location}`}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-accent rounded-lg px-4 py-3 border border-border">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {user?.name || "Artisan"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.specialty || "Creative Artist"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {stats.totalProducts}
              </p>
              <p className="text-muted-foreground text-sm">{t("Total Products")}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="h-12 w-12 bg-green-500 dark:bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {stats.activeProducts}
              </p>
              <p className="text-muted-foreground text-sm">{t("Active Products")}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="h-12 w-12 bg-blue-500 dark:bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {stats.totalViews}
              </p>
              <p className="text-muted-foreground text-sm">{t("Total Views")}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="h-12 w-12 bg-purple-500 dark:bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {stats.totalOrders}
              </p>
              <p className="text-muted-foreground text-sm">{t("Total Orders")}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl mb-8 p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {t("Quick Actions")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={handleAddProduct}
              className="flex items-center justify-center p-5 border-2 border-dashed border-primary/30 rounded-xl text-primary hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 bg-primary/5 group">
              <Plus className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{t("Create Product")}</span>
            </button>
            <button
              onClick={() => router.push("/artisan/messages")}
              className="flex items-center justify-center p-5 border-2 border-dashed border-blue-500/30 rounded-xl text-blue-600 dark:text-blue-400 hover:border-blue-500/60 hover:bg-blue-500/10 transition-all duration-300 bg-blue-500/5 group">
              <Users className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{t("Chat with Customers")}</span>
            </button>
            <button
              onClick={() => router.push("/artisan/feedback")}
              className="flex items-center justify-center p-5 border-2 border-dashed border-purple-500/30 rounded-xl text-purple-600 dark:text-purple-400 hover:border-purple-500/60 hover:bg-purple-500/10 transition-all duration-300 bg-purple-500/5 group">
              <Heart className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{t("Customer Feedback")}</span>
            </button>
            <button
              onClick={() => router.push("/artisan/analytics")}
              className="flex items-center justify-center p-5 border-2 border-dashed border-green-500/30 rounded-xl text-green-600 dark:text-green-400 hover:border-green-500/60 hover:bg-green-500/10 transition-all duration-300 bg-green-500/5 group">
              <TrendingUp className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{t("View Analytics")}</span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {t("Recent Products")}
              </h2>
            </div>
            <button
              onClick={handleAddProduct}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-all duration-300 flex items-center shadow-lg transform hover:scale-105">
              <Plus className="h-4 w-4 mr-2" />
              {t("Create Product")}
            </button>
          </div>

          <div className="p-6">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="h-20 w-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("No products yet")}
                </h3>
                <p className="text-muted-foreground mb-6">{t("Start creating your first product")}</p>
                <button
                  onClick={handleAddProduct}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-lg transform hover:scale-105">
                  {t("Create Product")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isTranslating && (
                  <div className="col-span-full text-center py-4">
                    <div className="inline-flex items-center text-primary">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      <span className="text-sm">{t("Translating products...")}</span>
                    </div>
                  </div>
                )}
                {translatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <div className="aspect-w-16 aspect-h-9 bg-accent relative overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-accent flex items-center justify-center">
                          <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3
                        className="font-semibold text-foreground mb-2 cursor-pointer hover:text-primary transition-colors text-lg"
                        onClick={() => handleViewProduct(product.id)}>
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <p className="text-xl font-bold text-primary mb-3">
                        ₹{product.price.toLocaleString()}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            product.isActive
                              ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}>
                          {product.isActive ? t("Active") : t("Inactive")}
                        </span>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewProduct(product.id)}
                            className="p-2 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                            title={t("View Product")}>
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product.id)}
                            className="p-2 text-muted-foreground hover:text-green-600 dark:hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                            title={t("Edit Product")}>
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title={t("Delete Product")}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-accent/30">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {t("Product Details")}
                </h2>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Product Image */}
              <div className="mb-6 rounded-xl overflow-hidden">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-72 object-cover bg-accent"
                  />
                ) : (
                  <div className="w-full h-72 bg-accent flex items-center justify-center rounded-xl">
                    <Package className="h-20 w-20 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div className="pb-4 border-b border-border">
                  <h3 className="text-3xl font-bold text-foreground mb-3">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-4xl font-bold text-primary">
                    ₹{selectedProduct.price.toLocaleString()}
                  </p>
                </div>

                {selectedProduct.description && (
                  <div className="bg-accent/30 rounded-xl p-5 border border-border">
                    <h4 className="text-lg font-bold text-foreground mb-3 flex items-center">
                      <Package className="h-5 w-5 mr-2 text-primary" />
                      {t("Description")}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProduct.category && (
                    <div className="bg-accent/50 border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center text-muted-foreground mb-2">
                        <Tag className="h-5 w-5 mr-2 text-blue-500" />
                        <span className="font-semibold">{t("Category")}</span>
                      </div>
                      <p className="text-foreground font-medium">
                        {getCategoryTranslation(selectedProduct.category)}
                      </p>
                    </div>
                  )}

                  <div className="bg-accent/50 border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center text-muted-foreground mb-2">
                      <Calendar className="h-5 w-5 mr-2 text-green-500" />
                      <span className="font-semibold">{t("Created At")}</span>
                    </div>
                    <p className="text-foreground font-medium">
                      {new Date(selectedProduct.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-accent/50 border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center text-muted-foreground mb-2">
                      <Heart className="h-5 w-5 mr-2 text-purple-500" />
                      <span className="font-semibold">{t("Status")}</span>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        selectedProduct.isActive
                          ? "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}>
                      {selectedProduct.isActive ? t("Active") : t("Inactive")}
                    </span>
                  </div>

                  <div className="bg-accent/50 border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center text-muted-foreground mb-2">
                      <DollarSign className="h-5 w-5 mr-2 text-yellow-500" />
                      <span className="font-semibold">{t("Product ID")}</span>
                    </div>
                    <p className="text-foreground font-mono text-sm break-all">
                      {selectedProduct.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <button
                  onClick={() => setShowProductModal(false)}
                  className="px-6 py-3 text-muted-foreground border border-border rounded-lg hover:text-foreground hover:bg-accent transition-all">
                  {t("Cancel")}
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowProductModal(false);
                      router.push(`/products/${selectedProduct.id}`);
                    }}
                    className="px-6 py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-300 flex items-center shadow-lg transform hover:scale-105">
                    <Eye className="h-4 w-4 mr-2" />
                    {t("View Live")}
                  </button>

                  <button
                    onClick={() => {
                      setShowProductModal(false);
                      handleEditProduct(selectedProduct.id);
                    }}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 flex items-center shadow-lg transform hover:scale-105">
                    <Edit className="h-4 w-4 mr-2" />
                    {t("Edit Product")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
