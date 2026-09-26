// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StateFeedback } from "@/components/domain/state-feedback";

describe("StateFeedback component (UX-05)", () => {
  it("renders loading state with accessible role", () => {
    render(<StateFeedback state="loading" loadingText="Fetching threat intel..." />);
    const statuses = screen.getAllByRole("status");
    expect(statuses.length).toBeGreaterThan(0);
    expect(screen.getByText("Fetching threat intel...")).toBeDefined();
  });

  it("renders empty state with message", () => {
    render(<StateFeedback state="empty" emptyTitle="No threats found" emptyDescription="Clean input" />);
    const status = screen.getByRole("status");
    expect(status).toBeDefined();
    expect(screen.getByText("No threats found")).toBeDefined();
  });

  it("renders error state with retry action callback", () => {
    const handleRetry = vi.fn();
    render(
      <StateFeedback
        state="error"
        errorMessage="Network connection timed out"
        onRetry={handleRetry}
      />
    );

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Network connection timed out")).toBeDefined();

    const retryBtn = screen.getByRole("button", { name: /Retry Analysis/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
