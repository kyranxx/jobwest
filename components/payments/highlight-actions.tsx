"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { paymentTiers } from "@/lib/payments";

type HighlightActionsProps = {
  jobId: string | number;
  compact?: boolean;
};

type HighlightPaymentTier = "top" | "exclusive";

export function HighlightActions({ jobId, compact = false }: HighlightActionsProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  async function startCheckout(tier: HighlightPaymentTier) {
    setLoadingTier(tier);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, jobId: String(jobId) }),
      });
      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Platbu sa nepodarilo spustiť.");
      }

      window.location.href = data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Platbu sa nepodarilo spustiť.");
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "grid gap-3 sm:grid-cols-2"}>
      <Button
        variant="outline"
        className="h-12 justify-between border-slate-200 bg-white px-4"
        onClick={() => startCheckout("top")}
        disabled={!!loadingTier}
      >
        <span>{loadingTier === "top" ? "..." : paymentTiers.top.label}</span>
        {!compact && <span className="text-xs font-normal text-slate-500">vyššie v zozname</span>}
      </Button>
      <Button
        className="h-12 justify-between bg-amber-500 px-4 text-black hover:bg-amber-400"
        onClick={() => startCheckout("exclusive")}
        disabled={!!loadingTier}
      >
        <span>{loadingTier === "exclusive" ? "..." : paymentTiers.exclusive.label}</span>
        {!compact && <span className="text-xs font-normal text-amber-950/80">najvyššia viditeľnosť</span>}
      </Button>
    </div>
  );
}
