"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Lazy-load DotMatrixBackground directly from package-components to avoid bundling unrelated scenes
const DotMatrixBackground = dynamic(
  () =>
    import("@designcodeio/threeui/components/DotMatrixBackground").then(
      (mod) => mod.DotMatrixBackground
    ),
  {
    ssr: false,
    loading: () => null,
  }
);

export interface TacticalHeroMatrixProps extends React.HTMLAttributes<HTMLDivElement> {
  opacity?: number;
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

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

function subscribeMounted() {
  return () => {};
}

function getMountedSnapshot(): boolean {
  return true;
}

function getMountedServerSnapshot(): boolean {
  return false;
}

/**
 * Restrained 3D WebGL background grid for the Scamfy homepage hero section.
 * Renders a subtle tactical telemetry matrix with reduced-motion adaptation.
 *
 * @param props - HTML div element properties
 * @returns React JSX element rendering the tactical background canvas
 */
export function TacticalHeroMatrix({
  className,
  opacity = 0.15,
  ...props
}: TacticalHeroMatrixProps) {
  const isMounted = React.useSyncExternalStore(
    subscribeMounted,
    getMountedSnapshot,
    getMountedServerSnapshot
  );

  const prefersReducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  if (!isMounted) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]",
        className
      )}
      {...props}
    >
      <DotMatrixBackground
        speed={prefersReducedMotion ? 0 : 0.35}
        pulseSpeed={prefersReducedMotion ? 0 : 0.2}
        gridScale={50}
        mouseAmount={prefersReducedMotion ? 0 : 0.02}
        opacity={opacity}
        className="!bg-transparent h-full w-full"
      />
    </div>
  );
}
