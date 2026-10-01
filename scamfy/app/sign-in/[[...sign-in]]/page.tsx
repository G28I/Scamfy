import { SignIn } from "@clerk/nextjs";
import { SiteHeader } from "@/components/shared/site-header";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Sign In — Scamfy",
  description: "Sign in to your Scamfy account to access community threat reports, track scam checks, and manage case evidence.",
};

/**
 * User sign-in page component powered by Clerk authentication.
 *
 * @returns React JSX element rendering the sign-in view
 */
export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-4 w-4" />
            <span>Secure Authentication Boundary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Sign in to <span className="text-primary">Scamfy</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Access threat intelligence, submit verified reports, and protect your digital footprint.
          </p>
          <div className="flex justify-center pt-2">
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
