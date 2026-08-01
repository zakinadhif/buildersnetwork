import type { ReactNode } from "react";
import { cn, Eyebrow } from "@myapp/ui";

export type PreviewOption<T extends string> = {
  value: T;
  label: string;
};

export function PreviewStates<T extends string>({
  label = "Preview state",
  value,
  options,
  onChange,
  className,
  children,
}: {
  label?: string;
  value: T;
  options: readonly PreviewOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "fixed right-5 top-5 z-50 w-[260px] rounded-panel border border-line bg-surface/95 p-3 shadow-[0_10px_35px_rgba(17,17,15,0.12)] backdrop-blur-sm max-[700px]:right-3 max-[700px]:top-3 max-[700px]:w-[230px]",
        className,
      )}
    >
      <Eyebrow as="div" className="mb-2">
        {label}
      </Eyebrow>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={cn(
                "cursor-pointer rounded-full border px-2.5 py-1 font-body text-micro",
                active
                  ? "border-ink bg-ink font-medium text-bg"
                  : "border-line bg-transparent font-normal text-ink2",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {children && <div className="mt-3 border-t border-line pt-3">{children}</div>}
    </div>
  );
}
