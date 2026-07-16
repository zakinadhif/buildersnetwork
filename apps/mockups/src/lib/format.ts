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

/** Minute-grain recency. A live discussion burst is measured in minutes, where
 *  `relativeTime`'s hour grain would flatten every one of them to "baru saja".
 *
 *  `compact` drops the trailing "lalu" for tight slots — a timestamp sitting
 *  beside a name reads as the past without being told. */
export function relativeMinutes(minutesAgo: number, compact = false): string {
  if (minutesAgo < 1) return compact ? "baru" : "barusan";
  return compact ? `${minutesAgo} mnt` : `${minutesAgo} mnt lalu`;
}
