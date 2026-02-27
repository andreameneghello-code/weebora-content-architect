import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-[#E4E0F0] bg-white px-3 py-2 text-sm text-[#1A1530] shadow-sm transition-colors placeholder:text-[#9E9BAC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A2895]/30 focus-visible:border-[#3A2895] disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
