import * as React from "react";
import { cn } from "../lib/cn";

export type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement>;

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-9 w-full rounded-card border border-line bg-surface px-3 py-2 font-body text-body leading-compact text-ink outline-none transition-colors placeholder:text-ink3 focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
TextField.displayName = "TextField";

export { TextField as Input };
