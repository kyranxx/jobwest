import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { paymentTiers } from "@/lib/payments";

const highlightSchema = z.object({
  tier: z.enum(["top", "exclusive", "add-ad"]),
  jobId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tier, jobId } = highlightSchema.parse(body);
  const selectedTier = paymentTiers[tier];
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? request.nextUrl.origin;

  const successUrl = `${origin}/platba/uspesna?tier=${tier}&jobId=${jobId ?? "demo"}`;
  const cancelUrl = `${origin}/platba/zrusena?tier=${tier}&jobId=${jobId ?? "demo"}`;

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({
      mode: "demo",
      url: `${successUrl}&demo=1`,
    });
  }

  const params = new URLSearchParams({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][unit_amount]": String(selectedTier.amount),
    "line_items[0][price_data][product_data][name]": selectedTier.name,
    "line_items[0][price_data][product_data][description]": selectedTier.description,
    "metadata[tier]": tier,
    "metadata[jobId]": jobId ?? "",
  });

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = await stripeResponse.json();

  if (!stripeResponse.ok) {
    return NextResponse.json(
      { error: data.error?.message ?? "Stripe checkout failed." },
      { status: 400 }
    );
  }

  return NextResponse.json({ mode: "stripe", url: data.url });
}
