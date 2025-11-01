"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/hooks";
import { useTranslateContent } from "@/lib/hooks/useTranslateContent";
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
  const { translateText, isHindi, currentLocale } = useTranslateContent();

  // Helper function for quick translations
  const t = (
    englishText: string,
    translations: Record<string, string> = {}
  ) => {
    if (currentLocale === "en") return englishText;
    return translations[currentLocale] || translations["hi"] || englishText;
  };
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
        throw new Error(
          isHindi ? "उत्पाद का नाम आवश्यक है" : "Product name is required"
        );
      }
      if (formData.price <= 0) {
        throw new Error(
          isHindi
            ? "मूल्य 0 से अधिक होना चाहिए"
            : "Price must be greater than 0"
        );
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
          data.error ||
            (isHindi ? "उत्पाद बनाने में विफल" : "Failed to create product")
        );
      }

      setSuccess(
        isHindi
          ? "उत्पाद सफलतापूर्वक बनाया गया!"
          : "Product created successfully!"
      );

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/artisan/dashboard");
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : isHindi
          ? "एक त्रुटि हुई"
          : "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    alert(
      isHindi
        ? "पूर्वावलोकन सुविधा जल्द आ रही है!"
        : "Preview functionality coming soon!"
    );
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
            {t("Back to Dashboard", {
              hi: "डैशबोर्ड पर वापस",
              or: "ଡ୍ୟାସବୋର୍ଡକୁ ଫେରନ୍ତୁ",
              te: "డ్యాష్‌బోర్డ్‌కు తిరిగి",
              bn: "ড্যাশবোর্ডে ফিরে যান",
            })}
          </button>
          <div className="flex items-center text-white">
            <Package className="h-6 w-6 mr-2" />
            <span className="text-xl font-bold">
              {t("Create New Product", {
                hi: "नया उत्पाद बनाएं",
                or: "ନୂତନ ପଣ୍ୟ ତିଆରି କରନ୍ତୁ",
                te: "కొత్త ఉత్పత్తిని సృష్టించండి",
                bn: "নতুন পণ্য তৈরি করুন",
              })}
            </span>
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
              {t("Basic Information", {
                hi: "मूलभूत जानकारी",
                or: "ମୂଳ ସୂଚନା",
                te: "ప్రాథమిక సమాచారం",
                bn: "মূল তথ্য",
              })}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  {t("Product Name", {
                    hi: "उत्पाद का नाम",
                    or: "ପଣ୍ୟର ନାମ",
                    te: "ఉత్పత్తి పేరు",
                    bn: "পণ্যের নাম",
                  })}{" "}
                  *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={t("Enter Product Name", {
                    hi: "उत्पाद का नाम दर्ज करें",
                    or: "ପଣ୍ୟର ନାମ ପ୍ରବେଶ କରନ୍ତୁ",
                    te: "ఉత్పత్తి పేరు నమోదు చేయండి",
                    bn: "পণ্যের নাম লিখুন",
                  })}
                  required
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  {t("Category", {
                    hi: "श्रेणी",
                    or: "ବିଭାଗ",
                    te: "వర్గం",
                    bn: "বিভাগ",
                  })}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                  <option value="" className="bg-slate-800">
                    {t("Select Category", {
                      hi: "श्रेणी चुनें",
                      or: "ବିଭାଗ ବାଛନ୍ତୁ",
                      te: "వర్గాన్ని ఎంచుకోండి",
                      bn: "বিভাগ নির্বাচন করুন",
                    })}
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
                  {t("price", {
                    hi: "मूल्य",
                    or: "ମୂଲ୍ୟ",
                    te: "ధర",
                    bn: "মূল্য",
                  })}{" "}
                  *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={t("enterPrice", {
                    hi: "मूल्य दर्ज करें",
                    or: "ମୂଲ୍ୟ ପ୍ରବିଷ୍ଟ କରନ୍ତୁ",
                    te: "ధరను నమోదు చేయండి",
                    bn: "মূল্য প্রবেশ করান",
                  })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  {t("currency", {
                    hi: "मुद्रा",
                    or: "ମୁଦ୍ରା",
                    te: "కరెన్సీ",
                    bn: "মুদ্রা",
                  })}
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
                  {t("Stock Quantity", {
                    hi: "स्टॉक मात्रा",
                    or: "ଷ୍ଟକ ପରିମାଣ",
                    te: "స్టాక్ పరిమాణం",
                    bn: "স্টক পরিমাণ",
                  })}
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
                    {t("Active", {
                      hi: "सक्रिय",
                      or: "ସକ୍ରିୟ",
                      te: "చురుకైన",
                      bn: "সক্রিয়",
                    })}
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
                    {t("Featured", {
                      hi: "फीचर्ड",
                      or: "ବିଶେଷ",
                      te: "ప్రత్యేకమైన",
                      bn: "বৈশিষ্ট্যযুক্ত",
                    })}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Description & Story */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-500" />
              {t("Description & Story", {
                hi: "विवरण और कहानी",
                or: "ବର୍ଣ୍ଣନା ଏବଂ କାହାଣୀ",
                te: "వివరణ మరియు కథ",
                bn: "বিবরণ এবং গল্প",
              })}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  {t("Product Description", {
                    hi: "उत्पाद विवरण",
                    or: "ପଣ୍ୟ ବର୍ଣ୍ଣନା",
                    te: "ఉత్పత్తి వివరణ",
                    bn: "পণ্যের বিবরণ",
                  })}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                  placeholder={
                    isHindi
                      ? "अपने उत्पाद का विवरण दें..."
                      : "Describe your product..."
                  }
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  {t("Cultural Story", {
                    hi: "सांस्कृतिक कहानी",
                    or: "ସାଂସ୍କୃତିକ କାହାଣୀ",
                    te: "సాంస్కృతిక కథ",
                    bn: "সাংস্কৃতিক গল্প",
                  })}
                </label>
                <textarea
                  name="story"
                  value={formData.story}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                  placeholder={
                    currentLocale === "en"
                      ? "Tell the cultural story behind your product..."
                      : "अपने उत्पाद के पीछे की सांस्कृतिक कहानी बताएं..."
                  }
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-orange-500" />
              {t("Product Details", {
                hi: "उत्पाद विवरण",
                or: "ପଣ୍ୟ ବିବରଣ",
                te: "ఉత్పత్తి వివరాలు",
                bn: "পণ্যের বিবরণ",
              })}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  <Palette className="h-4 w-4 inline mr-1" />
                  {t("Materials", {
                    hi: "सामग्री",
                    or: "ସାମଗ୍ରୀ",
                    te: "పదార్థాలు",
                    bn: "উপাদান",
                  })}
                </label>
                <input
                  type="text"
                  name="materials"
                  value={formData.materials}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={
                    isHindi
                      ? "जैसे: कपास, रेशम, लकड़ी"
                      : "e.g., Cotton, Silk, Wood"
                  }
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {t("Cultural Origin", {
                    hi: "सांस्कृतिक मूल",
                    or: "ସାଂସ୍କୃତିକ ମୂଳ",
                    te: "సాంస్కృతిక మూలం",
                    bn: "সাংস্কৃতিক উৎস",
                  })}
                </label>
                <input
                  type="text"
                  name="culture"
                  value={formData.culture}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={
                    isHindi
                      ? "जैसे: राजस्थानी, बंगाली"
                      : "e.g., Rajasthani, Bengali"
                  }
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  {t("Artist Name", {
                    hi: "कलाकार का नाम",
                    or: "କଳାକାରଙ୍କ ନାମ",
                    te: "కళాకారుడి పేరు",
                    bn: "শিল্পীর নাম",
                  })}
                </label>
                <input
                  type="text"
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={t("Creator's name", {
                    hi: "निर्माता का नाम",
                    or: "ସୃଷ୍ଟିକର୍ତ୍ତାଙ୍କ ନାମ",
                    te: "సృష్టికర్త పేరు",
                    bn: "স্রষ্টার নাম",
                  })}
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  <Ruler className="h-4 w-4 inline mr-1" />
                  {t("Dimensions", {
                    hi: "आयाम",
                    or: "ଆକାର",
                    te: "కొలతలు",
                    bn: "মাত্রা",
                  })}
                </label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={
                    isHindi
                      ? "जैसे: 30सेमी x 20सेमी x 5सेमी"
                      : "e.g., 30cm x 20cm x 5cm"
                  }
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  <Weight className="h-4 w-4 inline mr-1" />
                  {t("Weight", {
                    hi: "वजन",
                    or: "ଓଜନ",
                    te: "బరువు",
                    bn: "ওজন",
                  })}
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder={t("e.g., 500g", {
                    hi: "जैसे: 500ग्राम",
                    or: "ଯେମିତି: 500 ଗ୍ରାମ",
                    te: "ఉదా: 500 గ్రాములు",
                    bn: "যেমন: ৫০০ গ্রাম",
                  })}
                />
              </div>
            </div>
          </div>

          {/* Images & Links */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-orange-500" />
              {t("Images & Links", {
                hi: "छवियां और लिंक",
                or: "ଚିତ୍ର ଏବଂ ଲିଙ୍କ",
                te: "చిత్రాలు మరియు లింకులు",
                bn: "ছবি এবং লিঙ্ক",
              })}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  {t("Product Image URL", {
                    hi: "उत्पाद छवि URL",
                    or: "ପଣ୍ୟ ଚିତ୍ର URL",
                    te: "ఉత్పత్తి చిత్రం URL",
                    bn: "পণ্যের ছবি URL",
                  })}
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
                  {t("Marketing Poster URL", {
                    hi: "मार्केटिंग पोस्टर URL",
                    or: "ମାର୍କେଟିଂ ପୋଷ୍ଟର URL",
                    te: "మార్కెటింగ్ పోస్టర్ URL",
                    bn: "মার্কেটিং পোস্টার URL",
                  })}
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
                  {t("Instagram Post URL", {
                    hi: "इंस्टाग्राम पोस्ट URL",
                    or: "ଇନଷ୍ଟାଗ୍ରାମ ପୋଷ୍ଟ URL",
                    te: "ఇన్‌స్టాగ్రామ్ పోస్ట్ URL",
                    bn: "ইনস্টাগ্রাম পোস্ট URL",
                  })}
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
              {t("Preview", {
                hi: "पूर्वावलोकन",
                or: "ପୂର୍ବାବଲୋକନ",
                te: "ప్రివ్యూ",
                bn: "প্রিভিউ",
              })}
            </button>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white/90 hover:bg-white/20 transition-colors">
                {t("Cancel", {
                  hi: "रद्द करें",
                  or: "ବାତିଲ କରନ୍ତୁ",
                  te: "రద్దు చేయండి",
                  bn: "বাতিল করুন",
                })}
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t("Creating...", {
                      hi: "बना रहे हैं...",
                      or: "ତିଆରି କରୁଛି...",
                      te: "సృష్టిస్తున్నాము...",
                      bn: "তৈরি করছি...",
                    })}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t("Create Product", {
                      hi: "उत्पाद बनाएं",
                      or: "ପଣ୍ୟ ତିଆରି କରନ୍ତୁ",
                      te: "ఉత్పత్తిని సృష్టించండి",
                      bn: "পণ্য তৈরি করুন",
                    })}
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
