import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:pointer-events-none disabled:text-gray-500 disabled:bg-gray-800 disabled:border-gray-700 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-cyan-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:bg-cyan-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:scale-105 border border-cyan-500/50",
        destructive: "bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:bg-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] border border-red-500/50",
        outline:
          "border border-cyan-500/30 bg-black/20 backdrop-blur-xl text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.05)] hover:bg-cyan-500/10 hover:text-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]",
        secondary: "bg-slate-600 text-slate-100 shadow-[0_0_20px_rgba(71,85,105,0.1)] hover:bg-slate-500 hover:shadow-[0_0_30px_rgba(71,85,105,0.15)] border border-slate-500/50",
        ghost: "text-cyan-100 hover:bg-cyan-500/10 hover:text-cyan-400",
        link: "text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
