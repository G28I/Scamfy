import Link from "next/link";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Search, ArrowLeft, PhoneCall } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Visual Icon */}
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/60 border border-border shadow-inner">
            <ShieldAlert className="h-10 w-10 text-primary" />
          </div>

          {/* Heading and Copy */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground font-semibold">
              Error 404 &bull; Page Not Found
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Lost in the Threat Matrix?
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The page or threat report you are looking for does not exist, has been moved, or is restricted to authorized security moderators.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto font-bold gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Return to Scam Check
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto font-semibold gap-2">
              <Link href="/intel">
                <Search className="h-4 w-4" />
                Browse Threat Intel
              </Link>
            </Button>
          </div>

          {/* Emergency Helpline Callout */}
          <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-4 text-xs text-muted-foreground flex items-center justify-center gap-2">
            <PhoneCall className="h-4 w-4 text-red-600 shrink-0" />
            <span>
              Victim of ongoing cyber extortion or fraud? Call <strong>1930</strong> immediately.
            </span>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
