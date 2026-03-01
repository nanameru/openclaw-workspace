"use client";

import { ClerkProvider } from "@clerk/nextjs";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  if (!clerkEnabled) return <>{children}</>;
  return <ClerkProvider>{children}</ClerkProvider>;
};
