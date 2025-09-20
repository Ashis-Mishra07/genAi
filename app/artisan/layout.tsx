import { LanguageProvider } from '@/lib/i18n/provider';

export default function ArtisanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}
