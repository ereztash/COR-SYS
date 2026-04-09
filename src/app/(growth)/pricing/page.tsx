// @ts-nocheck
"use client";

export const dynamic = "force-dynamic";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageContext";
import { getLatestPlanResult } from "@/lib/growth/minimalFormDefaults";
import Header from "@/components/growth/Header";
import BackToHub from "@/components/growth/BackToHub";
import PricingIntelligenceTab from "@/components/growth/PricingIntelligenceTab";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import Illustration from "@/components/ui/illustration";

export default function Page() {
  const { language } = useLanguage();
  const isHe = language === "he";
  const router = useRouter();
  const result = useMemo(() => getLatestPlanResult(), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-20 pb-16 max-w-5xl">
        <BackToHub currentPage={language === "he" ? "תמחור" : "Pricing"} />
        {result ? (
          <PricingIntelligenceTab result={result} />
        ) : (
          <div className="text-center py-16 space-y-4">
            <Illustration type="analytics" size={96} className="text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-bold" dir="auto">{isHe ? "אינטליגנציית תמחור" : "Pricing Intelligence"}</h2>
            <p className="text-muted-foreground max-w-md mx-auto" dir="auto">
              {isHe ? "כדי לייצר אסטרטגיית תמחור, צריך קודם לבנות תוכנית שיווק" : "To generate a pricing strategy, first build a marketing plan"}
            </p>
            <Button onClick={() => router.push("/growth/wizard")} className="cta-warm">{isHe ? "בנה תוכנית (2 דק')" : "Build Plan (2 min)"}</Button>
          </div>
        )}
      </main>
    </div>
  );
}
