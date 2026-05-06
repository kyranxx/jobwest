import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">Platba bola zrušená</h1>
      <p className="mt-3 text-slate-600">Nič sa nestrhlo. Môžete to skúsiť znova.</p>
      <Button asChild className="mt-6">
        <Link href="/ucet/moje-platby">Späť na platby</Link>
      </Button>
    </main>
  );
}
