import { vi } from "vitest";
import React from "react";

// Mock Clerk client SDK components for testing environments
vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  Show: ({ children, when }: { children: React.ReactNode; when: string }) =>
    when === "signed-out" ? React.createElement(React.Fragment, null, children) : null,
  UserButton: () => React.createElement("div", { "data-testid": "user-button" }, "UserButton"),
  SignInButton: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  SignUpButton: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  SignIn: () => React.createElement("div", { "data-testid": "clerk-sign-in" }, "SignIn"),
  SignUp: () => React.createElement("div", { "data-testid": "clerk-sign-up" }, "SignUp"),
  useUser: () => ({ isSignedIn: false, user: null }),
  useAuth: () => ({ isSignedIn: false, userId: null }),
}));
