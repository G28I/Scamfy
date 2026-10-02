"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Subpath dynamic client-only import of DotMatrixBackground
const DotMatrixBackground = dynamic(
  () =>
    import("@designcodeio/threeui/components/DotMatrixBackground").then(
      (mod) => mod.DotMatrixBackground
    ),
  {
    ssr: false,
    loading: () => <StaticGridFallback />,
  }
);

/**
 * Static SVG/CSS tactical grid fallback rendered before WebGL hydration or if WebGL is unavailable.
 */
function StaticGridFallback() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-10"
    />
  );
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeMobile(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }
  const mediaQuery = window.matchMedia("(max-width: 640px)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getMobileSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(max-width: 640px)").matches;
}

function getServerSnapshotFalse(): boolean {
  return false;
}

function subscribeMounted() {
  return () => {};
}

function getMountedSnapshot(): boolean {
  return true;
}

export interface ScamfyThreeHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  opacity?: number;
}

/**
 * Tactical Cyber Triage Terminal 3D hero visualization.
 * Integrates ThreeUI's DotMatrixBackground with reduced-motion compliance,
 * responsive mobile quality scaling, and graceful static fallback.
 *
 * @param props - HTML container attributes and optional opacity
 * @returns React JSX element rendering the tactical canvas
 */
export function ScamfyThreeHero({
  className,
  opacity = 0.14,
  ...props
}: ScamfyThreeHeroProps) {
  const isMounted = React.useSyncExternalStore(
    subscribeMounted,
    getMountedSnapshot,
    getServerSnapshotFalse
  );

  const prefersReducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerSnapshotFalse
  );

  const isMobile = React.useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getServerSnapshotFalse
  );

  if (!isMounted) {
    return <StaticGridFallback />;
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]",
        className
      )}
      data-testid="scamfy-three-hero-container"
      {...props}
    >
      <DotMatrixBackground
        speed={prefersReducedMotion ? 0 : isMobile ? 0.2 : 0.35}
        pulseSpeed={prefersReducedMotion ? 0 : isMobile ? 0.1 : 0.2}
        gridScale={isMobile ? 36 : 50}
        mouseAmount={prefersReducedMotion || isMobile ? 0 : 0.02}
        opacity={opacity}
        className="!bg-transparent h-full w-full"
      />
    </div>
  );
}
