import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import {
  type AppNavigationState,
  isInternalAppPath,
} from "@/lib/navigation";

export interface PageHeaderProps {
  /** The destination used for a direct visit or refreshed page. */
  backTo?: string;
  title: string;
}

/**
 * Shared shell-level heading for a product surface. A secondary screen gets a
 * deterministic, in-app return path; primary screens simply omit `backTo`.
 */
export default function PageHeader({ backTo, title }: PageHeaderProps) {
  const [, navigate] = useLocation();
  const state =
    typeof window === "undefined"
      ? undefined
      : (window.history.state as AppNavigationState | null);
  const rememberedBack = isInternalAppPath(state?.back) ? state.back : undefined;
  const destination = rememberedBack ?? backTo;

  return (
    <header className="-mx-[var(--shell-gutter)] -mt-6 mb-6 flex h-[60px] items-center gap-3 border-b border-line px-[var(--shell-gutter)] max-[900px]:mx-0 max-[900px]:mt-0 max-[900px]:px-4">
      {destination && (
        <button
          type="button"
          aria-label={`Kembali dari ${title}`}
          onClick={() => navigate(destination)}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft size={17} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
      <h1 className="m-0 min-w-0 truncate font-display text-title font-normal text-ink">
        {title}
      </h1>
    </header>
  );
}
