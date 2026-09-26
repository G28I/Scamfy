import * as React from "react";
import Link from "next/link";
import { ExternalLink, Lock, PhoneCall, ShieldAlert } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/20 text-xs text-muted-foreground mt-auto">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-3.5">
            <Link
              href="/"
              className="flex items-center gap-2 font-extrabold text-base text-foreground"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs">
                <ShieldAlert className="h-4 w-4 text-red-500" />
              </div>
              <span className="tracking-tight">
                Scam<span className="text-primary font-black">fy</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              India&apos;s student and citizen cyber fraud triage platform. Combining deterministic pattern analysis with AI models to detect UPI traps, digital arrest threats, and phishing scams.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Operational &bull; Non-commercial Open Defense</span>
            </div>
          </div>

          {/* Nav Col 1: Platform */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-bold text-foreground text-xs uppercase tracking-wider block">
              Triage Platform
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Instant Scam Check
                </Link>
              </li>
              <li>
                <Link href="/intel" className="hover:text-foreground transition-colors">
                  Community Threat Intel
                </Link>
              </li>
              <li>
                <Link href="/cases" className="hover:text-foreground transition-colors">
                  Victim Assistance Cases
                </Link>
              </li>
              <li>
                <Link href="/design-system" className="hover:text-foreground transition-colors">
                  Design System Primitives
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 2: Emergency & Legal */}
          <div className="md:col-span-4 space-y-3">
            <span className="font-bold text-foreground text-xs uppercase tracking-wider block">
              Emergency &amp; Policies
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="tel:1930"
                  className="inline-flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400 hover:underline"
                >
                  <PhoneCall className="h-3 w-3" />
                  <span>National Cyber Helpline: 1930</span>
                </a>
              </li>
              <li>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <span>cybercrime.gov.in</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy &amp; Data Rights
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground/90">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>
              Scamfy is an educational cybersecurity triage utility and does not replace official police reporting (AI-05, OOS-03).
            </span>
          </div>

          <p className="flex items-center gap-1 shrink-0">
            <span>&copy; {new Date().getFullYear()} Scamfy Project. Open Community Cyber Defense.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
