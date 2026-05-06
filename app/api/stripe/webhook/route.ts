import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/utils/supabase/service"
import { paymentTiers, type PaymentTier } from "@/lib/payments"

function isPaymentTier(value: unknown): value is PaymentTier {
  return typeof value === "string" && value in paymentTiers
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature") ?? ""

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  let event

  try {
    const stripe = await import("stripe")
    const stripeClient = new stripe.default(process.env.STRIPE_SECRET_KEY!)
    event = stripeClient.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const { tier, jobId } = session.metadata ?? {}

    if (!isPaymentTier(tier) || !jobId) {
      return NextResponse.json({ received: true })
    }

    try {
      const supabase = getSupabaseServiceClient()

      if (tier === "top" || tier === "exclusive") {
        const { error: updateError } = await supabase
          .from("jobs")
          .update({
            highlight_tier: tier,
            is_top: tier === "top",
            topped_at: new Date().toISOString(),
          })
          .eq("id", Number(jobId))

        if (updateError) {
          console.error("Failed to update job highlight:", updateError)
        }
      }

      const amount = session.amount_total ?? 0
      const currency = session.currency ?? "eur"

      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          stripe_session_id: session.id,
          tier,
          job_id: Number.isFinite(Number(jobId)) ? Number(jobId) : null,
          amount_cents: amount,
          currency,
          status: "completed",
        })

      if (paymentError) {
        console.error("Failed to insert payment record:", paymentError)
      }
    } catch (err) {
      console.error("Webhook processing error:", err)
      return NextResponse.json({ error: "Processing failed" }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
