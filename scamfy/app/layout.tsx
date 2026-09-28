import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CookieConsent } from "@/components/domain/cookie-consent";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://scamfy.org"),
  title: {
    default: "Scamfy — Check Suspicious Messages Before You Act",
    template: "%s | Scamfy",
  },
  description:
    "Fast, anonymous cyber fraud triage for India. Analyze suspicious WhatsApp messages, UPI payment requests, fake job offers, and digital arrest threats.",
  keywords: [
    "scam check india",
    "upi fraud checker",
    "cybercrime helpline 1930",
    "digital arrest scam",
    "phishing detector india",
    "telegram job scam",
    "electricity bill scam",
  ],
  authors: [{ name: "Scamfy Cyber Defense Initiative" }],
  creator: "Scamfy",
  publisher: "Scamfy",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://scamfy.org",
    siteName: "Scamfy",
    title: "Scamfy — Check Suspicious Messages Before You Act",
    description:
      "Instant, anonymous cyber fraud triage for India. Check suspicious WhatsApp messages, UPI payment requests, fake job offers, and digital arrest extortion.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Scamfy — Instant Scam Check & Cyber Threat Triage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scamfy — Check Suspicious Messages Before You Act",
    description:
      "Instant, anonymous cyber fraud triage for India. Check suspicious WhatsApp messages, UPI payment requests, fake job offers, and digital arrest threats.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
