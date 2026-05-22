import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"

const siteUrl = siteConfig.url

export const metadata: Metadata = {
  title: "Ochrana súkromia",
  description: "Informácie o spracúvaní osobných údajov na portáli JobWest.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "/ochrana-sukromia",
  },
}

export default function PrivacyPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Ochrana súkromia",
    url: `${siteUrl}/ochrana-sukromia`,
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
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Ochrana súkromia</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Táto stránka vysvetľuje, aké údaje JobWest používa pri prevádzke portálu, používateľských
        účtov, pracovných inzerátov a platieb za zvýraznenie.
      </p>

      <div className="mt-8 space-y-7 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-base font-semibold text-slate-950">Prevádzkovateľ</h2>
          <p className="mt-2">JobWest, Slovensko, {siteConfig.contactEmail}.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-950">Údaje z účtu</h2>
          <p className="mt-2">
            Pri registrácii a prihlásení spracúvame e-mail, identifikátor používateľa a základné
            profilové údaje potrebné na správu účtu.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-950">Údaje z inzerátov</h2>
          <p className="mt-2">
            Pri pridaní inzerátu spracúvame názov pracovnej ponuky, firmu, krajinu, lokalitu,
            mzdu, typ spolupráce, popis a kontaktné informácie uvedené v inzeráte.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-950">Platby</h2>
          <p className="mt-2">
            Platby za zvýraznenie spracúva Stripe. JobWest uchováva iba technické údaje potrebné
            na priradenie platby k používateľovi a inzerátu.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-950">Uchovávanie údajov</h2>
          <p className="mt-2">
            Údaje uchovávame iba počas používania účtu, trvania inzerátu alebo po dobu potrebnú
            na splnenie právnych a účtovných povinností. Staré alebo testovacie inzeráty môžeme
            odstrániť, aby portál ostal presný a bezpečný pre uchádzačov.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-950">Práva používateľa</h2>
          <p className="mt-2">
            Používateľ môže požiadať o prístup k údajom, opravu nesprávnych údajov, výmaz účtu,
            obmedzenie spracúvania alebo vysvetlenie, ako sa údaje používajú pri správe ponúk.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-950">Kontakt</h2>
          <p className="mt-2">
            Žiadosť o prístup, opravu alebo vymazanie údajov pošlite na {siteConfig.contactEmail}.
          </p>
        </section>
      </div>
    </main>
  )
}
