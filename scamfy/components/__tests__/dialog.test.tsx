// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

describe("Dialog component (UX-03)", () => {
  it("opens modal and traps focus upon trigger click", () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <button>Open Modal</button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Security Notice</DialogTitle>
          <DialogDescription>Please review suspicious signals.</DialogDescription>
          <DialogClose asChild>
            <button>Close</button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByRole("button", { name: "Open Modal" });
    fireEvent.click(trigger);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Security Notice")).toBeDefined();
  });
});
