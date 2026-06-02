import assert from "node:assert/strict"
import { getBreadcrumbStructuredData } from "@/lib/breadcrumbs"

assert.deepEqual(
  getBreadcrumbStructuredData("https://jobwest.sk", [
    { label: "Domov", href: "/" },
    { label: "Ponuky", href: "/ponuky" },
    { label: "Zvárač", href: "/ponuky/1-zvarac" },
  ]),
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Domov",
        item: "https://jobwest.sk/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Ponuky",
        item: "https://jobwest.sk/ponuky",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Zvárač",
        item: "https://jobwest.sk/ponuky/1-zvarac",
      },
    ],
  },
)
