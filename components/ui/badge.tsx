import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors border",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-[#3A2895] text-white",
        secondary:   "border-transparent bg-[#EEE9FF] text-[#3A2895]",
        destructive: "border-transparent bg-[#FFEDED] text-[#D94F4F]",
        outline:     "border-[#E4E0F0] text-[#6B6882] bg-white",
        success:     "border-transparent bg-[#E6F9F8] text-[#2AABA3]",
        warning:     "border-transparent bg-[#FFF6E6] text-[#C47D00]",
        academy:     "border-transparent bg-[#F0EBFF] text-[#5B3FBF]",
        holiday:     "border-transparent bg-[#E6F9F8] text-[#1FA89E]",
        tournament:  "border-transparent bg-[#FFF1E6] text-[#C4660A]",
        group_trip:  "border-transparent bg-[#E6F9F2] text-[#1A9A6B]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
