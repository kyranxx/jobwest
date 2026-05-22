import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isConfiguredSecret, isLiveStripeSecretForSite, paymentTiers } from "@/lib/payments";
import { siteConfig } from "@/lib/site";
import { getSupabaseServerClient } from "@/lib/utils/supabase/server";

const highlightSchema = z.object({
  tier: z.enum(["top", "exclusive"]),
  jobId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatná požiadavka." }, { status: 400 });
  }

  const parsedBody = highlightSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Vyberte platný balík a inzerát." }, { status: 400 });
  }

  const { tier, jobId } = parsedBody.data;
  const selectedTier = paymentTiers[tier];
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Na platbu sa musíte prihlásiť." }, { status: 401 });
  }

  const numericJobId = Number(jobId);

  if (!Number.isInteger(numericJobId) || numericJobId <= 0) {
    return NextResponse.json({ error: "Vyberte platný inzerát na zvýraznenie." }, { status: 400 });
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id,portal_code")
    .eq("id", numericJobId)
    .eq("user_id", user.id)
    .eq("portal_code", siteConfig.portalCode)
    .maybeSingle();

  if (jobError || !job) {
    return NextResponse.json({ error: "Inzerát sa nenašiel alebo nemáte oprávnenie." }, { status: 404 });
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? request.nextUrl.origin;

  const successUrl = `${origin}/platba/uspesna?tier=${tier}&jobId=${numericJobId}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/platba/zrusena?tier=${tier}&jobId=${numericJobId}`;

  if (!isConfiguredSecret(process.env.STRIPE_SECRET_KEY)) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Platby nie sú nakonfigurované." },
        { status: 503 },
      );
    }

    return NextResponse.json({
      mode: "demo",
      url: `${successUrl}&demo=1`,
    });
  }

  if (!isLiveStripeSecretForSite(process.env.STRIPE_SECRET_KEY, siteConfig.url)) {
    return NextResponse.json(
      { error: "Platby nie sú nakonfigurované pre produkčnú doménu." },
      { status: 503 },
    );
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
    "metadata[jobId]": String(numericJobId),
    "metadata[userId]": user.id,
    "metadata[portalCode]": siteConfig.portalCode,
  });

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = await stripeResponse.json().catch(() => null);

  if (!stripeResponse.ok) {
    return NextResponse.json(
      { error: data?.error?.message ?? "Stripe checkout failed." },
      { status: 400 }
    );
  }

  if (typeof data?.url !== "string" || !data.url) {
    return NextResponse.json({ error: "Stripe nevrátil platobný odkaz." }, { status: 502 });
  }

  return NextResponse.json({ mode: "stripe", url: data.url });
}
