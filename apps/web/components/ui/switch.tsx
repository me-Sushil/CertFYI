"use client"

import { Switch } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

function SwitchComponent({ className, ...props }: React.ComponentProps<typeof Switch.Root>) {
  return (
    <Switch.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.375rem] w-[2.375rem] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-input transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary",
        className,
      )}
      {...props}
    >
      <Switch.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-[0.875rem] rounded-full bg-background shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-[1rem] data-[state=unchecked]:translate-x-0",
        )}
      />
    </Switch.Root>
  )
}

export { SwitchComponent as Switch }
