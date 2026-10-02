import type { Metadata } from "next";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { MuleReceivedFundsGuide } from "@/components/domain/mule-received-funds-guide";
import { ShieldAlert, AlertTriangle, Scale, Lock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Money-Mule Protection & Received Funds Guide | Scamfy",
  description:
    "Critical guidance for students and account holders targeted by money-mule recruitment schemes. Step-by-step protocol for unsolicited received funds, voluntary bank debit holds, and evidence preservation.",
};

/**
 * Standalone Money-Mule Protection and Received Funds Emergency Guide page.
 * Provides public educational resources, liability warnings, and the interactive recovery protocol.
 *
 * @returns React JSX element rendering the money-mule guidance page
 */
export default function MuleProtectionPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="flex-1 py-10 sm:py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="border-b border-border/80 pb-8 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
              <span>Money-Mule Shield & Student Safety</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Money-Mule Protection & Unsolicited Funds Protocol
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Cybercrime syndicates actively recruit students and job seekers as unwitting &quot;money mules&quot;
              to receive and forward stolen funds. Learn how to identify recruitment traps, protect your bank account,
              and take immediate safe action if money has already been credited.
            </p>
          </div>

          {/* Educational Threat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl border border-border hover:border-rose-500/40 bg-card p-5 space-y-2.5 shadow-sm transition-colors">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <h3>The Forwarding Trap</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Offers framed as &quot;payment assistant&quot;, &quot;finance intern&quot;, or &quot;task commission&quot;
                that instruct you to receive money into your personal bank account and forward 90% elsewhere.
              </p>
            </div>

            <div className="rounded-xl border border-border hover:border-amber-500/40 bg-card p-5 space-y-2.5 shadow-sm transition-colors">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                <Lock className="h-4 w-4" />
                <h3>Account Rental Schemes</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Solicitations offering daily or weekly rent (e.g. ₹5,000/day) for sharing your personal savings,
                current, or UPI account for &quot;gaming payouts&quot; or &quot;crypto P2P arbitrage&quot;.
              </p>
            </div>

            <div className="rounded-xl border border-border hover:border-blue-500/40 bg-card p-5 space-y-2.5 shadow-sm transition-colors">
              <div className="flex items-center gap-2 text-blue-500 font-bold text-sm">
                <Scale className="h-4 w-4" />
                <h3>Legal Accountability</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Account holders remain responsible for transactions passing through their accounts. Stolen funds
                trigger automated bank debit holds, account freezes, and investigation as an accomplice.
              </p>
            </div>
          </div>

          {/* Interactive Protocol Component */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Emergency Action Protocol
              </h2>
              <Badge variant="outline" className="text-xs">
                Interactive Protocol
              </Badge>
            </div>

            <MuleReceivedFundsGuide />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
