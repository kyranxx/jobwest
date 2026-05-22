import Link from "next/link";
import { Button } from "@/components/ui/button";
import { paymentTiers } from "@/lib/payments";

export default function MyPayments() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Platby</h1>
        <p className="mt-1 text-sm text-slate-600">
          Zvýraznite ponuku a zvýšte jej viditeľnosť v zozname.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-950">Zvýraznenie</h2>
        <p className="mb-4 mt-1 text-sm leading-6 text-slate-600">
          Zvýraznenie sa spúšťa pri konkrétnom inzeráte, aby sa platba správne priradila
          k firme, ponuke a admin reportingu.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[paymentTiers.top, paymentTiers.exclusive].map((tier) => (
            <div key={tier.name} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">{tier.label}</p>
              <p className="mt-1 text-sm text-slate-600">{tier.description}</p>
            </div>
          ))}
        </div>
        <Button asChild className="mt-4">
          <Link href="/ucet/moje-inzeraty">Vybrať inzerát na zvýraznenie</Link>
        </Button>
      </div>

      <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-900">
        Pridanie inzerátu je zdarma. Platíte iba za zvýraznenie.
      </div>
    </div>
  );
}
