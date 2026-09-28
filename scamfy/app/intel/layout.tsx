import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Threat Intelligence Directory",
  description:
    "Explore community-reported and verified scam patterns, suspicious UPI VPAs, fraudulent phone numbers, and active cyber threat indicators across India.",
  openGraph: {
    title: "Threat Intelligence Directory — Scamfy",
    description:
      "Explore community-reported and verified scam patterns, suspicious UPI VPAs, fraudulent phone numbers, and active cyber threat indicators across India.",
  },
};

export default function IntelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
