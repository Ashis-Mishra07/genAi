"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/hooks";
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
} from "lucide-react";

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

export default function NewProductPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
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
    { key: "textile", label: t("textile") },
    { key: "jewelry", label: t("jewelry") },
    { key: "pottery", label: t("pottery") },
    { key: "woodwork", label: t("woodwork") },
    { key: "metalwork", label: t("metalwork") },
    { key: "paintings", label: t("paintings") },
    { key: "homeDecor", label: t("homeDecor") },
    { key: "traditionalWear", label: t("traditionalWear") },
    { key: "sculptures", label: t("sculptures") },
    { key: "other", label: t("other") },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
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
        throw new Error(t("productNameRequired"));
      }
      if (formData.price <= 0) {
        throw new Error(t("priceGreaterThanZero"));
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || t("failedToCreateProduct")
        );
      }

      setSuccess(t("productCreatedSuccess"));

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/artisan/dashboard");
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : t("unexpectedError")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    alert(t("previewComingSoon"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/artisan/dashboard")}
            className="flex items-center text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t("backToDashboard")}
          </button>
          <div className="flex items-center text-white">
            <Package className="h-6 w-6 mr-2" />
            <span className="text-xl font-bold">{t("createNewProduct")}</span>
          </div>
        </div>

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
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Type className="h-5 w-5 mr-2 text-orange-400" />
              {t("basicInformation")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  {t("productName")} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={t("enterProductName")}
                  required
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  {t("category")}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                  <option value="" className="bg-slate-800">
                    {t("category")}
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category.key}
                      value={category.key}
                      className="bg-slate-800">
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  {t("price")} *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={t("enterPrice")}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  {t("currency")}
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                  <option value="INR" className="bg-slate-800">
                    INR (₹)
                  </option>
                  <option value="USD" className="bg-slate-800">
                    USD ($)
                  </option>
                  <option value="EUR" className="bg-slate-800">
                    EUR (€)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  {t("stockQuantity")}
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
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
                    className="w-4 h-4 text-orange-500 bg-white/5 border-white/20 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-white/90">
                    {t("active")}
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-orange-500 bg-white/5 border-white/20 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-white/90">
                    {t("featured")}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Description & Story */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-400" />
              {t("descriptionStory")}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  {t("productDescription")}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                  placeholder={t("describeProduct")}
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  {t("culturalStory")}
                </label>
                <textarea
                  name="story"
                  value={formData.story}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                  placeholder={t("culturalStoryPlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Tag className="h-5 w-5 mr-2 text-orange-400" />
              {t("productDetails")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  <Palette className="h-4 w-4 inline mr-1" />
                  {t("materials")}
                </label>
                <input
                  type="text"
                  name="materials"
                  value={formData.materials}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={t("materialsPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {t("culturalOrigin")}
                </label>
                <input
                  type="text"
                  name="culture"
                  value={formData.culture}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={t("culturalOriginPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  {t("artistName")}
                </label>
                <input
                  type="text"
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={t("creatorName")}
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  <Ruler className="h-4 w-4 inline mr-1" />
                  {t("dimensions")}
                </label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={t("dimensionsPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  <Weight className="h-4 w-4 inline mr-1" />
                  {t("weight")}
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={t("weightPlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Images & Links */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-orange-400" />
              {t("imagesLinks")}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  {t("productImageUrl")}
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  {t("marketingPosterUrl")}
                </label>
                <input
                  type="url"
                  name="posterUrl"
                  value={formData.posterUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="https://example.com/poster.jpg"
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  {t("instagramPostUrl")}
                </label>
                <input
                  type="url"
                  name="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
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
              className="flex items-center px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white/90 hover:bg-white/20 transition-colors">
              <Eye className="h-4 w-4 mr-2" />
              {t("preview")}
            </button>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white/90 hover:bg-white/20 transition-colors">
                {t("cancel")}
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t("creating")}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t("createProduct")}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
