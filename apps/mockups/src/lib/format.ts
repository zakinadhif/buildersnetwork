/** Formatting helpers shared by every mockup screen.
 *
 *  `initials` and `avatarColor` used to live here too; they moved into
 *  @myapp/ui with the Avatar they serve (#92), so there is one of each. */

export function relativeTime(hoursAgo: number): string {
  if (hoursAgo < 1) return "baru saja";
  if (hoursAgo < 24) return `${hoursAgo} jam lalu`;
  const days = Math.round(hoursAgo / 24);
  return days === 1 ? "kemarin" : `${days} hari lalu`;
}
