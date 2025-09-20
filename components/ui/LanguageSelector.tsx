"use client";

import { useState } from 'react';
import { useLanguage, languages } from '@/lib/language/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === language);

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
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${
                  language === lang.code 
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
