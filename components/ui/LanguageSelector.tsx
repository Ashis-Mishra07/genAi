"use client";

import { Locale } from '@/lib/i18n/config';
import { useLanguageContext } from '@/lib/i18n/provider';
import { ChevronDown, Globe } from 'lucide-react';
import { useState } from 'react';

// Define available languages with their native names
const languages: { code: Locale; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Add error handling for context
  let contextData;
  try {
    contextData = useLanguageContext();
  } catch (error) {
    console.warn('LanguageSelector: Language context not available', error);
    // Fallback to default values when context is not available
    contextData = {
      currentLocale: 'en' as const,
      changeLanguage: () => console.warn('Language change not available - context not loaded')
    };
  }
  
  const { currentLocale, changeLanguage } = contextData;
  const currentLanguage = languages.find(lang => lang.code === currentLocale);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white hover:bg-slate-600 transition-colors"
      >
        <Globe className="h-4 w-4 mr-2" />
        <span className="text-sm">{currentLanguage?.nativeName}</span>
        <ChevronDown className="h-4 w-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${
                  currentLocale === lang.code 
                    ? 'text-orange-400 bg-slate-700' 
                    : 'text-white'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{lang.nativeName}</span>
                  <span className="text-slate-400 text-xs">{lang.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
