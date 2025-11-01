import { Locale } from './config';
import { translations, TranslationKey } from './translations';
import { useLanguageContext } from './provider';

// Hook for managing language state
export function useLanguage() {
  return useLanguageContext();
}

// Hook for getting translated text
export function useTranslation() {
  const { currentLocale } = useLanguage();

  const t = (key: TranslationKey): string => {
    return translations[currentLocale as keyof typeof translations]?.[key] || translations.en[key] || key;
  };

  return { t, currentLocale };
}

// Helper function to get translation without hook (for server components)
export function getTranslation(locale: Locale, key: TranslationKey): string {
  return translations[locale as keyof typeof translations]?.[key] || translations.en[key] || key;
}
