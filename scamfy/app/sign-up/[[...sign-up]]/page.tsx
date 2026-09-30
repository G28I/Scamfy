import { SignUp } from "@clerk/nextjs";
import { SiteHeader } from "@/components/shared/site-header";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Create Account — Scamfy",
  description: "Create an account on Scamfy to access cyber defense tools, community threat intelligence, and secure case records.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-4 w-4" />
            <span>Encrypted Identity Registration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Join <span className="text-primary">Scamfy</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Create an account to join India&apos;s open cyber defense network.
          </p>
          <div className="flex justify-center pt-2">
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              fallbackRedirectUrl="/"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
