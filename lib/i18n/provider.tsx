'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale } from './config';

interface LanguageContextType {
  currentLocale: Locale;
  changeLanguage: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('artisan-locale') as Locale;
    if (savedLocale && ['en', 'hi', 'bn', 'te', 'ta', 'ml', 'kn', 'gu', 'mr', 'or'].includes(savedLocale)) {
      setCurrentLocale(savedLocale);
    }
    setIsLoaded(true);
  }, []);

  // Save language to localStorage when changed
  const changeLanguage = (locale: Locale) => {
    setCurrentLocale(locale);
    localStorage.setItem('artisan-locale', locale);
  };

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  return (
    <LanguageContext.Provider value={{ currentLocale, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}
