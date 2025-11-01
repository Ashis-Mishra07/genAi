"use client";

import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Globe,
  Shield,
  CreditCard,
  Palette,
  Key,
  Database,
  Save,
  Check,
  AlertCircle,
} from "lucide-react";
import { useDynamicTranslation } from "@/lib/i18n/useDynamicTranslation";

interface Settings {
  profile: {
    name: string;
    email: string;
    phone: string;
    language: string;
    timezone: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  ai: {
    autoGenerateStories: boolean;
    voiceLanguageDetection: boolean;
    pricingSuggestions: boolean;
    culturalContextEnhancement: boolean;
  };
  marketplace: {
    defaultCurrency: string;
    taxIncluded: boolean;
    shippingCalculation: string;
    returnPolicy: string;
  };
}

export default function SettingsPage() {
  const { translateBatch, t } = useDynamicTranslation();
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState<Settings>({
    profile: {
      name: "Artisan User",
      email: "artisan@example.com",
      phone: "+91 98765 43210",
      language: "en",
      timezone: "Asia/Kolkata",
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: true,
    },
    ai: {
      autoGenerateStories: true,
      voiceLanguageDetection: true,
      pricingSuggestions: true,
      culturalContextEnhancement: true,
    },
    marketplace: {
      defaultCurrency: "INR",
      taxIncluded: false,
      shippingCalculation: "weight",
      returnPolicy: "30-day-return",
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Translate UI text
  useEffect(() => {
    translateBatch([
      "Settings",
      "Manage your account and application preferences",
      "Saving...",
      "Saved!",
      "Save Changes",
      "Profile",
      "Notifications",
      "AI Settings",
      "Marketplace",
      "Security",
      "Profile Information",
      "Full Name",
      "Email Address",
      "Phone Number",
      "Language",
      "English",
      "Hindi",
      "Bengali",
      "Tamil",
      "Telugu",
      "Notification Preferences",
      "Email Notifications",
      "Receive notifications via email",
      "Push Notifications",
      "Receive push notifications in browser",
      "SMS Notifications",
      "Receive SMS notifications for important updates",
      "Marketing Notifications",
      "Receive marketing and promotional content",
      "AI Assistant Settings",
      "Configure how AI tools assist with your marketplace operations",
      "Auto Generate Stories",
      "Automatically generate cultural stories for new products",
      "Voice Language Detection",
      "Detect and translate voice messages automatically",
      "Pricing Suggestions",
      "Get AI-powered pricing recommendations",
      "Cultural Context Enhancement",
      "Enhance product descriptions with cultural context",
      "Marketplace Configuration",
      "Default Currency",
      "Indian Rupee (₹)",
      "US Dollar ($)",
      "Euro (€)",
      "British Pound (£)",
      "Shipping Calculation",
      "By Weight",
      "By Distance",
      "Flat Rate",
      "Free Shipping",
      "Tax Included in Prices",
      "Include tax in displayed product prices",
      "Security & Privacy",
      "Change Password",
      "Update your account password",
      "Two-Factor Authentication",
      "Add an extra layer of security to your account",
      "Enable 2FA",
      "API Keys",
      "Manage your AI service API keys",
      "Gemini AI API",
      "Connected",
      "OpenAI API",
      "Not configured"
    ]);
  }, [translateBatch]);

  const tabs = [
    { id: "profile", name: t("Profile"), icon: User },
    { id: "notifications", name: t("Notifications"), icon: Bell },
    { id: "ai", name: t("AI Settings"), icon: Key },
    { id: "marketplace", name: t("Marketplace"), icon: Globe },
    { id: "security", name: t("Security"), icon: Shield },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (
    section: keyof Settings,
    field: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {t("Settings")}
          </h1>
          <p className="text-muted-foreground">
            {t("Manage your account and application preferences")}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg">
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{t("Saving...")}</span>
            </>
          ) : saveSuccess ? (
            <>
              <Check className="h-4 w-4" />
              <span>{t("Saved!")}</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{t("Save Changes")}</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary border-2 border-primary shadow-md"
                    : "text-foreground hover:bg-accent border border-border"
                }`}>
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-card rounded-xl border border-border p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-3">
                {t("Profile Information")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("Full Name")}
                  </label>
                  <input
                    type="text"
                    value={settings.profile.name}
                    onChange={(e) =>
                      updateSettings("profile", "name", e.target.value)
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("Email Address")}
                  </label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) =>
                      updateSettings("profile", "email", e.target.value)
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("Phone Number")}
                  </label>
                  <input
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) =>
                      updateSettings("profile", "phone", e.target.value)
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("Language")}
                  </label>
                  <select
                    value={settings.profile.language}
                    onChange={(e) =>
                      updateSettings("profile", "language", e.target.value)
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all">
                    <option value="en">{t("English")}</option>
                    <option value="hi">{t("Hindi")}</option>
                    <option value="bn">{t("Bengali")}</option>
                    <option value="ta">{t("Tamil")}</option>
                    <option value="te">{t("Telugu")}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-3">
                {t("Notification Preferences")}
              </h2>

              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-4 px-5 bg-accent/30 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200">
                    <div>
                      <h3 className="font-medium text-foreground capitalize">
                        {t(key.replace(/([A-Z])/g, " $1").trim() + " Notifications")}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {key === "email" && t("Receive notifications via email")}
                        {key === "push" &&
                          t("Receive push notifications in browser")}
                        {key === "sms" &&
                          t("Receive SMS notifications for important updates")}
                        {key === "marketing" &&
                          t("Receive marketing and promotional content")}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          updateSettings("notifications", key, e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Settings */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-border pb-3">
                <h2 className="text-2xl font-semibold text-foreground">
                  {t("AI Assistant Settings")}
                </h2>
                <Key className="h-5 w-5 text-primary" />
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">
                    {t("Configure how AI tools assist with your marketplace operations")}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(settings.ai).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-4 px-5 bg-accent/30 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200">
                    <div>
                      <h3 className="font-medium text-foreground">
                        {t(key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase()))}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {key === "autoGenerateStories" &&
                          t("Automatically generate cultural stories for new products")}
                        {key === "voiceLanguageDetection" &&
                          t("Detect and translate voice messages automatically")}
                        {key === "pricingSuggestions" &&
                          t("Get AI-powered pricing recommendations")}
                        {key === "culturalContextEnhancement" &&
                          t("Enhance product descriptions with cultural context")}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          updateSettings("ai", key, e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Marketplace Settings */}
          {activeTab === "marketplace" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-3">
                {t("Marketplace Configuration")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("Default Currency")}
                  </label>
                  <select
                    value={settings.marketplace.defaultCurrency}
                    onChange={(e) =>
                      updateSettings(
                        "marketplace",
                        "defaultCurrency",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all">
                    <option value="INR">{t("Indian Rupee (₹)")}</option>
                    <option value="USD">{t("US Dollar ($)")}</option>
                    <option value="EUR">{t("Euro (€)")}</option>
                    <option value="GBP">{t("British Pound (£)")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("Shipping Calculation")}
                  </label>
                  <select
                    value={settings.marketplace.shippingCalculation}
                    onChange={(e) =>
                      updateSettings(
                        "marketplace",
                        "shippingCalculation",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all">
                    <option value="weight">{t("By Weight")}</option>
                    <option value="distance">{t("By Distance")}</option>
                    <option value="flat">{t("Flat Rate")}</option>
                    <option value="free">{t("Free Shipping")}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 px-5 bg-accent/30 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200">
                <div>
                  <h3 className="font-medium text-foreground">
                    {t("Tax Included in Prices")}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("Include tax in displayed product prices")}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.marketplace.taxIncluded}
                    onChange={(e) =>
                      updateSettings(
                        "marketplace",
                        "taxIncluded",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-3">
                {t("Security & Privacy")}
              </h2>

              <div className="space-y-4">
                <div className="bg-card rounded-lg p-6 border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300">
                  <div className="mb-4 pb-3 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">
                      {t("Change Password")}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("Update your account password")}
                  </p>
                  <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium">
                    {t("Change Password")}
                  </button>
                </div>

                <div className="bg-card rounded-lg p-6 border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300">
                  <div className="mb-4 pb-3 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">
                      {t("Two-Factor Authentication")}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("Add an extra layer of security to your account")}
                  </p>
                  <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium">
                    {t("Enable 2FA")}
                  </button>
                </div>

                <div className="bg-card rounded-lg p-6 border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300">
                  <div className="mb-4 pb-3 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">
                      {t("API Keys")}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("Manage your AI service API keys")}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg border border-border">
                      <span className="text-sm font-medium text-foreground">
                        {t("Gemini AI API")}
                      </span>
                      <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-500/30 font-semibold">
                        {t("Connected")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg border border-border">
                      <span className="text-sm font-medium text-foreground">{t("OpenAI API")}</span>
                      <span className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-3 py-1.5 rounded-full border border-yellow-500/30 font-semibold">
                        {t("Not configured")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
