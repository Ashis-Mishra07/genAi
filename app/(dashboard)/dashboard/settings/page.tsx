"use client";

import { useState } from "react";
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

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "ai", name: "AI Settings", icon: Key },
    { id: "marketplace", name: "Marketplace", icon: Globe },
    { id: "security", name: "Security", icon: Shield },
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
    <div className="p-6 space-y-6 bg-black min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your account and application preferences
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-orange-400 to-transparent rounded-full"></div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 bg-orange-500 text-black px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors">
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : saveSuccess ? (
            <>
              <Check className="h-4 w-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-gradient-to-br from-gray-800 to-gray-700 text-orange-400 border border-orange-500"
                    : "text-gray-300 hover:bg-gray-800 border border-gray-700"
                }`}>
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-800 p-6 shadow-xl backdrop-blur-sm relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"></div>
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-orange-400">
                Profile Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={settings.profile.name}
                    onChange={(e) =>
                      updateSettings("profile", "name", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) =>
                      updateSettings("profile", "email", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) =>
                      updateSettings("profile", "phone", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.profile.language}
                    onChange={(e) =>
                      updateSettings("profile", "language", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="bn">Bengali</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">
                Notification Preferences
              </h2>

              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-4 px-4 bg-gradient-to-r from-gray-800/30 to-gray-800/10 rounded-lg border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
                    <div>
                      <h3 className="font-medium text-white capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()} Notifications
                      </h3>
                      <p className="text-sm text-gray-400">
                        {key === "email" && "Receive notifications via email"}
                        {key === "push" &&
                          "Receive push notifications in browser"}
                        {key === "sms" &&
                          "Receive SMS notifications for important updates"}
                        {key === "marketing" &&
                          "Receive marketing and promotional content"}
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
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Settings */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-white">
                  AI Assistant Settings
                </h2>
                <Key className="h-5 w-5 text-orange-400" />
              </div>

              <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                  <p className="text-sm text-orange-300">
                    Configure how AI tools assist with your marketplace
                    operations
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(settings.ai).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-4 px-4 bg-gradient-to-r from-gray-800/30 to-gray-800/10 rounded-lg border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
                    <div>
                      <h3 className="font-medium text-white">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {key === "autoGenerateStories" &&
                          "Automatically generate cultural stories for new products"}
                        {key === "voiceLanguageDetection" &&
                          "Detect and translate voice messages automatically"}
                        {key === "pricingSuggestions" &&
                          "Get AI-powered pricing recommendations"}
                        {key === "culturalContextEnhancement" &&
                          "Enhance product descriptions with cultural context"}
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
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Marketplace Settings */}
          {activeTab === "marketplace" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">
                Marketplace Configuration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default Currency
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
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white">
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Shipping Calculation
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
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white">
                    <option value="weight">By Weight</option>
                    <option value="distance">By Distance</option>
                    <option value="flat">Flat Rate</option>
                    <option value="free">Free Shipping</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 px-4 bg-gradient-to-r from-gray-800/30 to-gray-800/10 rounded-lg border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
                <div>
                  <h3 className="font-medium text-white">
                    Tax Included in Prices
                  </h3>
                  <p className="text-sm text-gray-400">
                    Include tax in displayed product prices
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
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">
                Security & Privacy
              </h2>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-sm rounded-lg p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
                  <div className="mb-4 pb-2 border-b-2 border-orange-500">
                    <h3 className="text-lg font-medium text-white bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                      Change Password
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Update your account password
                  </p>
                  <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-200 shadow-lg">
                    Change Password
                  </button>
                </div>

                <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-sm rounded-lg p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
                  <div className="mb-4 pb-2 border-b-2 border-orange-500">
                    <h3 className="text-lg font-medium text-white bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                      Two-Factor Authentication
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg">
                    Enable 2FA
                  </button>
                </div>

                <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-sm rounded-lg p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
                  <div className="mb-4 pb-2 border-b-2 border-orange-500">
                    <h3 className="text-lg font-medium text-white bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                      API Keys
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Manage your AI service API keys
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                      <span className="text-sm text-gray-300">
                        Gemini AI API
                      </span>
                      <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                        Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                      <span className="text-sm text-gray-300">OpenAI API</span>
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30">
                        Not configured
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
