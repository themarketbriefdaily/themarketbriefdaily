import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-[.1em]",
  {
    variants: {
      variant: {
        default: "border-line bg-bg-alt text-muted",
        gold: "border-warm/30 bg-warm/10 text-[#8a6d2f]",
        pos: "border-pos/20 bg-pos/10 text-pos",
        neg: "border-neg/20 bg-neg/10 text-neg",
        live: "border-line text-muted",
        dark: "border-white/20 bg-white/10 text-white",
      },
      size: {
        sm: "px-2.5 py-1 text-[10px]",
        md: "px-3 py-1.5 text-[11px]",
      },
    },
    defaultVariants: { variant: "default", size: "sm" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
