import type {
  FeedItem,
  FeedPostItem,
  KaryaListItem,
} from "@myapp/api-client-react";

export type MemberProfileState = "loading" | "error" | "not-found" | "ready";

export function memberProfileState({
  loading,
  failed,
  errorStatus,
  hasData,
}: {
  loading: boolean;
  failed: boolean;
  errorStatus?: number;
  hasData: boolean;
}): MemberProfileState {
  if (loading) return "loading";
  if (failed) return errorStatus === 404 ? "not-found" : "error";
  return hasData ? "ready" : "not-found";
}

export function memberProjects(
  karya: KaryaListItem[],
  memberId: string,
): KaryaListItem[] {
  return karya.filter((project) =>
    project.roster.some((member) => member.id === memberId),
  );
}

export function memberUpdates(
  items: FeedItem[],
  memberId: string,
): FeedPostItem[] {
  return items.filter(
    (item): item is FeedPostItem =>
      item.type === "post" && item.author.id === memberId,
  );
}
