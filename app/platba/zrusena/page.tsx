import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-[#f4f6f1] px-4 py-10">
      <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">Platba bola zrušená</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Nič sa nestrhlo. Zvýraznenie môžete spustiť znova.</p>
        <Button asChild className="mt-6">
          <Link href="/ucet/moje-platby">Späť na platby</Link>
        </Button>
      </div>
    </main>
  );
}
