// @ts-nocheck
"use client";

import dynamic from "next/dynamic";

// Dynamically import the full growth layout with ssr: false
// This prevents all localStorage references from running during SSR
const GrowthProviders = dynamic(() => import("./GrowthProviders"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  ),
});

export default function GrowthLayout({ children }: { children: React.ReactNode }) {
  return <GrowthProviders>{children}</GrowthProviders>;
}
