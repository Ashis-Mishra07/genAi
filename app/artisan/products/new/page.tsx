"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDynamicTranslation } from "@/lib/i18n/useDynamicTranslation";
import {
  ArrowLeft,
  Upload,
  Package,
  DollarSign,
  Type,
  FileText,
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
  const { t, translateBatch, currentLocale } = useDynamicTranslation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    translateBatch([
      "Create New Product",
      "Back to Dashboard",
      "Basic Information",
      "Product Name",
      "Enter Product Name",
      "Category",
      "Select Category",
      "Price",
      "Enter Price",
      "Currency",
      "Stock Quantity",
      "Active",
      "Featured",
      "Description & Story",
      "Product Description",
      "Describe your product...",
      "Cultural Story",
      "Tell the cultural story behind your product...",
      "Product Details",
      "Materials",
      "e.g., Cotton, Silk, Wood",
      "Cultural Origin",
      "e.g., Rajasthani, Bengali",
      "Artist Name",
      "Creator's name",
      "Dimensions",
      "e.g., 30cm x 20cm x 5cm",
      "Weight",
      "e.g., 500g",
      "Images & Links",
      "Product Image URL",
      "Marketing Poster URL",
      "Instagram Post URL",
      "Preview",
      "Cancel",
      "Creating...",
      "Create Product",
      "Textile",
      "Jewelry",
      "Pottery",
      "Woodwork",
      "Metalwork",
      "Paintings",
      "Home Decor",
      "Traditional Wear",
      "Sculptures",
      "Other",
    ]);
  }, [currentLocale, translateBatch]);

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
    { key: "textile", label: t("Textile") },
    { key: "jewelry", label: t("Jewelry") },
    { key: "pottery", label: t("Pottery") },
    { key: "woodwork", label: t("Woodwork") },
    { key: "metalwork", label: t("Metalwork") },
    { key: "paintings", label: t("Paintings") },
    { key: "homeDecor", label: t("Home Decor") },
    { key: "traditionalWear", label: t("Traditional Wear") },
    { key: "sculptures", label: t("Sculptures") },
    { key: "other", label: t("Other") },
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
        throw new Error("Product name is required");
      }
      if (formData.price <= 0) {
        throw new Error("Price must be greater than 0");
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
        throw new Error(data.error || "Failed to create product");
      }

      setSuccess("Product created successfully!");

      // Redirect to products page after a short delay
      setTimeout(() => {
        router.push("/artisan/products");
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    alert("Preview functionality coming soon!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/artisan/dashboard")}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t("Back to Dashboard")}
        </button>
        <div className="flex items-center">
          <Package className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            {t("Create New Product")}
          </h1>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-500/10 border border-green-500/50 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
              <Type className="h-5 w-5 mr-2 text-primary" />
              {t("Basic Information")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  {t("Product Name")} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder={t("Enter Product Name")}
                  required
                />
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  {t("Category")}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                  <option value="">
                    {t("Select Category")}
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category.key}
                      value={category.key}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  {t("Price")} *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder={t("Enter Price")}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  {t("Currency")}
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                  <option value="INR">
                    INR (₹)
                  </option>
                  <option value="USD">
                    USD ($)
                  </option>
                  <option value="EUR">
                    EUR (€)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  {t("Stock Quantity")}
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6 mt-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-foreground">
                  {t("Active")}
                </span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-foreground">
                  {t("Featured")}
                </span>
              </label>
            </div>
          </div>

          {/* Description & Story */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              {t("Description & Story")}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  {t("Product Description")}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder={t("Describe your product...")}
                />
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  {t("Cultural Story")}
                </label>
                <textarea
                  name="story"
                  value={formData.story}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder={t("Tell the cultural story behind your product...")}
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
              <Package className="h-5 w-5 mr-2 text-primary" />
              {t("Product Details")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  <Palette className="h-4 w-4 inline mr-1" />
                  {t("Materials")}
                </label>
                <input
                  type="text"
                  name="materials"
                  value={formData.materials}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder={t("e.g., Cotton, Silk, Wood")}
                />
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {t("Cultural Origin")}
                </label>
                <input
                  type="text"
                  name="culture"
                  value={formData.culture}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder={t("e.g., Rajasthani, Bengali")}
                />
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  {t("Artist Name")}
                </label>
                <input
                  type="text"
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder={t("Creator's name")}
                />
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  <Ruler className="h-4 w-4 inline mr-1" />
                  {t("Dimensions")}
                </label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder={t("e.g., 30cm x 20cm x 5cm")}
                />
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  <Weight className="h-4 w-4 inline mr-1" />
                  {t("Weight")}
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder={t("e.g., 500g")}
                />
              </div>
            </div>
          </div>

          {/* Images & Links */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-primary" />
              {t("Images & Links")}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  {t("Product Image URL")}
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  {t("Marketing Poster URL")}
                </label>
                <input
                  type="url"
                  name="posterUrl"
                  value={formData.posterUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="https://example.com/poster.jpg"
                />
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  {t("Instagram Post URL")}
                </label>
                <input
                  type="url"
                  name="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="https://instagram.com/p/..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={handlePreview}
              className="flex items-center justify-center px-6 py-3 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-foreground transition-colors">
              <Eye className="h-4 w-4 mr-2" />
              {t("Preview")}
            </button>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 sm:flex-none px-6 py-3 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-foreground transition-colors">
                {t("Cancel")}
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 sm:flex-none flex items-center justify-center px-8 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    {t("Creating...")}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t("Create Product")}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
  );
}
