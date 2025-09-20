export const defaultLocale = 'en' as const;
export const locales = ['en', 'hi', 'bn', 'te', 'ta', 'ml', 'kn', 'gu', 'mr', 'or'] as const;

export type Locale = typeof locales[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिंदी',
  bn: 'বাংলা', 
  te: 'తెలుగు',
  ta: 'தமிழ்',
  ml: 'മലയാളം',
  kn: 'ಕನ್ನಡ',
  gu: 'ગુજરાતી',
  mr: 'मराठी',
  or: 'ଓଡ଼ିଆ'
};
