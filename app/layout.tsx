import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JSON Translator | Multilingual Key Converter",
  description: "Translate your JSON files into 40+ languages instantly using Google Translate API. Ideal for internationalizing websites and apps.",
  keywords: [
    "json translator",
    "i18n",
    "language translation",
    "google translate json",
    "multilingual support",
    "translate keys",
    "json localization",
    "internationalization tool",
    "next.js translation",
    "translate json app"
  ],
  openGraph: {
    title: "JSON Translator | Multilingual Key Converter",
    description: "Effortlessly translate your app or website's JSON content into multiple languages.",
    url: "https://json-translator-omega.vercel.app/",
    siteName: "JSON Translator",
    images: [
      {
        url: "https://json-translator-omega.vercel.app//og-image.png", // replace with your image URL
        width: 1200,
        height: 630,
        alt: "JSON Translator preview"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Translator",
    description: "Translate your JSON keys into over 40 languages effortlessly.",
    images: ["https://json-translator-omega.vercel.app//og-image.png"] // replace accordingly
  },
  metadataBase: new URL("https://json-translator-omega.vercel.app/")
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
