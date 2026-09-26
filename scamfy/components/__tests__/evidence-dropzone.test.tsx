// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EvidenceDropzone } from "@/components/domain/evidence-dropzone";

describe("EvidenceDropzone component", () => {
  it("renders dropzone trigger with accessible button role", () => {
    render(<EvidenceDropzone />);
    const trigger = screen.getByRole("button", {
      name: /Upload evidence files/i,
    });
    expect(trigger).toBeDefined();
    expect(trigger.getAttribute("tabIndex")).toBe("0");
  });

  it("renders error message when error prop is supplied", () => {
    render(<EvidenceDropzone error="Corrupt image payload detected" />);
    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Corrupt image payload detected")).toBeDefined();
  });

  it("handles valid file selection via change event", () => {
    const handleFilesSelected = vi.fn();
    render(<EvidenceDropzone onFilesSelected={handleFilesSelected} />);

    const file = new File(["dummy content"], "receipt.png", { type: "image/png" });
    const dropzone = screen.getByRole("button", {
      name: /Upload evidence files/i,
    });

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(handleFilesSelected).toHaveBeenCalledWith([file]);
    expect(screen.getByText("receipt.png")).toBeDefined();
  });
});
