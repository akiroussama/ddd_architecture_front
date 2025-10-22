"use client"

import * as React from "react"
import { X, Minus } from "lucide-react"

import type { ParsedToken } from "@/lib/rm-search"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip"
import { cn } from "@/shared/lib/utils"

type RMQueryPillsProps = {
  tokens: ParsedToken[]
  onRemoveToken: (tokenId: string) => void
}

export function RMQueryPills({ tokens, onRemoveToken }: RMQueryPillsProps) {
  if (!tokens.length) {
    return null
  }

  return (
    <div className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2 text-sm sm:px-6">
        <TooltipProvider delayDuration={150}>
          {tokens.map((token) => (
            <Tooltip key={token.id}>
              <TooltipTrigger asChild>
                <Badge
                  variant={token.negated ? "destructive" : "secondary"}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    token.negated && "border-destructive/40 bg-destructive/10 text-destructive"
                  )}
                >
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    {token.negated ? <Minus className="h-3 w-3" /> : null}
                    {token.type === "field" && token.field ? (
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {token.field}
                      </span>
                    ) : (
                      <span className="text-xs uppercase tracking-wide">Terme</span>
                    )}
                  </span>
                  <span className="max-w-[180px] truncate text-[11px] font-medium sm:max-w-[220px]">
                    {token.value}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 rounded-full p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => onRemoveToken(token.id)}
                    aria-label={`Retirer le filtre ${token.value}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-sm">
                {token.negated ? "Exclure :" : "Filtre :"} {token.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  )
}
