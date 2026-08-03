import { Eyebrow } from "@myapp/ui";
import type { ReactNode } from "react";

export function EntryLayout({
  eyebrow,
  title,
  description,
  children,
  wide = false,
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="min-h-screen bg-bg px-6 py-12 font-body text-ink sm:flex sm:items-center sm:justify-center">
      <section
        className={wide ? "w-full max-w-[720px]" : "w-full max-w-[396px]"}
      >
        <Eyebrow as="div" className="mb-3.5">
          {eyebrow}
        </Eyebrow>
        <h1 className="mb-2.5 mt-0 font-display text-feature font-light leading-heading tracking-heading">
          {title}
        </h1>
        <p className="mb-8 mt-0 max-w-[600px] text-body leading-body text-ink2">
          {description}
        </p>
        {children}
      </section>
    </main>
  );
}

export function EntryAlert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="mb-5 rounded-card border border-accent-line bg-accent-tint px-3.5 py-3 text-ui leading-body text-accent"
    >
      {children}
    </div>
  );
}
