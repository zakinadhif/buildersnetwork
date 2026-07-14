/**
 * A single-line UI label — an interest, a skill, a lifecycle stage (#92). The
 * mockup's tag, now the only one: the app's chips were larger and squarer, and
 * they are this now.
 */
export function Tag({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span className={accent ? "ui-tag ui-tag-accent" : "ui-tag"}>{label}</span>
  );
}
