"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-sm font-semibold leading-4 tracking-tight select-none text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Label }
