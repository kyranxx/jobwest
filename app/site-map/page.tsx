import type { Metadata } from "next";
import sitemap from "../sitemap";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mapa stránky | JobWest",
  description: "Prehľad verejných stránok, krajín a pracovných ponúk na JobWest.",
};

function labelForUrl(url: string) {
  const path = new URL(url).pathname;

  if (path === "/") {
    return "Domov";
  }

  return path
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/-/g, " "))
    .join(" / ");
}

export default async function HtmlSitemapPage() {
  const entries = await sitemap();
  const uniqueEntries = Array.from(new Map(entries.map((entry) => [entry.url, entry])).values());

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 md:px-6 md:py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">JobWest</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#241033] md:text-4xl">
        Mapa stránky
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        Verejný zoznam hlavných stránok, krajín a pracovných ponúk dostupných pre uchádzačov a vyhľadávače.
      </p>

      <ol className="mt-10 grid gap-3 sm:grid-cols-2" role="list">
        {uniqueEntries.map((entry) => (
          <li key={entry.url}>
            <a
              href={entry.url}
              className="block rounded-md border border-[#e4dfd8] bg-white px-4 py-3 text-sm font-semibold text-[#241033] transition hover:border-primary hover:text-primary"
            >
              {labelForUrl(entry.url)}
            </a>
          </li>
        ))}
      </ol>
    </main>
  );
}
