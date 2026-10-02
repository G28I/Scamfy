// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScamfyThreeHero } from "@/components/three/scamfy-three-hero";

vi.mock("@designcodeio/threeui/components/DotMatrixBackground", () => ({
  DotMatrixBackground: ({
    className,
    opacity,
    speed,
    pulseSpeed,
    gridScale,
    mouseAmount,
  }: {
    className?: string;
    opacity?: number;
    speed?: number;
    pulseSpeed?: number;
    gridScale?: number;
    mouseAmount?: number;
  }) => (
    <div
      data-testid="dot-matrix-mock"
      data-speed={speed}
      data-pulse-speed={pulseSpeed}
      data-grid-scale={gridScale}
      data-mouse-amount={mouseAmount}
      data-opacity={opacity}
      className={className}
    />
  ),
}));

describe("ScamfyThreeHero component", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("renders with aria-hidden, pointer-events-none, and correct defaults on desktop", async () => {
    const { container } = render(<ScamfyThreeHero opacity={0.14} />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeDefined();
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");

    const matrix = await screen.findByTestId("dot-matrix-mock");
    expect(matrix).toBeDefined();
    expect(matrix.getAttribute("data-opacity")).toBe("0.14");
    expect(matrix.getAttribute("data-speed")).toBe("0.35");
    expect(matrix.getAttribute("data-grid-scale")).toBe("50");
    expect(matrix.getAttribute("data-mouse-amount")).toBe("0.02");
  });

  it("freezes motion when prefers-reduced-motion is active", async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<ScamfyThreeHero opacity={0.2} />);
    const matrix = await screen.findByTestId("dot-matrix-mock");
    expect(matrix).toBeDefined();
    expect(matrix.getAttribute("data-speed")).toBe("0");
    expect(matrix.getAttribute("data-pulse-speed")).toBe("0");
    expect(matrix.getAttribute("data-mouse-amount")).toBe("0");
  });

  it("scales down quality and disables mouse parallax on mobile viewport", async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("max-width: 640px"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<ScamfyThreeHero opacity={0.15} />);
    const matrix = await screen.findByTestId("dot-matrix-mock");
    expect(matrix).toBeDefined();
    expect(matrix.getAttribute("data-grid-scale")).toBe("36");
    expect(matrix.getAttribute("data-mouse-amount")).toBe("0");
    expect(matrix.getAttribute("data-speed")).toBe("0.2");
  });
});
