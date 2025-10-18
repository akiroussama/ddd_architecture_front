"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"

import type { NavItem } from "./main-nav"

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          aria-label="Ouvrir la navigation"
          size="icon"
          variant="outline"
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="border-b border-slate-200 bg-slate-50 px-6 py-4 text-left">
          <SheetTitle className="text-base font-semibold text-slate-900">
            GeberGuard PLM
          </SheetTitle>
          <p className="text-xs text-slate-500">Module INCI / Substance</p>
        </SheetHeader>
        <div className="space-y-1 px-4 py-4">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname?.startsWith(item.href) && item.href !== "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <div>{item.label}</div>
                {item.description ? (
                  <p className="text-xs text-slate-500">{item.description}</p>
                ) : null}
              </Link>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
