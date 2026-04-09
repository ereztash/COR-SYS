// @ts-nocheck
"use client";

export const dynamic = "force-dynamic";
import { useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageContext";
import { SavedPlan } from "@/types/growth/funnel";
import ResultsDashboard from "@/components/growth/ResultsDashboard";
import Header from "@/components/growth/Header";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle } from "lucide-react";

export default function Page() {
  const { planId } = useParams<{ planId: string }>();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? undefined;
  const { language } = useLanguage();
  const isHe = language === "he";
  const router = useRouter();

  const plan = useMemo<SavedPlan | null>(() => {
    try {
      const plans: SavedPlan[] = JSON.parse(localStorage.getItem("funnelforge-plans") || "[]");
      return plans.find((p) => p.id === planId) || null;
    } catch { return null; }
  }, [planId]);

  if (!plan) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground mb-2" dir="auto">
            {isHe ? "התוכנית לא נמצאה" : "Plan not found"}
          </p>
          <Button onClick={() => router.push("/growth/plans")} className="gap-2">
            <ArrowRight className={`h-4 w-4 ${isHe ? "" : "rotate-180"}`} />
            {isHe ? "חזור לתוכניות" : "Back to Plans"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ResultsDashboard
      result={plan.result}
      defaultTab={tab}
      onEdit={() => router.push("/growth/wizard")}
      onNewPlan={() => router.push("/growth/wizard")}
    />
  );
}
