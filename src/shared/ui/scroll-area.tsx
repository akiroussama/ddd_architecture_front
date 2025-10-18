import * as React from "react"

import { cn } from "@/shared/lib/utils"

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  viewportClassName?: string
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, viewportClassName, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative h-full w-full overflow-hidden", className)} {...props}>
        <div className={cn("h-full w-full overflow-y-auto", viewportClassName)}>{children}</div>
      </div>
    )
  }
)

ScrollArea.displayName = "ScrollArea"
