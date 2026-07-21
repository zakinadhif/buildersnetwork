import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-card font-body text-ui font-medium leading-compact transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:bg-accent-mid disabled:bg-line disabled:text-ink3 disabled:opacity-100",
        secondary: "border border-line bg-surface text-ink hover:bg-bg-hover",
        outline: "border border-line bg-transparent hover:bg-bg-hover text-ink",
        ghost: "bg-transparent text-ink2 hover:text-ink",
        danger: "bg-transparent text-danger hover:bg-bg-hover",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-9 px-4",
        lg: "h-10 px-5 text-body",
        icon: "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
