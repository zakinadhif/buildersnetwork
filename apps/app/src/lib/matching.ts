import type { Member, MemberMatch } from "@myapp/api-client-react";

/**
 * Ground the LLM's match output against the real member directory.
 *
 * The model returns `{ memberId, reason }` entries and can hallucinate IDs that
 * aren't in the community. We join each entry to the actual member and drop any
 * whose `memberId` didn't resolve — so a hallucinated ID can never reach the UI
 * or be persisted (FR-8, AI-3). Pure + import-light so it's unit-testable.
 */
export function groundMatches(
  parsed: { memberId: string; reason: string }[],
  members: Member[],
): MemberMatch[] {
  const memberMap = new Map(members.map((m) => [m.id, m]));
  return parsed
    .map((x) => ({ ...memberMap.get(x.memberId), reason: x.reason }))
    .filter((x): x is MemberMatch => (x as Partial<Member>).id != null);
}
