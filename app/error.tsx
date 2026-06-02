"use client"

import { Button } from "@/components/ui/button"

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold text-slate-950">Niečo sa nepodarilo</h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
        Skúste stránku načítať znova. Ak problém pretrváva, vráťte sa neskôr.
      </p>
      <Button type="button" className="mt-6" onClick={reset}>
        Skúsiť znova
      </Button>
    </main>
  )
}
