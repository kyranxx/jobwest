import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-950">Stránka sa nenašla</h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
        Odkaz už nemusí byť aktuálny. Pokračujte na zoznam pracovných ponúk.
      </p>
      <Button asChild className="mt-6">
        <Link href="/ponuky">Zobraziť ponuky</Link>
      </Button>
    </main>
  )
}
