"use client"

import * as React from "react"

import { cn } from "@/shared/lib/utils"

type Section = {
  id: string
  label: string
  description?: string
}

const DEFAULT_SECTIONS: Section[] = [
  { id: "overview", label: "Aperçu" },
  { id: "general", label: "Général" },
  { id: "composition", label: "Composition & Spécifications" },
  { id: "cas", label: "CAS / EINECS" },
  { id: "documents", label: "Documents & Certifs" },
  { id: "notes", label: "Notes & Historique" },
]

const SHORTCUTS: Record<string, string> = {
  g: "general",
  c: "composition",
  d: "documents",
  t: "cas",
}

export type RMSectionNavProps = {
  sections?: Section[]
  className?: string
  rightRail?: React.ReactNode
}

export function RMSectionNav({
  sections = DEFAULT_SECTIONS,
  className,
  rightRail,
}: RMSectionNavProps) {
  const [activeId, setActiveId] = React.useState<string>(sections[0]?.id ?? "")

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: "-50% 0px -30% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    )

    sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [sections])

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA"].includes(event.target.tagName)
      ) {
        return
      }

      const key = SHORTCUTS[event.key.toLowerCase()]
      if (key) {
        const element = document.getElementById(key)
        if (element) {
          event.preventDefault()
          element.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <aside
      className={cn(
        "sticky top-[88px] hidden h-[calc(100vh-120px)] w-[240px] flex-none flex-col justify-between lg:flex",
        className
      )}
      aria-label="Navigation des sections matière première"
    >
      <nav className="space-y-1">
        {sections.map((section) => {
          const isActive = section.id === activeId
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => handleClick(section.id)}
              className={cn(
                "w-full rounded-md px-3 py-2 text-left text-sm font-medium transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? "bg-muted text-foreground" : "text-muted-foreground"
              )}
              aria-current={isActive ? "true" : undefined}
            >
              <span>{section.label}</span>
              {section.description ? (
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                  {section.description}
                </span>
              ) : null}
            </button>
          )
        })}
      </nav>

      {rightRail ? (
        <div className="hidden xl:block">{rightRail}</div>
      ) : null}
    </aside>
  )
}

export const RM_SECTION_ANCHORS = DEFAULT_SECTIONS
