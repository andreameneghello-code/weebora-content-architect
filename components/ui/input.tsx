import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-xl border border-[#E4E0F0] bg-white px-3 py-1 text-sm text-[#1A1530] shadow-sm transition-colors placeholder:text-[#9E9BAC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A2895]/30 focus-visible:border-[#3A2895] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F5F4FA]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
