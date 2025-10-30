'use client';

import { useState } from 'react';
import { useLanguageContext } from '@/lib/i18n/provider';
import { useTranslation } from '@/lib/i18n/hooks';
import { localeNames, type Locale } from '@/lib/i18n/config';

export default function LanguageSelector() {
  const { currentLocale, changeLanguage } = useLanguageContext();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (locale: Locale) => {
    changeLanguage(locale);
    setIsOpen(false);
    // Trigger a page refresh to update all content
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-full hover:bg-muted/50 transition-all duration-200 shadow-sm min-w-fit"
        aria-label={t('changeLanguage')}
      >
        <svg 
          className="w-4 h-4 text-muted-foreground" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
          />
        </svg>
        <span className="text-sm font-medium text-foreground">
          {localeNames[currentLocale]}
        </span>
        <svg 
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-lg z-[60] max-h-64 overflow-y-auto min-w-max">
          <div className="p-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1 mb-2">
              {t('selectLanguage')}
            </div>
            {Object.entries(localeNames).map(([locale, name]) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale as Locale)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                  currentLocale === locale
                    ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                    : 'text-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <span className="text-sm">{name}</span>
                {currentLocale === locale && (
                  <svg 
                    className="w-4 h-4 text-primary" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                )}
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
