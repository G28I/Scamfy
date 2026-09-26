// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IndicatorTag } from "@/components/domain/indicator-tag";

describe("IndicatorTag component", () => {
  it("renders indicator type and monospace value", () => {
    render(<IndicatorTag type="UPI_ID" value="test@ybl" />);
    expect(screen.getByText("UPI ID")).toBeDefined();
    expect(screen.getByText("test@ybl")).toBeDefined();
  });

  it("handles copy to clipboard action with feedback", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<IndicatorTag type="PHONE" value="+919876543210" copyable={true} />);
    const copyButton = screen.getByRole("button", { name: /Copy Phone/i });
    expect(copyButton).toBeDefined();

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith("+919876543210");
    });
  });
});
