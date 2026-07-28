"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type SwitchProps = Omit<React.ComponentProps<"button">, "onChange"> & {
  checked?: boolean
  onChange?: (checked: boolean) => void
}

function Switch({ className, checked, onChange, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-[var(--ease-premium)] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-accent" : "bg-muted",
        className
      )}
      {...props}
    >
      <span
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-card shadow-lg ring-0 transition-transform duration-200 ease-[var(--ease-premium)]",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
}

export { Switch }
