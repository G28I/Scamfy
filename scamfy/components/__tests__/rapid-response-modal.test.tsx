// @vitest-environment jsdom
import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  RapidResponseModal,
  RapidResponseBanner,
} from "@/components/domain/rapid-response-modal";

describe("RapidResponseModal Component (OFF-02, UX-02, UX-03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders accessible alertdialog with correct title, description, and roles when open", () => {
    const onOpenChange = vi.fn();
    render(
      <RapidResponseModal
        isOpen={true}
        onOpenChange={onOpenChange}
        transactionUtr="UTR123456789012"
        financialLossAmount={50000}
      />
    );

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-describedby")).toBe("rapid-response-description");

    expect(
      screen.getByText(/Urgent: Initiate Inter-Bank Fraud Notification/i)
    ).toBeDefined();
    expect(screen.getByText(/Emergency Fraud Action/i)).toBeDefined();
    expect(screen.getByText(/Reported Loss: ₹50,000/i)).toBeDefined();
  });

  it("provides direct click-to-dial tel:1930 links with accessible labels and reduced-motion resilience", () => {
    const onOpenChange = vi.fn();
    render(
      <RapidResponseModal
        isOpen={true}
        onOpenChange={onOpenChange}
      />
    );

    const callLinks = screen.getAllByRole("link", { name: /1930/i });
    expect(callLinks.length).toBeGreaterThanOrEqual(1);

    const primaryCallLink = callLinks.find(
      (link) => link.getAttribute("href") === "tel:1930"
    );
    expect(primaryCallLink).toBeDefined();
    expect(primaryCallLink?.getAttribute("href")).toBe("tel:1930");

    // Check motion-reduce class is present on animated phone icons
    const icons = document.querySelectorAll(".motion-reduce\\:animate-none");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("contains direct link to official Cybercrime Portal (https://cybercrime.gov.in/)", () => {
    const onOpenChange = vi.fn();
    render(
      <RapidResponseModal
        isOpen={true}
        onOpenChange={onOpenChange}
      />
    );

    const portalLink = screen.getByRole("link", { name: /cybercrime\.gov\.in/i });
    expect(portalLink.getAttribute("href")).toBe("https://cybercrime.gov.in/");
    expect(portalLink.getAttribute("target")).toBe("_blank");
    expect(portalLink.getAttribute("rel")).toContain("noopener");
    expect(portalLink.getAttribute("rel")).toContain("noreferrer");
  });

  it("instructs user to contact their own bank via card/app credentials and warns against search ads", () => {
    const onOpenChange = vi.fn();
    render(
      <RapidResponseModal
        isOpen={true}
        onOpenChange={onOpenChange}
        bankName="State Bank of India"
      />
    );

    expect(screen.getByText(/Contact Your Bank Fraud Desk Immediately \(State Bank of India\)/i)).toBeDefined();
    expect(screen.getByText(/Use Only Verified Bank Contact Numbers/i)).toBeDefined();
    expect(
      screen.getByText(
        /Dial only the official phone number printed on the back of your physical debit\/credit card, passbook, or inside your official banking mobile app/i
      )
    ).toBeDefined();
    expect(
      screen.getByText(/Never call numbers found on search engine advertisements/i)
    ).toBeDefined();
  });

  it("displays transaction UTR and supports copy action when UTR is provided", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const onOpenChange = vi.fn();
    render(
      <RapidResponseModal
        isOpen={true}
        onOpenChange={onOpenChange}
        transactionUtr="UTR987654321098"
      />
    );

    expect(screen.getByText(/UTR987654321098/i)).toBeDefined();
    const copyButton = screen.getByRole("button", { name: /Copy UTR number/i });
    await React.act(async () => {
      fireEvent.click(copyButton);
    });

    expect(writeTextMock).toHaveBeenCalledWith("UTR987654321098");
  });

  it("clearly discloses that CFCFRMS and Scamfy cannot guarantee fund recovery", () => {
    const onOpenChange = vi.fn();
    render(
      <RapidResponseModal
        isOpen={true}
        onOpenChange={onOpenChange}
      />
    );

    expect(screen.getByText(/Important Disclosures & Procedural Boundaries/i)).toBeDefined();
    expect(screen.getByText(/No Fund Recovery Guarantee:/i)).toBeDefined();
    expect(
      screen.getByText(
        /neither CFCFRMS nor Scamfy can guarantee that funds will be frozen, preserved, or recovered/i
      )
    ).toBeDefined();
  });

  it("explicitly confirms that older transactions remain fully eligible for 1930 and bank notification", () => {
    const onOpenChange = vi.fn();
    render(
      <RapidResponseModal
        isOpen={true}
        onOpenChange={onOpenChange}
        elapsedHours={72}
      />
    );

    expect(
      screen.getByText(/Immediate Reporting Remains Essential & Eligible/i)
    ).toBeDefined();
    expect(
      screen.getByText(/Four hours is not an eligibility cutoff/i)
    ).toBeDefined();
    expect(
      screen.getByText(/freezing or recovering funds is not guaranteed/i)
    ).toBeDefined();
    expect(
      screen.getByText(/72h since incident/i)
    ).toBeDefined();
  });

  it("handles early reporting window (< 4h) with active golden hours guidance without setting hard cutoffs", () => {
    const onOpenChange = vi.fn();
    render(
      <RapidResponseModal
        isOpen={true}
        onOpenChange={onOpenChange}
        elapsedHours={1}
      />
    );

    expect(screen.getByText(/Early Reporting Window Active/i)).toBeDefined();
    expect(
      screen.getByText(/Reporting within the initial hours maximizes the likelihood of recipient banks attempting debit holds/i)
    ).toBeDefined();
  });

  it("discloses that intake does not equal an automatic FIR and Scamfy does not submit complaints", () => {
    const onOpenChange = vi.fn();
    render(
      <RapidResponseModal
        isOpen={true}
        onOpenChange={onOpenChange}
      />
    );

    expect(screen.getByText(/No Automatic FIR \/ Formal Filing:/i)).toBeDefined();
    expect(
      screen.getByText(
        /Calling 1930 or visiting the portal does not automatically mean a formal complaint has been fully registered or that an FIR has been lodged/i
      )
    ).toBeDefined();
    expect(
      screen.getByText(
        /Scamfy provides guidance and does not submit complaints, contact financial institutions, or initiate holds on your behalf/i
      )
    ).toBeDefined();
  });

  it("calls onOpenChange(false) when dismissal button is clicked", () => {
    const onOpenChange = vi.fn();
    render(
      <RapidResponseModal
        isOpen={true}
        onOpenChange={onOpenChange}
      />
    );

    const closeButton = screen.getByRole("button", {
      name: /I Have Notified My Bank \/ 1930 — Close/i,
    });
    fireEvent.click(closeButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("supports keyboard dismissal via Escape key", () => {
    const onOpenChange = vi.fn();
    render(
      <RapidResponseModal
        isOpen={true}
        onOpenChange={onOpenChange}
      />
    );

    fireEvent.keyDown(screen.getByRole("alertdialog"), {
      key: "Escape",
      code: "Escape",
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("RapidResponseBanner Component (OFF-02, UX-02)", () => {
  it("renders urgency alert banner with direct tel:1930 action and link to portal", () => {
    const onOpenModal = vi.fn();
    render(
      <RapidResponseBanner
        onOpenModal={onOpenModal}
        elapsedHours={2}
      />
    );

    const banner = screen.getByRole("alert");
    expect(banner).toBeDefined();
    expect(banner.getAttribute("aria-live")).toBe("assertive");

    const callLink = screen.getByRole("link", { name: /Call National Cyber Crime Helpline 1930/i });
    expect(callLink.getAttribute("href")).toBe("tel:1930");

    const portalLink = screen.getByRole("link", { name: /Portal/i });
    expect(portalLink.getAttribute("href")).toBe("https://cybercrime.gov.in/");

    const openModalBtn = screen.getByRole("button", { name: /Open Full Protocol/i });
    fireEvent.click(openModalBtn);
    expect(onOpenModal).toHaveBeenCalledTimes(1);
  });

  it("shows eligibility note for older transactions in banner", () => {
    render(<RapidResponseBanner elapsedHours={48} />);

    expect(
      screen.getByText(/Older transfers remain fully eligible and essential for investigation/i)
    ).toBeDefined();
  });
});
