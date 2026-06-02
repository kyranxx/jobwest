"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trackMarketingEvent } from "@/lib/marketing-events";
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
    const toastId = toast.loading("Pripravujeme platbu...");
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

      trackMarketingEvent("begin_checkout", {
        currency: "EUR",
        value: paymentTiers[tier].amount / 100,
        items: [
          {
            item_id: String(jobId),
            item_name: paymentTiers[tier].name,
            item_category: "job_highlight",
            item_variant: tier,
            price: paymentTiers[tier].amount / 100,
            quantity: 1,
          },
        ],
      });
      toast.success("Presmerovávame na platbu.", { id: toastId });
      window.location.href = data.url;
    } catch (error) {
      toast.dismiss(toastId);
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
