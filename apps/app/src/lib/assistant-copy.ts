// Intro copy for the onboarding/assistant chat (issue #8). Kept out of the
// AssistantChat component file so that module only exports a component (React
// Fast Refresh requires component-only modules).

/** Intro for a brand-new member (standalone `/onboarding` flow). */
export const INTRO_NEW =
  "hei — selamat datang di al-fath berkarya. aku mau kenalan dulu — abis itu kita nyusun profil kamu bareng.\n\nsiapa nama kamu?";

/** Intro when enriching an existing profile (in-shell `/assistant` tab). */
export function introForMember(name: string): string {
  const first = (name || "").split(" ")[0] || "kamu";
  return `hei ${first} — mau bantu ngerapiin atau nambahin ke profil kamu.\n\nada yang lagi kamu garap atau pengen kamu tambahin?`;
}
