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
      <div className="bn-head">
        <h1 className="bn-title">{title}</h1>
        <span className="bn-title-sub">segera hadir</span>
      </div>
      <p className="bn-soon">{sub}</p>
    </>
  );
}
