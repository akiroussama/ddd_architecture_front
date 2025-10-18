"use client"

import * as React from "react"

import { cn } from "@/shared/lib/utils"

type AccordionContextValue = string[]
const AccordionContext = React.createContext<AccordionContextValue>([])

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string[]
}

const Accordion = ({ defaultValue = [], className, ...props }: AccordionProps) => (
  <AccordionContext.Provider value={defaultValue}>
    <div className={cn("space-y-2", className)} {...props} />
  </AccordionContext.Provider>
)

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

interface AccordionItemContextValue {
  open: boolean
  toggle: () => void
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null)

const AccordionItem = ({ value, className, children, ...props }: AccordionItemProps) => {
  const defaults = React.useContext(AccordionContext)
  const [open, setOpen] = React.useState(defaults.includes(value))

  const toggle = React.useCallback(() => setOpen((previous) => !previous), [])

  return (
    <AccordionItemContext.Provider value={{ open, toggle }}>
      <div
        data-state={open ? "open" : "closed"}
        className={cn(
          "rounded-lg border border-slate-200 bg-white shadow-sm transition",
          open ? "shadow-md" : "shadow-none",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(AccordionItemContext)
    if (!context) {
      throw new Error("AccordionTrigger must be used within AccordionItem")
    }
    const { open, toggle } = context

    return (
      <button
        ref={ref}
        type="button"
        onClick={toggle}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50",
          className
        )}
        aria-expanded={open}
        {...props}
      >
        {children}
        <svg
          aria-hidden
          className={cn("h-4 w-4 shrink-0 text-slate-500 transition-transform", open && "rotate-180")}
          viewBox="0 0 24 24"
          focusable="false"
        >
          <path d="M12 15.5 5 8.5l1.4-1.4L12 12.7l5.6-5.6L19 8.5z" fill="currentColor" />
        </svg>
      </button>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(AccordionItemContext)
    if (!context) {
      throw new Error("AccordionContent must be used within AccordionItem")
    }
    const { open } = context

    return (
      <div
        ref={ref}
        hidden={!open}
        className={cn("border-t border-slate-200 px-4 pb-4 pt-2 text-sm text-slate-600", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
