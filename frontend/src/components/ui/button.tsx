import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          // Variant styles following PSA color palette
          {
            "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500": variant === "primary",
            "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-500": variant === "secondary", 
            "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-slate-500": variant === "outline",
            "text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-500": variant === "ghost"
          },
          // Size styles following PSA spacing system
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 text-base": size === "md", 
            "h-12 px-6 text-lg": size === "lg"
          },
          // Standard border radius
          "rounded-md",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button } 