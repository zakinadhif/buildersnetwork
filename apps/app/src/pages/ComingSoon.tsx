/**
 * An honestly-signposted placeholder for rail destinations that have no backing
 * endpoint yet (Jelajahi Karya, Karya Saya). Reachable from the rail, but
 * plainly "segera hadir" — never present-but-hollow (see build-workflow.md, the
 * Dark-launch failure mode). These graduate to real surfaces in later work.
 */
export default function ComingSoon({
  title,
  sub,
}: {
  title: string;
  sub: string;
}) {
  return (
    <>
      <div className="flex items-baseline gap-2.5 mb-6">
        <h1 className="m-0 font-display text-display font-normal tracking-heading text-ink">
          {title}
        </h1>
        <span className="font-body text-caption text-ink3">segera hadir</span>
      </div>
      <p className="py-12 font-mono text-body text-ink3 leading-body">{sub}</p>
    </>
  );
}
