import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design System & UI Primitives",
  description: "Internal design system showcase, color tokens, and atomic primitives for Scamfy.",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Layout wrapper for the internal Design System showcase.
 *
 * @param props - Layout component properties including children
 * @returns React JSX fragment wrapping children
 */
export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
