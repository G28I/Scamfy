// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TacticalHeroMatrix } from "@/components/domain/tactical-hero-matrix";

vi.mock("@designcodeio/threeui/components/DotMatrixBackground", () => ({
  DotMatrixBackground: ({ className, opacity, speed, pulseSpeed }: { className?: string; opacity?: number; speed?: number; pulseSpeed?: number }) => (
    <div
      data-testid="dot-matrix-mock"
      data-speed={speed}
      data-pulse-speed={pulseSpeed}
      data-opacity={opacity}
      className={className}
    />
  ),
}));

describe("TacticalHeroMatrix component", () => {
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

  it("renders with aria-hidden, pointer-events-none, and default styling", async () => {
    const { container } = render(<TacticalHeroMatrix opacity={0.14} />);
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
  });

  it("detects prefers-reduced-motion and reduces speed to 0", async () => {
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

    render(<TacticalHeroMatrix opacity={0.2} />);
    const matrix = await screen.findByTestId("dot-matrix-mock");
    expect(matrix).toBeDefined();
    expect(matrix.getAttribute("data-speed")).toBe("0");
    expect(matrix.getAttribute("data-pulse-speed")).toBe("0");
  });
});
