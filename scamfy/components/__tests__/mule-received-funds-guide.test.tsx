// @vitest-environment jsdom
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MuleReceivedFundsGuide } from "@/components/domain/mule-received-funds-guide";

describe("MuleReceivedFundsGuide Component (MULE-03, UX-05)", () => {
  it("renders Step 1 (Immediate Freeze) by default", () => {
    render(<MuleReceivedFundsGuide />);

    expect(screen.getByText(/Step 1: Immediate Fund Isolation & Freeze Protocol/i)).toBeDefined();
    expect(screen.getByText(/Do NOT touch, spend, or forward any part/i)).toBeDefined();
    expect(screen.getByText(/What if the scammer threatens you\?/i)).toBeDefined();
  });

  it("navigates to Step 2 (Bank Notice) and generates formal notice from input", () => {
    render(<MuleReceivedFundsGuide />);

    const nextBtn = screen.getByRole("button", { name: /Next Step/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Step 2: Formal Bank Notification/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/e\.g\. Rahul Sharma/i)).toBeDefined();

    // Input account holder name
    const nameInput = screen.getByPlaceholderText(/e\.g\. Rahul Sharma/i);
    fireEvent.change(nameInput, { target: { value: "Test User" } });

    expect(screen.getByText(/Generated Written Notice Template/i)).toBeDefined();
  });

  it("navigates through Step 3 (Evidence Checklist) and allows toggling checklist items", () => {
    render(<MuleReceivedFundsGuide />);

    // Step 1 -> Step 2
    fireEvent.click(screen.getByRole("button", { name: /Next Step/i }));
    // Step 2 -> Step 3
    fireEvent.click(screen.getByRole("button", { name: /Next Step/i }));

    expect(screen.getByText(/Step 3: Digital Evidence Preservation Checklist/i)).toBeDefined();
    const chatExportItem = screen.getByText(/Export Full Chat History/i);
    fireEvent.click(chatExportItem);
  });

  it("navigates to Step 4 (Official Report) and triggers onComplete when finished", () => {
    const onComplete = vi.fn();
    render(<MuleReceivedFundsGuide onComplete={onComplete} />);

    // Step 1 -> Step 2 -> Step 3 -> Step 4
    fireEvent.click(screen.getByRole("button", { name: /Next Step/i }));
    fireEvent.click(screen.getByRole("button", { name: /Next Step/i }));
    fireEvent.click(screen.getByRole("button", { name: /Next Step/i }));

    expect(screen.getByText(/Step 4: Official Helpline & Cyber Crime Portal Handoff/i)).toBeDefined();
    expect(screen.getByText(/Dial 1930/i)).toBeDefined();
    expect(screen.getAllByText(/cybercrime\.gov\.in/i).length).toBeGreaterThan(0);

    const completeBtn = screen.getByRole("button", { name: /Protocol Completed/i });
    fireEvent.click(completeBtn);
    expect(onComplete).toHaveBeenCalled();
  });
});
