import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Threat Intelligence Directory",
  description:
    "Explore community-reported and verified scam patterns, suspicious UPI VPAs, fraudulent phone numbers, and active cyber threat indicators across India.",
  openGraph: {
    title: "Threat Intelligence Directory — Scamfy",
    description:
      "Explore community-reported and verified scam patterns, suspicious UPI VPAs, fraudulent phone numbers, and active cyber threat indicators across India.",
    url: "/intel",
    type: "website",
    siteName: "Scamfy",
    locale: "en_IN",
  },
};

/**
 * Layout component for the Threat Intelligence Directory page.
 *
 * @param props - Layout component properties including children
 * @returns React JSX fragment wrapping children
 */
export default function IntelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
