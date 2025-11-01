import { LanguageProvider as OldLanguageProvider } from "@/lib/language/LanguageContext";
import { LanguageProvider } from "@/lib/i18n/provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Artisan Marketplace - Cultural Storytelling & Smart Commerce",
  description:
    "AI-powered marketplace assistant for local artisans with cultural storytelling, voice processing, and intelligent product management.",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <LanguageProvider>
            <OldLanguageProvider>{children}</OldLanguageProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
