import type { Member } from "./members";

export async function fetchMe(): Promise<Member | null> {
  const res = await fetch("/api/me", { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

export async function saveProfile(
  profile: Omit<Member, "id" | "reason">,
): Promise<void> {
  await fetch("/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
    credentials: "include",
  });
}

export async function saveMatches(
  matches: { memberId: string; reason: string }[],
): Promise<void> {
  await fetch("/api/matches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matches }),
    credentials: "include",
  });
}

export async function fetchMembers(): Promise<Member[]> {
  const res = await fetch("/api/members");
  if (!res.ok) return [];
  return res.json();
}

export async function fetchMember(id: string): Promise<Member | null> {
  const res = await fetch(`/api/members/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMatches(): Promise<Member[]> {
  const res = await fetch("/api/matches", { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

export async function sendOtp(email: string): Promise<void> {
  const res = await fetch("/api/otp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? "Gagal mengirim kode.");
  }
}

export async function verifyOtp(email: string, code: string): Promise<void> {
  const res = await fetch("/api/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? "Kode tidak valid.");
  }
}
