import type { Metadata, Viewport } from "next";
import { Kulim_Park, Syne_Mono } from "next/font/google";
import "./globals.css";
import { Logo } from "./Logo";
import PlausibleProvider from "next-plausible";
import { UserAPIKey } from "./UserAPIKey";

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

export const metadata: Metadata = {
  title: "EasyEdit",
  description: "The easiest way to edit images in one prompt",
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
      <body className="bg-gray-950 text-gray-300 antialiased">
        <header className="relative flex p-4 text-center text-white">
          <UserAPIKey />

          <div className="absolute left-1/2 flex grow -translate-x-1/2 items-center gap-2 text-lg max-md:hidden">
            <Logo />
            EasyEdit
          </div>
          <div></div>
        </header>

        <main className="mt-4">{children}</main>
      </body>
    </html>
  );
}
