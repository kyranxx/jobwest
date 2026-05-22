import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { getSupabaseServerClient } from "@/lib/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; jobId?: string; session_id?: string; demo?: string }>;
}) {
  const params = await searchParams;
  const isDemo = process.env.NODE_ENV !== "production" && params.demo === "1";
  const sessionId = params.session_id?.trim();
  const numericJobId = Number(params.jobId);
  const hasValidJobId = Number.isInteger(numericJobId) && numericJobId > 0;
  const isVerified = isDemo ? false : await hasCompletedPayment({
    jobId: hasValidJobId ? numericJobId : null,
    sessionId,
    tier: params.tier,
  });
  const title = isVerified ? "Platba je potvrdená" : "Platbu overujeme";
  const message = isDemo
    ? "Demo režim: presmerovanie platby funguje, ale reálne zvýraznenie sa nezapísalo."
    : isVerified
      ? "Platba prebehla úspešne a zvýraznenie je pripravené."
      : "Ak ste platbu dokončili, zvýraznenie sa aktivuje po spracovaní platby cez Stripe webhook.";

  return (
    <main className="min-h-screen bg-[#f4f6f1] px-4 py-10">
      <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {message}
        </p>
        <p className="mt-3 text-xs font-medium text-slate-500">Balík: {params.tier ?? "nezadaný"}</p>
        <Button asChild className="mt-6">
          <Link href="/ucet/moje-platby">Späť na platby</Link>
        </Button>
      </div>
    </main>
  );
}

async function hasCompletedPayment({
  jobId,
  sessionId,
  tier,
}: {
  jobId: number | null;
  sessionId: string | undefined;
  tier: string | undefined;
}) {
  if (!jobId || !sessionId || (tier !== "top" && tier !== "exclusive")) {
    return false;
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: payment } = await supabase
    .from("payments")
    .select("id")
    .eq("stripe_session_id", sessionId)
    .eq("status", "completed")
    .eq("portal_code", siteConfig.portalCode)
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .eq("tier", tier)
    .maybeSingle();

  return Boolean(payment);
}
