"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, PhoneCall, Menu, X, Shield, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Scam Check" },
  { href: "/intel", label: "Threat Intel" },
  { href: "/cases", label: "Victim Cases" },
  { href: "/design-system", label: "Design System" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-all">
      {/* Top micro-bar for platform trust & helpline */}
      <div className="border-b border-border/40 bg-muted/30 px-4 py-1.5 text-[11px] text-muted-foreground hidden sm:block">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-foreground">Scamfy Open Defense Network</span>
            <span className="text-border">•</span>
            <span>Educational Cyber Fraud Triage for India</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <span className="text-border">•</span>
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1 font-semibold text-red-600 dark:text-red-400 hover:underline"
            >
              <span>National Cyber Helpline: <strong>1930</strong></span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1 transition-transform active:scale-[0.98]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm ring-1 ring-border">
            <ShieldAlert className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex flex-col">
            <span className="tracking-tight text-base font-extrabold leading-none">
              Scam<span className="text-primary font-black">fy</span>
            </span>
            <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
              Shield &bull; India
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-1 bg-muted/40 border border-border/60 rounded-full p-1 text-sm font-medium"
          aria-label="Main Navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-background text-foreground shadow-sm font-bold border border-border/80"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/intel"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Radio className="h-3.5 w-3.5 text-primary" />
            <span>Threat Intel</span>
          </Link>

          <a
            href="tel:1930"
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-900 transition-colors hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 shadow-sm"
            aria-label="Helpline 1930 Emergency Contact"
          >
            <PhoneCall className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
            <span>1930 Helpline</span>
          </a>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-border"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span>{item.label}</span>
                  {isActive && <Shield className="h-4 w-4 text-primary" />}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground px-1">
            <Link href="/privacy" onClick={() => setMobileMenuOpen(false)} className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" onClick={() => setMobileMenuOpen(false)} className="hover:underline">
              Terms &amp; Conditions
            </Link>
            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">
              cybercrime.gov.in
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
