"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

// Enhanced translation hook for customer pages with language state
function useCustomerTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "hi">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("customer_language") as "en" | "hi") || "en";
    }
    return "en";
  });

  const isHindi = currentLanguage === "hi";

  const translateText = async (text: string): Promise<string> => {
    if (!isHindi || !text) return text;

    try {
      console.log("Translating text:", text);
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: "hi" }),
      });
      const data = await response.json();
      console.log("Translation result:", data);
      return data.translatedText || text;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  const switchLanguage = (lang: "en" | "hi") => {
    setCurrentLanguage(lang);
    localStorage.setItem("customer_language", lang);
  };

  return { translateText, isHindi, currentLanguage, switchLanguage };
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  materials: string;
  dimensions: string;
  weight: number;
  artist_name: string;
  artist_bio: string;
  cultural_origin: string;
  creation_story: string;
  care_instructions: string;
  instagram_media_id: string;
  instagram_post_url: string;
  image_url: string;
  videoUrl?: string;
  videoStatus?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductInquiry {
  id: number;
  product_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  instagram_username?: string;
  message: string;
  inquiry_type: string;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [inquiries, setInquiries] = useState<ProductInquiry[]>([]);
  const [translatedProduct, setTranslatedProduct] = useState<Product | null>(
    null
  );
  const { translateText, isHindi, currentLanguage, switchLanguage } =
    useCustomerTranslation();
  const [loading, setLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    instagram_username: "",
    message: "",
    inquiry_type: "PURCHASE",
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Re-translate when language changes
  useEffect(() => {
    if (product && !loading) {
      translateProductData(product);
    }
  }, [currentLanguage, product]);

  const translateProductData = async (productData: Product) => {
    console.log("translateProductData called with isHindi:", isHindi);
    if (!isHindi) {
      setTranslatedProduct(productData);
      return;
    }

    setIsTranslating(true);
    try {
      console.log("Starting translation for product:", productData.name);
      const [
        translatedName,
        translatedDescription,
        translatedCategory,
        translatedMaterials,
      ] = await Promise.all([
        translateText(productData.name),
        translateText(productData.description),
        translateText(productData.category),
        translateText(productData.materials),
      ]);

      const translatedProductData = {
        ...productData,
        name: translatedName,
        description: translatedDescription,
        category: translatedCategory,
        materials: translatedMaterials,
      };

      console.log("Translation completed:", translatedProductData);
      setTranslatedProduct(translatedProductData);
    } catch (error) {
      console.error("Translation failed:", error);
      setTranslatedProduct(productData);
    } finally {
      setIsTranslating(false);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.product);
        setInquiries(data.inquiries || []);
        // Initialize translatedProduct immediately
        setTranslatedProduct(data.product);
        translateProductData(data.product);
      } else {
        setError(
          data.error ||
            (isHindi ? "उत्पाद लोड करने में विफल" : "Failed to load product")
        );
      }
    } catch (err) {
      setError(isHindi ? "उत्पाद लोड करने में विफल" : "Failed to load product");
      console.error("Product fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...inquiryForm,
          product_id: product.id,
          source: "PRODUCT_PAGE",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowInquiryForm(false);
        setInquiryForm({
          customer_name: "",
          customer_email: "",
          customer_phone: "",
          instagram_username: "",
          message: "",
          inquiry_type: "PURCHASE",
        });
        // Refresh inquiries
        fetchProduct();
        alert(
          isHindi
            ? "आपकी पूछताछ सफलतापूर्वक भेजी गई!"
            : "Your inquiry has been sent successfully!"
        );
      } else {
        alert(
          (isHindi ? "पूछताछ भेजने में विफल: " : "Failed to send inquiry: ") +
            data.error
        );
      }
    } catch (err) {
      console.error("Inquiry submission error:", err);
      alert(isHindi ? "पूछताछ भेजने में विफल" : "Failed to send inquiry");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>{isHindi ? "उत्पाद लोड हो रहा है..." : "Loading product..."}</p>
          {isTranslating && (
            <p className="text-sm text-gray-500 mt-2">
              {isHindi ? "अनुवाद हो रहा है..." : "Translating..."}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-2">
            {isHindi ? "उत्पाद नहीं मिला" : "Product Not Found"}
          </h2>
          <p>
            {error ||
              (isHindi
                ? "अनुरोधित उत्पाद नहीं मिल सका।"
                : "The requested product could not be found.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Language Selector */}
        <div className="mb-6 flex justify-end">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            <div className="flex space-x-2">
              <button
                onClick={() => switchLanguage("en")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentLanguage === "en"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:text-blue-500"
                }`}>
                English
              </button>
              <button
                onClick={() => switchLanguage("hi")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentLanguage === "hi"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:text-blue-500"
                }`}>
                हिंदी
              </button>
            </div>
          </div>
        </div>

        {/* Translation Loading Indicator */}
        {isTranslating && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              <span className="text-blue-700 text-sm">
                {isHindi ? "अनुवाद हो रहा है..." : "Translating content..."}
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image & Video */}
            <div className="p-6 space-y-4">
              {/* Product Image */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {isHindi ? "उत्पाद छवि" : "Product Image"}
                </h3>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={
                      translatedProduct?.name && !isTranslating
                        ? translatedProduct.name
                        : product.name
                    }
                    className="w-full h-96 object-cover rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">
                      {isHindi ? "कोई छवि उपलब्ध नहीं" : "No image available"}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Video */}
              {product.videoUrl && product.videoStatus === "COMPLETED" && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    {isHindi ? "उत्पाद वीडियो" : "Product Video"}
                  </h3>
                  <div className="relative rounded-lg overflow-hidden shadow-md bg-black">
                    <video
                      src={product.videoUrl}
                      controls
                      className="w-full h-96 object-contain"
                      poster={product.image_url}>
                      {isHindi
                        ? "आपका ब्राउज़र वीडियो प्लेबैक का समर्थन नहीं करता।"
                        : "Your browser does not support video playback."}
                    </video>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    ✨{" "}
                    {isHindi
                      ? "AI-जेनेरेटेड उत्पाद प्रदर्शन वीडियो"
                      : "AI-generated product demonstration video"}
                  </p>
                </div>
              )}

              {product.instagram_post_url && (
                <div className="mt-4">
                  <a
                    href={product.instagram_post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-pink-600 hover:text-pink-700">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                      <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    {isHindi ? "Instagram पर देखें" : "View on Instagram"}
                  </a>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {translatedProduct?.name && !isTranslating
                  ? translatedProduct.name
                  : product.name}
              </h1>

              <div className="mb-6">
                <span className="text-3xl font-bold text-green-600">
                  {product.currency} {product.price.toLocaleString()}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-700">
                    {isHindi ? "विवरण" : "Description"}
                  </h3>
                  <p className="text-gray-600">
                    {translatedProduct?.description && !isTranslating
                      ? translatedProduct.description
                      : product.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">
                      {isHindi ? "श्रेणी" : "Category"}
                    </h3>
                    <p className="text-gray-600">
                      {translatedProduct?.category && !isTranslating
                        ? translatedProduct.category
                        : product.category}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">
                      {isHindi ? "सामग्री" : "Materials"}
                    </h3>
                    <p className="text-gray-600">
                      {translatedProduct?.materials && !isTranslating
                        ? translatedProduct.materials
                        : product.materials}
                    </p>
                  </div>
                </div>
                {product.dimensions && (
                  <div>
                    <h3 className="font-semibold text-gray-700">
                      {isHindi ? "आयाम" : "Dimensions"}
                    </h3>
                    <p className="text-gray-600">{product.dimensions}</p>
                  </div>
                )}{" "}
                <div>
                  <h3 className="font-semibold text-gray-700">
                    {isHindi ? "कलाकार" : "Artist"}
                  </h3>
                  <p className="text-gray-600 font-medium">
                    {product.artist_name}
                  </p>
                  {product.artist_bio && (
                    <p className="text-gray-600 text-sm mt-1">
                      {product.artist_bio}
                    </p>
                  )}
                </div>
                {product.cultural_origin && (
                  <div>
                    <h3 className="font-semibold text-gray-700">
                      {isHindi ? "सांस्कृतिक मूल" : "Cultural Origin"}
                    </h3>
                    <p className="text-gray-600">{product.cultural_origin}</p>
                  </div>
                )}
                {product.creation_story && (
                  <div>
                    <h3 className="font-semibold text-gray-700">
                      {isHindi ? "निर्माण की कहानी" : "Creation Story"}
                    </h3>
                    <p className="text-gray-600">{product.creation_story}</p>
                  </div>
                )}
                {product.care_instructions && (
                  <div>
                    <h3 className="font-semibold text-gray-700">
                      {isHindi ? "देखभाल के निर्देश" : "Care Instructions"}
                    </h3>
                    <p className="text-gray-600">{product.care_instructions}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => setShowInquiryForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                  {isHindi
                    ? "इस उत्पाद के बारे में पूछताछ करें"
                    : "Inquire About This Product"}
                </Button>

                <Button
                  onClick={() =>
                    window.open(
                      `https://wa.me/?text=${
                        isHindi ? "नमस्ते! मुझे" : "Hi! I'm interested in"
                      } ${
                        translatedProduct?.name && !isTranslating
                          ? translatedProduct.name
                          : product.name
                      } ${isHindi ? "में रुचि है" : ""} - ${
                        window.location.href
                      }`,
                      "_blank"
                    )
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3">
                  {isHindi
                    ? "WhatsApp के माध्यम से साझा करें"
                    : "Share via WhatsApp"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Form Modal */}
        {showInquiryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">
                {isHindi
                  ? `${
                      translatedProduct?.name && !isTranslating
                        ? translatedProduct.name
                        : product.name
                    } के बारे में पूछताछ करें`
                  : `Inquire About ${
                      translatedProduct?.name && !isTranslating
                        ? translatedProduct.name
                        : product.name
                    }`}
              </h2>

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isHindi ? "नाम *" : "Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.customer_name}
                    onChange={(e) =>
                      setInquiryForm({
                        ...inquiryForm,
                        customer_name: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isHindi ? "ईमेल *" : "Email *"}
                  </label>
                  <input
                    type="email"
                    required
                    value={inquiryForm.customer_email}
                    onChange={(e) =>
                      setInquiryForm({
                        ...inquiryForm,
                        customer_email: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isHindi ? "फोन" : "Phone"}
                  </label>
                  <input
                    type="tel"
                    value={inquiryForm.customer_phone}
                    onChange={(e) =>
                      setInquiryForm({
                        ...inquiryForm,
                        customer_phone: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isHindi
                      ? "Instagram उपयोगकर्ता नाम"
                      : "Instagram Username"}
                  </label>
                  <input
                    type="text"
                    value={inquiryForm.instagram_username}
                    onChange={(e) =>
                      setInquiryForm({
                        ...inquiryForm,
                        instagram_username: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isHindi ? "पूछताछ का प्रकार" : "Inquiry Type"}
                  </label>
                  <select
                    value={inquiryForm.inquiry_type}
                    onChange={(e) =>
                      setInquiryForm({
                        ...inquiryForm,
                        inquiry_type: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="PURCHASE">
                      {isHindi ? "खरीदारी पूछताछ" : "Purchase Inquiry"}
                    </option>
                    <option value="CUSTOM">
                      {isHindi ? "कस्टम ऑर्डर" : "Custom Order"}
                    </option>
                    <option value="WHOLESALE">
                      {isHindi ? "थोक पूछताछ" : "Wholesale Inquiry"}
                    </option>
                    <option value="GENERAL">
                      {isHindi ? "सामान्य प्रश्न" : "General Question"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isHindi ? "संदेश *" : "Message *"}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={inquiryForm.message}
                    onChange={(e) =>
                      setInquiryForm({
                        ...inquiryForm,
                        message: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      isHindi
                        ? "इस उत्पाद में अपनी रुचि के बारे में बताएं..."
                        : "Tell us about your interest in this product..."
                    }
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    onClick={() => setShowInquiryForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700">
                    {isHindi ? "रद्द करें" : "Cancel"}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    {isHindi ? "पूछताछ भेजें" : "Send Inquiry"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
