// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyPolicyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";

describe("Privacy & Terms Legal Information Pages", () => {
  describe("Privacy Policy Page (/privacy)", () => {
    it("renders successfully with accessible level-1 heading", () => {
      render(<PrivacyPolicyPage />);
      const heading = screen.getByRole("heading", { level: 1, name: /Privacy Policy/i });
      expect(heading).toBeDefined();
    });

    it("includes key data-flow sections and transparency notice", () => {
      render(<PrivacyPolicyPage />);
      expect(screen.getAllByText(/Information We Collect/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Public vs\. Private Data Segregation/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Storage, Security & Audit Logs/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/\[privacy@scamfy\.org\]/i)).toBeDefined();
    });
  });

  describe("Terms & Conditions Page (/terms)", () => {
    it("renders successfully with accessible level-1 heading", () => {
      render(<TermsPage />);
      const heading = screen.getByRole("heading", { level: 1, name: /Terms & Conditions/i });
      expect(heading).toBeDefined();
    });

    it("displays prominent 1930 emergency hotline and non-judicial disclaimer", () => {
      render(<TermsPage />);
      expect(screen.getByText(/Essential Safety & Informational Scope Notice/i)).toBeDefined();
      expect(screen.getAllByText(/Informational Triage & No Legal or Emergency Authority/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/1930/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/\[legal@scamfy\.org\]/i)).toBeDefined();
    });
  });

  describe("Site Header & Footer Navigation Integration", () => {
    it("SiteFooter renders discoverable links to Privacy and Terms", () => {
      render(<SiteFooter />);
      const privacyLink = screen.getByRole("link", { name: /Privacy Policy/i });
      const termsLink = screen.getByRole("link", { name: /Terms & Conditions/i });

      expect(privacyLink).toBeDefined();
      expect(privacyLink.getAttribute("href")).toBe("/privacy");

      expect(termsLink).toBeDefined();
      expect(termsLink.getAttribute("href")).toBe("/terms");
    });

    it("SiteHeader renders main navigation and 1930 emergency trigger", () => {
      render(<SiteHeader />);
      expect(screen.getByRole("link", { name: /Scam Check/i }).getAttribute("href")).toBe("/");
      expect(screen.getByRole("link", { name: /Intel Directory/i }).getAttribute("href")).toBe("/intel");
      expect(screen.getByRole("link", { name: /Helpline 1930 Emergency Contact/i }).getAttribute("href")).toBe("tel:1930");
    });
  });
});
