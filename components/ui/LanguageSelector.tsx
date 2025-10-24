"use client";

import { Locale } from "@/lib/i18n/config";
import { useLanguageContext } from "@/lib/i18n/provider";
import { ChevronDown, Globe } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

// Define available languages with their native names (English and Hindi only)
const languages: { code: Locale; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Only show language selector on artisan routes
  if (!pathname.startsWith("/artisan")) {
    return null;
  }

  // Add error handling for context
  let contextData;
  try {
    contextData = useLanguageContext();
  } catch (error) {
    console.warn("LanguageSelector: Language context not available", error);
    // Fallback to default values when context is not available
    contextData = {
      currentLocale: "en" as const,
      changeLanguage: () =>
        console.warn("Language change not available - context not loaded"),
    };
  }

  const { currentLocale, changeLanguage } = contextData;
  const currentLanguage = languages.find((lang) => lang.code === currentLocale);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white hover:bg-slate-600 transition-colors w-full justify-between">
        <div className="flex items-center">
          <Globe className="h-4 w-4 mr-2" />
          <span className="text-sm">{currentLanguage?.nativeName}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                  // Trigger page refresh to update all content
                  window.location.reload();
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${
                  currentLocale === lang.code
                    ? "text-orange-400 bg-slate-700"
                    : "text-white"
                }`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{lang.nativeName}</span>
                  {currentLocale === lang.code && (
                    <span className="text-orange-400 text-xs">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
