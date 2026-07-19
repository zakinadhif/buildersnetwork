import { cva } from "class-variance-authority";

const tag = cva(
  "inline-block whitespace-nowrap rounded-[3px] border px-[7px] py-px font-body text-micro leading-compact tracking-tag",
  {
    variants: {
      accent: {
        false: "border-line bg-transparent text-ink2",
        true: "border-accent bg-accent-tint text-accent",
      },
    },
    defaultVariants: {
      accent: false,
    },
  },
);

/**
 * A single-line UI label — an interest, a skill, a lifecycle stage (#92). The
 * mockup's tag, now the only one: the app's chips were larger and squarer, and
 * they are this now.
 */
export function Tag({ label, accent }: { label: string; accent?: boolean }) {
  return <span className={tag({ accent })}>{label}</span>;
}
