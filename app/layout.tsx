import type { Metadata, Viewport } from "next";
import { Kulim_Park, Syne_Mono } from "next/font/google";
import "./globals.css";
import { Logo } from "./Logo";
import PlausibleProvider from "next-plausible";
import { Toaster } from "sonner";

const kulimPark = Kulim_Park({
  variable: "--font-kulim-park",
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700"],
});

const syneMono = Syne_Mono({
  variable: "--font-syne-mono",
  subsets: ["latin"],
  weight: ["400"],
});

const title = "sixtyoneeighty – Edit images with one prompt";
const description = "The easiest way to edit images in one prompt";
const url = "https://www.sixtyoneeighty.com/";
const ogimage = "https://www.sixtyoneeighty.com/og-image.png";
const sitename = "sixtyoneeighty.com";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${kulimPark.variable} ${syneMono.variable}`}>
      <head>
        <PlausibleProvider domain="easyedit.io" />
      </head>
      <body className="flex min-h-screen w-full flex-col antialiased">
        <header className="relative flex p-4 text-center text-white">
          <div className="absolute left-1/2 flex grow -translate-x-1/2 items-center gap-2 text-lg">
            <Logo />
            <a href="/" className="hover:text-gray-300 transition-colors">
              sixtyoneeighty
            </a>
          </div>
          <nav className="ml-auto flex items-center gap-4">
            <a 
              href="/how-it-works" 
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              How it works
            </a>
          </nav>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center overflow-auto pt-4 md:pb-12">
          <div className="w-full">{children}</div>
        </main>

        <Toaster />

        <footer className="flex flex-col items-center p-4">
          <p className="text-sm text-gray-400">
            Powered by{" "}
            <span className="text-gray-200">sixtyoneeighty</span>
            {" "}and{" "}
            <a
              href="https://togetherai.link"
              target="_blank"
              className="text-gray-200 underline underline-offset-2"
            >
              Together AI
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
