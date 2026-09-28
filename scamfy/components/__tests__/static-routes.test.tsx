// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "@/app/not-found";
import CasesPage from "@/app/cases/page";
import ReportPage from "@/app/report/page";

describe("Hardened Static and Error Routes", () => {
  describe("Custom 404 Page (app/not-found.tsx)", () => {
    it("renders branded 404 page with return action to Scam Check", () => {
      render(<NotFound />);
      expect(screen.getByRole("heading", { level: 1, name: /Lost in the Threat Matrix/i })).toBeDefined();
      expect(screen.getByRole("link", { name: /Return to Scam Check/i }).getAttribute("href")).toBe("/");
      expect(screen.getByRole("link", { name: /Browse Threat Intel/i }).getAttribute("href")).toBe("/intel");
    });
  });

  describe("Victim Case Center (app/cases/page.tsx)", () => {
    it("renders private case workspace with confidential notice", () => {
      render(<CasesPage />);
      expect(screen.getByRole("heading", { level: 1, name: /Victim Case Center/i })).toBeDefined();
      expect(screen.getByText(/Zero-Leakage Private Evidence Storage/i)).toBeDefined();
    });
  });

  describe("Official Reporting Gateway (app/report/page.tsx)", () => {
    it("renders official reporting portals and 1930 golden hour helpline guidance", () => {
      render(<ReportPage />);
      expect(screen.getByRole("heading", { level: 1, name: /Official Cybercrime Reporting Guide/i })).toBeDefined();
      expect(screen.getByText(/The "Golden Hour" Rule/i)).toBeDefined();
      expect(screen.getByRole("link", { name: /Visit cybercrime\.gov\.in/i }).getAttribute("href")).toBe("https://cybercrime.gov.in");
    });
  });
});
