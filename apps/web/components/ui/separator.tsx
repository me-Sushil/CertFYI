"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type SeparatorProps = React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  const semanticProps = decorative ? { role: "none" } : { role: "separator", "aria-orientation": orientation }
  return (
    <div
      data-slot="separator"
      {...semanticProps}
      className={cn(
        "shrink-0 bg-border/15",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
