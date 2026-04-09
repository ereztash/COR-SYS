// @ts-nocheck
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/growth/AuthContext";
import { Feature, PricingTier } from "@/lib/growth/pricingTiers";

/**
 * Hook for feature-gated access. Returns gate check + paywall state.
 */
export function useFeatureGate() {
  const { canUse, tier } = useAuth();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<Feature>("maxFunnels");
  const [paywallTier, setPaywallTier] = useState<PricingTier>("pro");

  const checkAccess = useCallback((feature: Feature, requiredTier: PricingTier = "pro"): boolean => {
    if (canUse(feature)) return true;
    setPaywallFeature(feature);
    setPaywallTier(requiredTier);
    setPaywallOpen(true);
    return false;
  }, [canUse]);

  return {
    tier,
    canUse,
    checkAccess,
    paywallOpen,
    setPaywallOpen,
    paywallFeature,
    paywallTier,
  };
}
