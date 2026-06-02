export type BreadcrumbItem = {
  label: string
  href: string
}

export function getBreadcrumbStructuredData(siteUrl: string, items: BreadcrumbItem[]) {
  const baseUrl = `${siteUrl.replace(/\/+$/, "")}/`

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: new URL(item.href, baseUrl).toString(),
    })),
  }
}
