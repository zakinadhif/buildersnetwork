import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-micro",
        "text-caption",
        "text-ui",
        "text-body",
        "text-stat",
        "text-title",
        "text-feature",
        "text-display",
      ],
      "text-color": [
        "text-bg",
        "text-ink",
        "text-ink2",
        "text-ink3",
        "text-accent",
        "text-accent-mid",
        "text-accent-fg",
        "text-accent-tint",
        "text-accent-line",
        "text-line",
        "text-line-dark",
        "text-surface",
        "text-bg-hover",
        "text-danger",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
