import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"

const siteUrl = siteConfig.url

export const metadata: Metadata = {
  title: "Obchodné podmienky",
  description: "Obchodné podmienky používania portálu JobWest.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "/obchodne-podmienky",
  },
}

export default function TermsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Obchodné podmienky",
    url: `${siteUrl}/obchodne-podmienky`,
    inLanguage: "sk-SK",
    isPartOf: {
      "@type": "WebSite",
      name: "JobWest",
      url: siteUrl,
    },
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Obchodné podmienky</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Tieto podmienky upravujú používanie inzertného portálu JobWest, pridávanie pracovných
        inzerátov a objednávanie plateného zvýraznenia inzerátov.
      </p>

      <div className="mt-8 space-y-7 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-base font-semibold text-slate-950">Prevádzkovateľ</h2>
          <p className="mt-2">JobWest, Slovensko, {siteConfig.contactEmail}.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-950">Charakter služby</h2>
          <p className="mt-2">
            JobWest je inzertný portál. JobWest nezabezpečuje sprostredkovanie zamestnania,
            výber uchádzačov, pracovnú zmluvu, ubytovanie, dopravu ani nástup do práce.
          </p>
          <p className="mt-2">
            Uchádzači môžu prehliadať zverejnené pracovné ponuky bez poplatku. Firmy,
            zamestnávatelia a agentúry zodpovedajú za pravdivosť, úplnosť, aktuálnosť a zákonnosť
            inzerátov, ktoré pridajú.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-950">Zvýraznenie inzerátu</h2>
          <p className="mt-2">
            Pridanie inzerátu je bezplatné. TOP a Exclusive zvýraznenie sú platené služby, ktoré
            zvyšujú viditeľnosť inzerátu v zozname ponúk.
          </p>
          <p className="mt-2">
            Cena, doba zvýraznenia a názov balíka sú zobrazené pred odoslaním platby. Zvýraznenie
            neznamená garanciu prijatia uchádzača ani garanciu poradia mimo pravidiel služby.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-950">Zodpovednosť zamestnávateľa</h2>
          <p className="mt-2">
            Zamestnávateľ musí uvádzať pravdivú mzdu, krajinu, lokalitu, typ spolupráce, informáciu
            o ubytovaní a kontaktné údaje. Pri zmene obsadenosti alebo podmienok má inzerát upraviť
            alebo stiahnuť, aby uchádzači pracovali s aktuálnymi informáciami.
          </p>
          <p className="mt-2">
            Ak zadávateľ ponuky vykonáva činnosť, ktorá vyžaduje oprávnenie, registráciu alebo
            osobitné povinnosti, zodpovedá za ich splnenie on.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-950">Zakázaný obsah</h2>
          <p className="mt-2">
            Nie je povolené zverejňovať testovacie, zavádzajúce, duplicitné, diskriminačné alebo
            nelegálne ponuky. JobWest si vyhradzuje právo takýto obsah odstrániť.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-950">Kontakt</h2>
          <p className="mt-2">
            Otázky k podmienkam alebo službám pošlite na {siteConfig.contactEmail}.
          </p>
        </section>
      </div>
    </main>
  )
}
