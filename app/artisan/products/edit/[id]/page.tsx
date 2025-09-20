"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Package,
  DollarSign,
  Type,
  FileText,
  Tag,
  MapPin,
  Palette,
  Ruler,
  Weight,
  Save,
  Eye,
  Camera,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/language/LanguageContext";

interface ProductFormData {
  name: string;
  description: string;
  story: string;
  price: number;
  currency: string;
  category: string;
  materials: string;
  culture: string;
  artistName: string;
  dimensions: string;
  weight: string;
  imageUrl: string;
  posterUrl: string;
  instagramUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  stockQuantity: number;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { t } = useLanguage();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    story: "",
    price: 0,
    currency: "INR",
    category: "",
    materials: "",
    culture: "",
    artistName: "",
    dimensions: "",
    weight: "",
    imageUrl: "",
    posterUrl: "",
    instagramUrl: "",
    isActive: true,
    isFeatured: false,
    stockQuantity: 1,
  });

  const categories = [
    { key: "textilesAndFabrics", label: t("textilesAndFabrics") },
    { key: "jewelryAndAccessories", label: t("jewelryAndAccessories") },
    { key: "potteryAndCeramics", label: t("potteryAndCeramics") },
    { key: "woodCrafts", label: t("woodCrafts") },
    { key: "metalWork", label: t("metalWork") },
    { key: "paintingsAndArt", label: t("paintingsAndArt") },
    { key: "homeDecor", label: t("homeDecor") },
    { key: "traditionalWear", label: t("traditionalWear") },
    { key: "sculptures", label: t("sculptures") },
    { key: "other", label: t("other") },
  ];

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load product");
        }

        const data = await response.json();
        const product = data.product;

        setFormData({
          name: product.name || "",
          description: product.description || "",
          story: product.story || "",
          price: product.price || 0,
          currency: product.currency || "INR",
          category: product.category || "",
          materials: product.materials || "",
          culture: product.culture || "",
          artistName: product.artistName || "",
          dimensions: product.dimensions || "",
          weight: product.weight || "",
          imageUrl: product.imageUrl || "",
          posterUrl: product.posterUrl || "",
          instagramUrl: product.instagramUrl || "",
          isActive: product.isActive ?? true,
          isFeatured: product.isFeatured ?? false,
          stockQuantity: product.stockQuantity || 1,
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load product");
      } finally {
        setIsLoadingProduct(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" 
        ? (e.target as HTMLInputElement).checked
        : type === "number" 
          ? parseFloat(value) || 0
          : value,
    }));
    
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error("Product name is required");
      }
      if (formData.price <= 0) {
        throw new Error("Price must be greater than 0");
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      setSuccess("Product updated successfully!");
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/artisan/dashboard");
      }, 1500);

    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    router.push(`/products/${productId}`);
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center text-slate-400 hover:text-white transition-colors mr-4">
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t('back')}
            </button>
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-500 mr-3" />
              <h1 className="text-2xl font-bold text-white">
                {t('editProduct')}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Status Messages */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Type className="h-5 w-5 mr-2 text-orange-500" />
              {t('basicInformation')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('productName')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('category')}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                  <option value="">{t('selectCategory')}</option>
                  {categories.map((category) => (
                    <option key={category.key} value={category.key}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('price')} *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('currency')}
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('stockQuantity')}
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  min="0"
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="rounded border-slate-600 text-orange-500 focus:ring-orange-500 bg-slate-700"
                  />
                  <span className="ml-2 text-sm text-slate-300">{t('active')}</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="rounded border-slate-600 text-orange-500 focus:ring-orange-500 bg-slate-700"
                  />
                  <span className="ml-2 text-sm text-slate-300">{t('featured')}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Description & Story */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-500" />
              {t('descriptionStory')}
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('productDescription')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="Describe your product..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('culturalStory')}
                </label>
                <textarea
                  name="story"
                  value={formData.story}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="Tell the cultural story behind your product..."
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Tag className="h-5 w-5 mr-2 text-orange-500" />
              {t('productDetails')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('materials')}
                </label>
                <input
                  type="text"
                  name="materials"
                  value={formData.materials}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="e.g., Cotton, Silk, Wood"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('culturalOrigin')}
                </label>
                <input
                  type="text"
                  name="culture"
                  value={formData.culture}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="e.g., Rajasthani, Bengali"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('artistName')}
                </label>
                <input
                  type="text"
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="Creator's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('dimensions')}
                </label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="e.g., 30cm x 20cm x 5cm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('weight')}
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="e.g., 500g"
                />
              </div>
            </div>
          </div>

          {/* Images & Links */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-orange-500" />
              {t('imagesLinks')}
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('productImageUrl')}
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('marketingPosterUrl')}
                </label>
                <input
                  type="url"
                  name="posterUrl"
                  value={formData.posterUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="https://example.com/poster.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('instagramPostUrl')}
                </label>
                <input
                  type="url"
                  name="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="https://instagram.com/p/..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePreview}
              className="flex items-center px-6 py-3 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Eye className="h-4 w-4 mr-2" />
              {t('preview')}
            </button>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                {t('cancel')}
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isLoading ? t('updating') : t('updateProduct')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}
