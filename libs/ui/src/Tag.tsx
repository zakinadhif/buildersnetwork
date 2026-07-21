import { Badge } from "./primitives";

/**
 * A single-line UI label — an interest, a skill, a lifecycle stage (#92).
 * Wraps shadcn's Badge with legacy props support.
 */
export function Tag({ label, accent, className }: { label: string; accent?: boolean; className?: string }) {
  return <Badge variant={accent ? "accent" : "outline"} className={className}>{label}</Badge>;
}
