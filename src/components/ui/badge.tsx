import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        online: "border-transparent bg-emerald-500 text-white shadow-sm hover:bg-emerald-600",
        degraded: "border-transparent bg-amber-500 text-white shadow-sm hover:bg-amber-600",
        offline: "border-transparent bg-slate-500 text-white shadow-sm hover:bg-slate-600",
        get: "border-transparent bg-blue-500 text-white shadow-sm hover:bg-blue-600",
        post: "border-transparent bg-emerald-500 text-white shadow-sm hover:bg-emerald-600",
        put: "border-transparent bg-amber-500 text-white shadow-sm hover:bg-amber-600",
        patch: "border-transparent bg-purple-500 text-white shadow-sm hover:bg-purple-600",
        delete: "border-transparent bg-rose-500 text-white shadow-sm hover:bg-rose-600",
        primary: "border-transparent bg-blue-500 text-white shadow-sm hover:bg-blue-600",
        replica: "border-transparent bg-purple-500 text-white shadow-sm hover:bg-purple-600",
        edge: "border-transparent bg-cyan-500 text-white shadow-sm hover:bg-cyan-600",
        cdn: "border-transparent bg-orange-500 text-white shadow-sm hover:bg-orange-600",
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
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
