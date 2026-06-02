import Link from "next/link"
import type { BreadcrumbItem } from "@/lib/breadcrumbs"

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Omrvinková navigácia" className="mb-4 text-xs text-slate-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1

          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {index > 0 && <span aria-hidden="true">/</span>}
              {isCurrent ? (
                <span aria-current="page" className="text-slate-700">{item.label}</span>
              ) : (
                <Link href={item.href} prefetch={false} className="transition hover:text-primary">
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
