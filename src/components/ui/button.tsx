import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-primary-foreground shadow hover:bg-primary/90": variant === "default",
            "border border-border bg-background hover:bg-muted hover:text-foreground": variant === "outline",
            "hover:bg-muted hover:text-foreground": variant === "ghost",
            "bg-red-500 text-white shadow-sm hover:bg-red-500/90": variant === "danger",
            "bg-muted text-muted-foreground hover:bg-muted/80": variant === "secondary",
            "h-10 px-4 py-2": size === "default",
            "h-8 rounded-xl px-3 text-xs": size === "sm",
            "h-12 rounded-3xl px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
