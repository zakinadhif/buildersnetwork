import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "./lib/cn";

export type EyebrowProps<T extends ElementType = "p"> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;

/**
 * Shared component for short uppercase eyebrow / section labels.
 */
export function Eyebrow<T extends ElementType = "p">({
  as,
  className,
  ...props
}: EyebrowProps<T>) {
  const Component = as || "p";
  return (
    <Component
      className={cn(
        "text-micro font-medium tracking-eyebrow uppercase text-ink3 leading-compact",
        className,
      )}
      {...props}
    />
  );
}
