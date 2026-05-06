"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { paymentTiers, type PaymentTier } from "@/lib/payments";

type HighlightActionsProps = {
  jobId?: string | number;
  compact?: boolean;
};

export function HighlightActions({ jobId = "demo", compact = false }: HighlightActionsProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  async function startCheckout(tier: PaymentTier) {
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
    <div className={compact ? "flex flex-wrap gap-2" : "grid gap-3 sm:grid-cols-3"}>
      <Button
        variant="outline"
        onClick={() => startCheckout("top")}
        disabled={!!loadingTier}
      >
        {loadingTier === "top" ? "..." : paymentTiers.top.label}
      </Button>
      <Button
        className="bg-amber-500 text-black hover:bg-amber-400"
        onClick={() => startCheckout("exclusive")}
        disabled={!!loadingTier}
      >
        {loadingTier === "exclusive" ? "..." : paymentTiers.exclusive.label}
      </Button>
      {!compact && (
        <Button
          variant="secondary"
          onClick={() => startCheckout("add-ad")}
          disabled={!!loadingTier}
        >
          {loadingTier === "add-ad" ? "..." : paymentTiers["add-ad"].label}
        </Button>
      )}
    </div>
  );
}
