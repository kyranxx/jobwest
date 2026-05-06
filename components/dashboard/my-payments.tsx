import { HighlightActions } from "@/components/payments/highlight-actions";

export default function MyPayments() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Moje platby</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Testovacie platby pre zvýraznenie inzerátov. Bez Stripe kľúča sa použije demo režim.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <h2 className="font-semibold">Zvýraznenie inzerátu</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">TOP</span> posúva ponuku vyššie.{" "}
          <span className="font-medium text-foreground">Exclusive</span> je úplne najvyšší tier.
        </p>
        <HighlightActions />
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p><span className="font-medium text-foreground">Pridanie inzerátu</span> je <span className="text-emerald-600 font-medium">zadarmo</span>.</p>
        <p className="mt-0.5">TOP a Exclusive zvýraznenia sú platené. Pripravený budúci poplatok za inzerát: 1,99&nbsp;EUR.</p>
      </div>
    </div>
  );
}
