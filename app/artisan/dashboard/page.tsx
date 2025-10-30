"use client";

import { useTranslation } from "@/lib/i18n/hooks";
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
  const { t } = useTranslation();
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
    if (confirm(t("confirmDeleteProduct"))) {
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
    if (!category) return t('other');
    
    // Map common category values to translation keys
    const categoryMap: Record<string, string> = {
      'handmade': 'handmade',
      'textile': 'textile',
      'textiles': 'textile',
      'pottery': 'pottery',
      'jewelry': 'jewelry',
      'jewellery': 'jewelry',
      'woodwork': 'woodwork',
      'metalwork': 'metalwork',
      'paintings': 'paintings',
      'art': 'paintings',
      'homeDecor': 'homeDecor',
      'home decor': 'homeDecor',
      'traditionalWear': 'traditionalWear',
      'traditional wear': 'traditionalWear',
      'sculptures': 'sculptures',
      'other': 'other'
    };
    
    const key = categoryMap[category.toLowerCase()] || 'other';
    return t(key as any);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("loadingDashboard")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("artisanStudio")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("welcomeBack")}, {user?.name || user?.email || "Artisan"}
              {user?.location && ` from ${user.location}`}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-muted rounded-2xl px-4 py-3 border border-border hover:shadow-sm transition-all duration-300">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
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
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-foreground">
                  {stats.totalProducts}
                </p>
                <p className="text-muted-foreground text-sm">{t("totalProducts")}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-foreground">
                  {stats.activeProducts}
                </p>
                <p className="text-muted-foreground text-sm">{t("activeProducts")}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-foreground">
                  {stats.totalViews}
                </p>
                <p className="text-muted-foreground text-sm">{t("totalViews")}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-foreground">
                  {stats.totalOrders}
                </p>
                <p className="text-muted-foreground text-sm">{t("totalOrders")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-2xl mb-8 p-6 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {t("quickActions")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={handleAddProduct}
              className="flex items-center justify-center p-4 border-2 border-dashed border-primary/30 rounded-xl text-primary hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 bg-primary/5">
              <Plus className="h-5 w-5 mr-2" />
              {t("createProduct")}
            </button>
            <button
              onClick={() => router.push("/artisan/messages")}
              className="flex items-center justify-center p-4 border-2 border-dashed border-blue-500/30 rounded-xl text-blue-600 dark:text-blue-400 hover:border-blue-500/60 hover:bg-blue-500/5 transition-all duration-300 bg-blue-500/5">
              <Users className="h-5 w-5 mr-2" />
              {t("chatWithCustomers")}
            </button>
            <button
              onClick={() => router.push("/artisan/feedback")}
              className="flex items-center justify-center p-4 border-2 border-dashed border-purple-500/30 rounded-xl text-purple-600 dark:text-purple-400 hover:border-purple-500/60 hover:bg-purple-500/5 transition-all duration-300 bg-purple-500/5">
              <Heart className="h-5 w-5 mr-2" />
              {t("customerFeedback")}
            </button>
            <button
              onClick={() => router.push("/artisan/analytics")}
              className="flex items-center justify-center p-4 border-2 border-dashed border-green-500/30 rounded-xl text-green-600 dark:text-green-400 hover:border-green-500/60 hover:bg-green-500/5 transition-all duration-300 bg-green-500/5">
              <TrendingUp className="h-5 w-5 mr-2" />
              {t("viewAnalytics")}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-card border border-border rounded-2xl hover:shadow-lg transition-all duration-300">
          <div className="px-6 py-5 border-b border-border flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">
              {t("recentProducts")}
            </h2>
            <button
              onClick={handleAddProduct}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-all duration-300 flex items-center shadow-sm hover:shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              {t("createProduct")}
            </button>
          </div>

          <div className="p-6">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {t("noProducts")}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{t("startCreating")}</p>
                <button
                  onClick={handleAddProduct}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md">
                  {t("createProduct")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isTranslating && (
                  <div className="col-span-full text-center py-4">
                    <div className="inline-flex items-center text-primary">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      <span className="text-sm">Translating products...</span>
                    </div>
                  </div>
                )}
                {translatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                    <div className="aspect-w-16 aspect-h-9 bg-muted">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3
                        className="font-semibold text-foreground mb-2 cursor-pointer hover:text-primary transition-colors line-clamp-1"
                        onClick={() => handleViewProduct(product.id)}>
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <p className="text-xl font-bold text-primary mb-4">
                        ₹{product.price.toLocaleString()}
                      </p>

                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            product.isActive
                              ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                              : "bg-muted/50 text-muted-foreground border border-border"
                          }`}>
                          {product.isActive ? t("active") : t("inactive")}
                        </span>

                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleViewProduct(product.id)}
                            className="p-2 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                            title={t("viewProduct")}>
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product.id)}
                            className="p-2 text-muted-foreground hover:text-green-600 dark:hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200"
                            title={t("editProduct")}>
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200"
                            title={t("deleteProduct")}>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {t("productDetails")}
              </h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Product Image */}
              <div className="mb-6">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-2xl bg-muted border border-border"
                  />
                ) : (
                  <div className="w-full h-64 bg-muted flex items-center justify-center rounded-2xl border border-border">
                    <Package className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-3xl font-bold text-primary">
                    ₹{selectedProduct.price.toLocaleString()}
                  </p>
                </div>

                {selectedProduct.description && (
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <Package className="h-5 w-5 mr-2 text-primary" />
                      {t("description")}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProduct.category && (
                    <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                      <div className="flex items-center text-slate-300">
                        <Tag className="h-5 w-5 mr-2 text-blue-400" />
                        <span className="font-medium">{t("category")}</span>
                      </div>
                      <p className="text-white mt-1">
                        {getCategoryTranslation(selectedProduct.category)}
                      </p>
                    </div>
                  )}

                  <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                    <div className="flex items-center text-slate-300">
                      <Calendar className="h-5 w-5 mr-2 text-green-400" />
                      <span className="font-medium">{t("createdAt")}</span>
                    </div>
                    <p className="text-white mt-1">
                      {new Date(selectedProduct.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                    <div className="flex items-center text-slate-300">
                      <Heart className="h-5 w-5 mr-2 text-purple-400" />
                      <span className="font-medium">{t("status")}</span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        selectedProduct.isActive
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                      }`}>
                      {selectedProduct.isActive ? t("active") : t("inactive")}
                    </span>
                  </div>

                  <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                    <div className="flex items-center text-slate-300">
                      <DollarSign className="h-5 w-5 mr-2 text-yellow-400" />
                      <span className="font-medium">{t("productId")}</span>
                    </div>
                    <p className="text-white mt-1 text-sm font-mono">
                      {selectedProduct.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
                <button
                  onClick={() => setShowProductModal(false)}
                  className="px-6 py-2 text-slate-400 border border-slate-600 rounded-lg hover:text-white hover:border-slate-500 transition-colors">
                  {t("cancel")}
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowProductModal(false);
                      router.push(`/products/${selectedProduct.id}`);
                    }}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    {t("viewLive")}
                  </button>

                  <button
                    onClick={() => {
                      setShowProductModal(false);
                      handleEditProduct(selectedProduct.id);
                    }}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center">
                    <Edit className="h-4 w-4 mr-2" />
                    {t("editProduct")}
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
