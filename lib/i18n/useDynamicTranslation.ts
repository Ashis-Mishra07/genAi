'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguageContext } from './provider';

// Cache to store translations
const translationCache = new Map<string, string>();

export function useDynamicTranslation() {
  const { currentLocale } = useLanguageContext();
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Function to translate text using the API
  const translateText = useCallback(async (text: string, targetLang: string): Promise<string> => {
    // Return original text for English
    if (targetLang === 'en' || !text) {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}_${targetLang}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, targetLang }),
      });

      const data = await response.json();
      const translatedText = data.translatedText || text;

      // Cache the translation
      translationCache.set(cacheKey, translatedText);

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    }
  }, []);

  // Function to translate multiple texts at once
  const translateBatch = useCallback(async (texts: string[]) => {
    if (currentLocale === 'en') {
      return;
    }

    setIsTranslating(true);
    const translations: Record<string, string> = {};

    try {
      // Translate all texts in parallel
      const promises = texts.map(async (text) => {
        const translated = await translateText(text, currentLocale);
        translations[text] = translated;
      });

      await Promise.all(promises);
      setTranslatedTexts(translations);
    } catch (error) {
      console.error('Batch translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  }, [currentLocale, translateText]);

  // Function to get translated text (instant if cached, original if not yet translated)
  const t = useCallback((text: string): string => {
    if (currentLocale === 'en') {
      return text;
    }
    return translatedTexts[text] || text;
  }, [currentLocale, translatedTexts]);

  return { t, translateText, translateBatch, isTranslating, currentLocale };
}
