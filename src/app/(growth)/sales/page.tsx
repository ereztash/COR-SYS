// @ts-nocheck
"use client";

export const dynamic = "force-dynamic";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageContext";
import { getLatestPlanResult } from "@/lib/growth/minimalFormDefaults";
import Header from "@/components/growth/Header";
import BackToHub from "@/components/growth/BackToHub";
import SalesTab from "@/components/growth/SalesTab";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
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
        <BackToHub currentPage={language === "he" ? "מכירות" : "Sales"} />
        {result ? (
          <SalesTab result={result} />
        ) : (
          <div className="text-center py-16 space-y-4">
            <Illustration type="sales" size={96} className="text-accent mx-auto" />
            <h2 className="text-2xl font-bold" dir="auto">{isHe ? "סקריפטי מכירה מותאמים" : "Personalized Sales Scripts"}</h2>
            <p className="text-muted-foreground max-w-md mx-auto" dir="auto">
              {isHe ? "כדי לייצר סקריפטים מותאמים, צריך קודם לבנות תוכנית שיווק" : "To generate personalized scripts, first build a marketing plan"}
            </p>
            <Button onClick={() => router.push("/growth/wizard")} className="cta-warm">{isHe ? "בנה תוכנית (2 דק')" : "Build Plan (2 min)"}</Button>
          </div>
        )}
      </main>
    </div>
  );
}
