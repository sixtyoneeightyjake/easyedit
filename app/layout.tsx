import type { Metadata, Viewport } from "next";
import { Kulim_Park, Syne_Mono } from "next/font/google";
import "./globals.css";
import { Logo } from "./Logo";
import PlausibleProvider from "next-plausible";
import { UserAPIKey } from "./UserAPIKey";
import { Toaster } from "@/components/ui/sonner";
import GitHub from "./components/GitHubIcon";
import XformerlyTwitter from "./components/TwitterIcon";

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

const title = "EasyEdit – edit images in one prompt";
const description = "The easiest way to edit images in one prompt";
const url = "https://www.easyedit.io/";
const ogimage = "https://www.easyedit.io/og-image.png";
const sitename = "easyedit.io";

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
      <body className="flex min-h-dvh w-full flex-col antialiased">
        <header className="relative flex p-4 text-center text-white">
          <UserAPIKey />

          <div className="absolute left-1/2 flex grow -translate-x-1/2 items-center gap-2 text-lg max-md:hidden">
            <Logo />
            EasyEdit
          </div>

          <div></div>
        </header>

        <main className="flex grow flex-col items-center justify-center pt-4 pb-12">
          <div className="w-full">{children}</div>
        </main>

        <Toaster />

        <footer className="flex flex-col items-center p-4 max-md:gap-4 md:flex-row md:justify-between">
          <p className="text-sm text-gray-400">
            Powered by{" "}
            <a
              href="https://www.together.ai/blog/flux-1-kontext"
              target="_blank"
              className="text-gray-200 underline underline-offset-2"
            >
              Together.ai & Flux
            </a>
          </p>
          <div className="flex gap-3 text-sm">
            <a
              href=""
              className="flex h-7 items-center gap-1 rounded border-[0.5px] border-gray-700 px-2.5 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-300"
            >
              <GitHub className="size-[10px]" />
              GitHub
            </a>
            <a
              href=""
              className="flex h-7 items-center gap-1 rounded border-[0.5px] border-gray-700 px-2.5 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-300"
            >
              <XformerlyTwitter className="size-[10px]" />
              Twitter
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
