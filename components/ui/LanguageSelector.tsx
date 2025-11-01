"use client";

import { Locale, locales, localeNames } from "@/lib/i18n/config";
import { useLanguageContext } from "@/lib/i18n/provider";
import { ChevronDown, Globe } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

// Use all available languages from config
const languages: { code: Locale; name: string; nativeName: string }[] =
  locales.map((code) => ({
    code,
    name: code === "en" ? "English" : localeNames[code],
    nativeName: localeNames[code],
  }));

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Always call the hook - React hooks must be called unconditionally
  const contextData = useLanguageContext();
  const { currentLocale, changeLanguage } = contextData || {
    currentLocale: "en" as const,
    changeLanguage: () => console.warn("Language change not available"),
  };

  const currentLanguage = languages.find((lang) => lang.code === currentLocale);

  // Only show language selector on artisan routes - return early after hooks
  if (!pathname.startsWith("/artisan")) {
    return null;
  }

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
        <div className="absolute bottom-full left-0 mb-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
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
