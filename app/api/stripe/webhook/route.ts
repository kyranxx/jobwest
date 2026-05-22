import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/utils/supabase/service"
import { isConfiguredSecret, isLiveStripeSecretForSite, paymentTiers, type PaymentTier } from "@/lib/payments"
import { siteConfig } from "@/lib/site"

function isPaymentTier(value: unknown): value is PaymentTier {
  return typeof value === "string" && value in paymentTiers
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature") ?? ""
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!isConfiguredSecret(stripeSecretKey) || !isConfiguredSecret(stripeWebhookSecret)) {
    return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 500 })
  }

  if (!isLiveStripeSecretForSite(stripeSecretKey, siteConfig.url)) {
    return NextResponse.json({ error: "Stripe webhook is not configured for the production domain" }, { status: 500 })
  }

  let event

  try {
    const stripe = await import("stripe")
    const stripeClient = new stripe.default(stripeSecretKey)
    event = stripeClient.webhooks.constructEvent(body, signature, stripeWebhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const { tier, jobId, userId, portalCode } = session.metadata ?? {}

    const numericJobId = Number(jobId)
    const currentPortalCode = portalCode || siteConfig.portalCode

    if (session.payment_status !== "paid") {
      console.error("Ignoring Stripe session that is not paid:", session.id)
      return NextResponse.json({ received: true })
    }

    if (!isPaymentTier(tier) || !Number.isInteger(numericJobId) || numericJobId <= 0 || !userId) {
      console.error("Ignoring Stripe session with invalid JobWest metadata:", session.id)
      return NextResponse.json({ received: true })
    }

    try {
      const supabase = getSupabaseServiceClient()
      const amount = session.amount_total ?? 0
      const currency = (session.currency ?? "eur").toLowerCase()
      const completedAt = new Date(session.created * 1000).toISOString()
      const selectedTier = paymentTiers[tier]

      if (amount !== selectedTier.amount || currency !== "eur") {
        console.error("Ignoring Stripe session with unexpected amount or currency:", session.id)
        return NextResponse.json({ received: true })
      }

      const { data: paidJob, error: paidJobError } = await supabase
        .from("jobs")
        .select("id,user_id,portal_code")
        .eq("id", numericJobId)
        .maybeSingle()

      if (paidJobError) {
        console.error("Failed to verify paid job before highlight update:", paidJobError)
        return NextResponse.json({ error: "Job verification failed" }, { status: 500 })
      }

      if (
        !paidJob ||
        paidJob.user_id !== userId ||
        (paidJob.portal_code || siteConfig.portalCode) !== currentPortalCode
      ) {
        console.error("Ignoring Stripe session for job/user/portal mismatch:", session.id)
        return NextResponse.json({ received: true })
      }

      const { error: paymentError } = await supabase
        .from("payments")
        .upsert(
          {
            stripe_session_id: session.id,
            tier,
            job_id: numericJobId,
            user_id: userId,
            portal_code: currentPortalCode,
            amount_cents: amount,
            currency,
            status: "completed",
          },
          { onConflict: "stripe_session_id" },
        )

      if (paymentError) {
        console.error("Failed to upsert payment record:", paymentError)
        return NextResponse.json({ error: "Payment persistence failed" }, { status: 500 })
      }

      if (tier === "top" || tier === "exclusive") {
        const { data: updatedJob, error: updateError } = await supabase
          .from("jobs")
          .update({
            highlight_tier: tier,
            is_top: tier === "top",
            topped_at: completedAt,
          })
          .eq("id", numericJobId)
          .eq("user_id", userId)
          .eq("portal_code", currentPortalCode)
          .select("id")
          .maybeSingle()

        if (updateError || !updatedJob) {
          console.error("Failed to update job highlight:", updateError)
          return NextResponse.json({ error: "Highlight update failed" }, { status: 500 })
        }
      }
    } catch (err) {
      console.error("Webhook processing error:", err)
      return NextResponse.json({ error: "Processing failed" }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
