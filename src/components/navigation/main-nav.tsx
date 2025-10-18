"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export interface NavItem {
  href: string
  label: string
  description?: string
  badge?: string
}

export function MainNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Navigation principale" className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive =
          pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/")

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex flex-col rounded-md px-3 py-2 transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <span className="text-sm font-medium leading-5">{item.label}</span>
            {item.description ? (
              <span className="text-xs text-slate-500">{item.description}</span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
