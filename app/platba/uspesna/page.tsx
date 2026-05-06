import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; demo?: string }>;
}) {
  const params = await searchParams;
  const isDemo = params.demo === "1";

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">Platba prebehla úspešne</h1>
      <p className="mt-3 text-slate-600">
        {isDemo
          ? "Demo režim: Stripe kľúč nie je nastavený, preto bola platba iba nasimulovaná."
          : "Stripe platba bola dokončená."}
      </p>
      <p className="mt-2 text-sm text-slate-500">Balík: {params.tier ?? "neznámy"}</p>
      <Button asChild className="mt-6">
        <Link href="/ucet/moje-platby">Späť na platby</Link>
      </Button>
    </main>
  );
}
