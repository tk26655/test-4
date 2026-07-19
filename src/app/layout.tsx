import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import CookieBanner from "@/components/cookie-banner";
import Newsletter from "@/components/newsletter";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Vintera - Kupuj i sprzedawaj modę",
  description: "Marketplace mody z butikami i osobami prywatnymi. Second-hand, vintage i nowe ubrania.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
        <script dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','GA_MEASUREMENT_ID');`,
        }} />
      </head>
      <script src="/sw-register.js" defer></script>
      <body className={`${inter.variable} antialiased`}>
        <Navbar />
        <main className="min-h-screen bg-white">{children}</main>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Newsletter />
        </div>
        <footer className="border-t border-gray-200 bg-gray-50 py-8">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <p className="font-semibold text-gray-900">Vintera</p>
                <p className="mt-1 text-sm text-gray-500">Marketplace mody dla każdego. Kupuj, sprzedawaj, odkrywaj.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Informacje</p>
                <div className="mt-2 space-y-1 text-sm">
                  <a href="/jak-to-dziala" className="block text-gray-500 hover:text-black">Jak to działa</a>
                  <a href="/regulamin" className="block text-gray-500 hover:text-black">Regulamin</a>
                  <a href="/kontakt" className="block text-gray-500 hover:text-black">Kontakt</a>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Dla sprzedających</p>
                <div className="mt-2 space-y-1 text-sm">
                  <a href="/dodaj" className="block text-gray-500 hover:text-black">Dodaj ogłoszenie</a>
                  <a href="/moje-ogloszenia" className="block text-gray-500 hover:text-black">Moje ogłoszenia</a>
                </div>
              </div>
            </div>
            <p className="mt-8 text-center text-xs text-gray-400">© 2026 Vintera. Wszelkie prawa zastrzeżone.</p>
          </div>
        </footer>
        <CookieBanner />
      </body>
    </html>
  );
}