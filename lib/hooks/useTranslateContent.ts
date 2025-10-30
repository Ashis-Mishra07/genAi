"use client";

import { useLanguageContext } from '@/lib/i18n/provider';
import { translationService } from '@/lib/services/translationService';
import { useEffect, useState, useCallback } from 'react';

export function useTranslateContent() {
  const { currentLocale } = useLanguageContext();

  const translateText = useCallback(async (text: string): Promise<string> => {
    if (!text || currentLocale === 'en') return text;
    return await translationService.translateText(text, currentLocale);
  }, [currentLocale]);

  const translateProduct = useCallback(async (product: any) => {
    if (currentLocale === 'en') return product;
    return await translationService.translateProduct(product, currentLocale);
  }, [currentLocale]);

  const translateActivity = useCallback(async (activity: any) => {
    if (currentLocale === 'en') return activity;
    return await translationService.translateActivity(activity, currentLocale);
  }, [currentLocale]);

  return { 
    translateText, 
    translateProduct,
    translateActivity,
    isHindi: currentLocale === 'hi',
    currentLocale 
  };
}

// Hook for translating arrays of products
export function useTranslatedProducts(products: any[]) {
  const [translatedProducts, setTranslatedProducts] = useState<any[]>(products);
  const [isLoading, setIsLoading] = useState(false);
  const { currentLocale } = useTranslateContent();

  useEffect(() => {
    const translateProducts = async () => {
      if (currentLocale === 'en') {
        setTranslatedProducts(products);
        return;
      }

      if (products.length === 0) {
        setTranslatedProducts([]);
        return;
      }

      setIsLoading(true);
      try {
        const translated = await translationService.translateProducts(products, currentLocale);
        setTranslatedProducts(translated);
      } catch (error) {
        console.error('Failed to translate products:', error);
        setTranslatedProducts(products); // Fallback to original
      } finally {
        setIsLoading(false);
      }
    };

    translateProducts();
  }, [products, currentLocale]);

  return { translatedProducts, isLoading };
}