// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button component", () => {
  it("renders with text content and handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Analyze Text</Button>);

    const button = screen.getByRole("button", { name: "Analyze Text" });
    expect(button).toBeDefined();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables button and sets aria-busy when isLoading is true", () => {
    const handleClick = vi.fn();
    render(<Button isLoading onClick={handleClick}>Submitting</Button>);

    const button = screen.getByRole("button", { name: "Submitting" });
    expect(button.getAttribute("disabled")).not.toBeNull();
    expect(button.getAttribute("aria-busy")).toBe("true");

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders emergency variant with appropriate styling class", () => {
    render(<Button variant="emergency">Dial 1930</Button>);
    const button = screen.getByRole("button", { name: "Dial 1930" });
    expect(button.className).toContain("bg-risk-critical-border");
  });

  it("prevents pointer and keyboard clicks in asChild mode when disabled", () => {
    const handleClick = vi.fn();
    render(
      <Button asChild disabled>
        <a href="/test" onClick={handleClick}>
          Disabled Link
        </a>
      </Button>
    );

    const link = screen.getByText("Disabled Link").closest("a");
    expect(link).toBeDefined();
    expect(link?.getAttribute("aria-disabled")).toBe("true");
    expect(link?.getAttribute("tabindex")).toBe("-1");

    fireEvent.click(link!);
    expect(handleClick).not.toHaveBeenCalled();

    fireEvent.keyDown(link!, { key: "Enter" });
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("prevents activation and sets aria-busy in asChild mode when isLoading is true", () => {
    const handleClick = vi.fn();
    render(
      <Button asChild isLoading>
        <a href="/test" onClick={handleClick}>
          Loading Link
        </a>
      </Button>
    );

    const link = screen.getByText("Loading Link").closest("a");
    expect(link).toBeDefined();
    expect(link?.getAttribute("aria-disabled")).toBe("true");
    expect(link?.getAttribute("aria-busy")).toBe("true");

    fireEvent.click(link!);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
