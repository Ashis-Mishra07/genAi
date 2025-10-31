"use client";

import { useLanguageContext } from '@/lib/i18n/provider';
import { translationService } from '@/lib/services/translationService';
import { useEffect, useState, useCallback } from 'react';

export function useTranslateContent() {
  let contextData;
  try {
    contextData = useLanguageContext();
  } catch (error) {
    console.warn('Translation hook: Language context not available', error);
    contextData = { currentLocale: 'en' as const };
  }
  
  const { currentLocale } = contextData;

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
    isTranslating: currentLocale !== 'en',
    currentLocale 
  };
}

// Hook for translating arrays of products
export function useTranslatedProducts(products: any[]) {
  const [translatedProducts, setTranslatedProducts] = useState<any[]>(products);
  const [isLoading, setIsLoading] = useState(false);
  const { translateProduct, currentLocale } = useTranslateContent();

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
  }, [products, currentLocale, translateProduct]);

  return { translatedProducts, isLoading };
}

// Hook for translating a single text with state management
export function useTranslatedText(text: string) {
  const [translatedText, setTranslatedText] = useState<string>(text);
  const [isLoading, setIsLoading] = useState(false);
  const { translateText, currentLocale } = useTranslateContent();

  useEffect(() => {
    const translateSingleText = async () => {
      if (!text || currentLocale === 'en') {
        setTranslatedText(text);
        return;
      }

      // Check cache first
      const cached = translationService.getCachedTranslation(text, currentLocale);
      if (cached) {
        setTranslatedText(cached);
        return;
      }

      setIsLoading(true);
      try {
        const translated = await translateText(text);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Failed to translate text:', error);
        setTranslatedText(text); // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    translateSingleText();
  }, [text, currentLocale, translateText]);

  return { translatedText, isLoading };
}

// Hook for translating activity/recent items
export function useTranslatedActivity(activities: any[]) {
  const [translatedActivities, setTranslatedActivities] = useState<any[]>(activities);
  const [isLoading, setIsLoading] = useState(false);
  const { translateActivity, currentLocale } = useTranslateContent();

  useEffect(() => {
    const translateActivities = async () => {
      if (currentLocale === 'en') {
        setTranslatedActivities(activities);
        return;
      }

      if (activities.length === 0) {
        setTranslatedActivities([]);
        return;
      }

      setIsLoading(true);
      try {
        const translated = await Promise.all(
          activities.map(activity => translateActivity(activity))
        );
        setTranslatedActivities(translated);
      } catch (error) {
        console.error('Failed to translate activities:', error);
        setTranslatedActivities(activities); // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    translateActivities();
  }, [activities, currentLocale, translateActivity]);

  return { translatedActivities, isLoading };
}

// Hook for immediate translation (returns original text until translation is ready)
export function useImmediateTranslation(text: string): string {
  const { currentLocale } = useTranslateContent();
  const [translatedText, setTranslatedText] = useState<string>(text);

  useEffect(() => {
    if (!text || currentLocale === 'en') {
      setTranslatedText(text);
      return;
    }

    // Check cache first for immediate result
    const cached = translationService.getCachedTranslation(text, currentLocale);
    if (cached) {
      setTranslatedText(cached);
      return;
    }

    // Start translation in background
    translationService.translateText(text, currentLocale).then(translated => {
      setTranslatedText(translated);
    }).catch(error => {
      console.error('Translation failed:', error);
      setTranslatedText(text); // Keep original on error
    });

    // Return original text immediately
    setTranslatedText(text);
  }, [text, currentLocale]);

  return translatedText;
}