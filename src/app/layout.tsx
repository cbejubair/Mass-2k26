import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DeveloperProtection } from "@/components/dev-lock";

const BASE_URL = "https://mass-2k26.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "MASS 2K26",
    template: "%s | MASS 2K26",
  },
  description:
    "MASS 2K26 — the grand intra-college cultural fest. Live performances, electrifying competitions, art showcases, DJ night, and unforgettable moments. Join the celebration!",
  keywords: [
    "MASS 2K26",
    "intra college cultural fest",
    "cultural event",
    "college fest",
    "DJ night",
    "performances",
    "competitions",
  ],
  authors: [{ name: "MASS 2K26 Cultural Committee" }],
  creator: "MASS 2K26 Cultural Committee",
  publisher: "MASS 2K26",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "MASS 2K26",
    title: "MASS 2K26 — Intra College Cultural Fest",
    description:
      "The grand intra-college cultural fest is here! Live performances, DJ night, electrifying competitions, and unforgettable vibes. Be part of MASS 2K26.",
    images: [
      {
        url: "https://mass-2k26.vercel.app/meta.jpg",
        width: 1200,
        height: 630,
        alt: "MASS 2K26 — Intra College Cultural Fest",
        type: "image/jpeg",
      },
    ],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    site: "@mass2k26",
    creator: "@mass2k26",
    title: "MASS 2K26 — Intra College Cultural Fest",
    description:
      "The grand intra-college cultural fest is here! Live performances, DJ night, electrifying competitions, and unforgettable vibes. Be part of MASS 2K26.",
    images: ["https://mass-2k26.vercel.app/meta.jpg"],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen overflow-x-hidden">
        <DeveloperProtection />
        {children}
      </body>
    </html>
  );
}
