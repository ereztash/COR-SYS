// @ts-nocheck
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { UserProfileProvider } from "@/contexts/growth/UserProfileContext";
import { AuthProvider } from "@/contexts/growth/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/growth/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import LoadingFallback from "@/components/growth/LoadingFallback";

const queryClient = new QueryClient();

export default function GrowthProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <UserProfileProvider>
            <TooltipProvider>
              <Toaster />
              <SonnerToaster />
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  {children}
                </Suspense>
              </ErrorBoundary>
            </TooltipProvider>
          </UserProfileProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
