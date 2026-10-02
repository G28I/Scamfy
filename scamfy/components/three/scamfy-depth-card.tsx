"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

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

function subscribeFinePointer(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }
  const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getFinePointerSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function getServerSnapshotFalse(): boolean {
  return false;
}

export interface ScamfyDepthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number;
  className?: string;
}

/**
 * Restrained 3D depth and tilt container for NON-CRITICAL informational cards.
 * Features subtle pointer-responsive parallax, automatic touch-device disablement,
 * and strict reduced-motion adherence without layout-property animation.
 *
 * @param props - Container attributes, maxTilt degree limit, and child nodes
 * @returns React JSX element rendering the depth-enhanced card wrapper
 */
export function ScamfyDepthCard({
  children,
  maxTilt = 2.5,
  className,
  ...props
}: ScamfyDepthCardProps) {
  const [transformStyle, setTransformStyle] = React.useState<React.CSSProperties>({
    transform: "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
    transition: "transform 250ms cubic-bezier(0.16, 1, 0.3, 1)",
  });

  const prefersReducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerSnapshotFalse
  );

  const isFinePointer = React.useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getServerSnapshotFalse
  );

  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !isFinePointer || !cardRef.current) {
        return;
      }

      const rect = cardRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
      const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;

      const rotateX = (-normalizedY * maxTilt).toFixed(2);
      const rotateY = (normalizedX * maxTilt).toFixed(2);

      setTransformStyle({
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`,
        transition: "transform 80ms ease-out",
      });
    },
    [prefersReducedMotion, isFinePointer, maxTilt]
  );

  const handleMouseLeave = React.useCallback(() => {
    if (prefersReducedMotion || !isFinePointer) {
      return;
    }

    setTransformStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
      transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
    });
  }, [prefersReducedMotion, isFinePointer]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={prefersReducedMotion || !isFinePointer ? undefined : transformStyle}
      className={cn(
        "will-change-transform [transform-style:preserve-3d]",
        className
      )}
      data-testid="scamfy-depth-card"
      {...props}
    >
      {children}
    </div>
  );
}
