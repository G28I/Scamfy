// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScamfyDepthCard } from "@/components/three/scamfy-depth-card";

describe("ScamfyDepthCard component", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("hover: hover"),
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

  it("renders children with 3D transform container attributes", () => {
    render(
      <ScamfyDepthCard>
        <div>Test Content</div>
      </ScamfyDepthCard>
    );

    const card = screen.getByTestId("scamfy-depth-card");
    expect(card).toBeDefined();
    expect(card.textContent).toContain("Test Content");
    expect(card.className).toContain("[transform-style:preserve-3d]");
  });

  it("calculates subtle transform on pointer move and resets on mouse leave", () => {
    render(
      <ScamfyDepthCard maxTilt={3}>
        <div>Test Content</div>
      </ScamfyDepthCard>
    );

    const card = screen.getByTestId("scamfy-depth-card");

    // Mock getBoundingClientRect
    card.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 100,
      width: 200,
      height: 200,
      right: 300,
      bottom: 300,
      x: 100,
      y: 100,
      toJSON: () => {},
    }));

    fireEvent.mouseMove(card, { clientX: 250, clientY: 250 });
    expect(card.style.transform).toContain("perspective(800px)");
    expect(card.style.transform).toContain("rotateX");
    expect(card.style.transform).toContain("rotateY");

    fireEvent.mouseLeave(card);
    expect(card.style.transform).toBe("perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)");
  });

  it("disables transform when prefers-reduced-motion is active", () => {
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

    render(
      <ScamfyDepthCard>
        <div>Test Content</div>
      </ScamfyDepthCard>
    );

    const card = screen.getByTestId("scamfy-depth-card");
    expect(card.style.transform).toBe("");
  });
});
