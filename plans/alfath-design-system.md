# Al-Fath Design System Brief

Working name: **Raksa Minimal**.

This brief defines the visual direction for the Al-Fath Berkarya app. It should guide the next development pass for colors, typography, logo usage, UI states, and visual polish while preserving the product flow that already works.

## Product Context

Al-Fath Berkarya is a community platform for LDK Al-Fath Telkom University builder students. The app is not a marketing site; it is a focused member experience:

- Sign up and verify student email.
- Complete a conversational AI onboarding.
- Review and publish a profile.
- See recommended collaborators.
- Explore the member directory and profiles.

The current SPA already has a strong minimal interaction model. The redesign should keep that calm, intimate, chat-first feeling and layer Al-Fath identity into it.

## Visual Sources

Use these as the grounding references:

- Current app: quiet, minimal, warm background, narrow reading column, chat-like rhythm.
- LDK Al-Fath website: https://alfath-telkomuniversity.vercel.app/
- LDK Al-Fath Instagram screenshot provided in the design discussion.

Observed brand cues from the Al-Fath website:

- Primary brand colors: deep maroon, cream, olive green, soft olive.
- Fonts used by the reference website: El Messiri, Plus Jakarta Sans, Outfit, Kufam.
- Visual language: modern Islamic organization identity, soft patterned background, subtle glass panels, rounded tags, gradient accents.

Observed brand cues from Instagram:

- Logo can appear in a brighter red lockup.
- Brand presence is bold, friendly, and organizational.
- Supporting content often uses cream, maroon, and muted ornamental/patterned backgrounds.

## Design Direction

### Core Idea

The app should feel like:

> A calm digital majelis for builders: focused, warm, trustworthy, and quietly branded.

The visual direction should not feel like a generic startup dashboard. It should feel related to Al-Fath, but not as decorative as a landing page.

### Personality

- Warm, grounded, and thoughtful.
- Islamic-modern without becoming ornamental-heavy.
- Personal and conversational.
- Young builder community, but still organized and credible.
- Minimal by default, expressive only in brand moments.

### What To Preserve

- Narrow content column.
- Chat-first onboarding and discovery.
- Low visual noise.
- Generous spacing.
- Monochrome-ish reading comfort.
- Simple button and row behavior.

### What To Improve

- Replace generic brown accent with Al-Fath maroon.
- Add official brand colors and typography tokens.
- Use logo/brand lockup in key screens.
- Make empty/loading/auth states feel owned by Al-Fath.
- Improve hierarchy of headings and labels.
- Make focus, hover, and selected states more refined.

## Color System

### Primary Palette

| Token | Hex | Role |
|---|---:|---|
| `--brand-cream` | `#F6F3EB` | Main app background |
| `--brand-cream-2` | `#EFECE5` | Subtle raised surfaces |
| `--brand-line` | `#E5E2D8` | Borders and dividers |
| `--brand-maroon` | `#7F2020` | Primary action, links, focus |
| `--brand-maroon-dark` | `#5A1717` | Hover/action pressed, strong text |
| `--brand-red` | `#F63035` | Logo accent only, urgent highlights |
| `--brand-olive` | `#869B7E` | Secondary accent, calm states |
| `--brand-olive-soft` | `#C9CAAC` | Decorative/tint accent |
| `--ink` | `#1A1916` | Primary text |
| `--ink-muted` | `#6B6860` | Secondary text |
| `--ink-faint` | `#9B9890` | Labels/placeholders |

### Semantic Mapping

Use semantic names in CSS so the app can evolve without rewriting components:

```css
:root {
  --bg: #f6f3eb;
  --surface: #efece5;
  --surface-soft: rgba(255, 255, 255, 0.46);
  --ink: #1a1916;
  --ink2: #6b6860;
  --ink3: #9b9890;
  --accent: #7f2020;
  --accent-strong: #5a1717;
  --accent-soft: rgba(127, 32, 32, 0.08);
  --support: #869b7e;
  --support-soft: rgba(134, 155, 126, 0.14);
  --line: #e5e2d8;
}
```

### Usage Rules

- Use cream as the dominant background.
- Use maroon for primary action, focus, links, and progress.
- Use olive as a secondary accent, especially for supportive states and tags.
- Use bright logo red sparingly. It should not become the default button color.
- Avoid heavy maroon backgrounds in the main app except for special brand moments.
- Avoid one-note beige UI by balancing cream with ink, maroon, olive, and white/translucent surfaces.

### Accessibility Notes

- Maroon text on cream is acceptable for short labels/actions.
- Avoid olive text on cream for small text unless contrast is checked.
- Disabled text should remain readable, not too pale.
- Focus states must be visible: maroon bottom border, ring, or underline.

## Typography

### Font Stack

Use three levels:

```css
:root {
  --font: "Plus Jakarta Sans", sans-serif;
  --font-brand: "El Messiri", "Plus Jakarta Sans", sans-serif;
  --font-ui: "Outfit", "Plus Jakarta Sans", sans-serif;
  --mono: "IBM Plex Mono", monospace;
}
```

### Roles

- `Plus Jakarta Sans`: body text, forms, rows, buttons, most UI.
- `El Messiri`: brand moments, welcome heading, screen titles, nav brand.
- `Outfit`: optional for compact UI labels and buttons if the app needs a slightly more modern control feel.
- `IBM Plex Mono`: AI voice, reasons, system-like text, match explanation. Keep it restrained.

### Type Treatment

Current app headings are elegant but a bit under-branded. Recommended update:

- `.h1`: use `--font-brand`, `30px`, weight `600`, line-height `1.12`.
- `.eyebrow`: use `--font-ui`, uppercase, wider tracking, maroon or faint ink.
- `.label`: keep small uppercase, but use olive/muted ink instead of very pale gray.
- `.msg-ai`: keep mono, but slightly warmer color and comfortable line-height.

### Copy Tone

Keep the existing lowercase, casual Indonesian voice. It is one of the app's strongest identity points.

Use:

- "hei", "kamu", "aku", "lagi", "pengen".
- Short sentences.
- One question at a time.

Avoid:

- Overly formal institutional wording.
- Marketing language inside the app flow.
- Long instructional paragraphs.

## Logo And Brand Assets

### Needed Assets

Add official assets once confirmed:

```txt
apps/app/public/brand/logo-alfath-mark.svg
apps/app/public/brand/logo-alfath-lockup.svg
apps/app/public/brand/logo-alfath-white.svg
apps/app/public/brand/logo-raksa-samarasya.svg
```

If we use assets from the existing Al-Fath website, confirm that they are the official LDK assets and that they may be reused in this app.

### Logo Usage

- Welcome screen: use logo mark above the app name or as a compact lockup.
- Nav: use a small logo mark plus "Al-Fath Berkarya".
- Loading state: optional small mark, not mandatory.
- Favicon: replace generic favicon with Al-Fath mark.
- Do not use large logo decorations behind content unless opacity is very low.
- Do not stretch, recolor, or crop the logo.

### Brand Lockup

Recommended nav lockup:

```txt
[mark] Al-Fath Berkarya
      builder community
```

Use the subtitle only where space allows. Mobile nav can show just mark + "Al-Fath".

## Layout System

The existing layout should stay narrow and focused.

### Width

Keep:

```css
--max: 580px;
```

Optional future variants:

```css
--max-reading: 580px;
--max-directory: 680px;
--max-profile: 620px;
```

### Spacing

Recommended scale:

```txt
4, 6, 8, 12, 16, 20, 24, 32, 40, 52, 64, 80
```

Use more vertical spacing for onboarding and review screens. Keep home directory dense enough to scan.

### Surfaces

Use surfaces only where they help interaction:

- Input bar.
- OTP/auth form.
- Review fields when editing.
- Match cards if we later move away from divider-only rows.

Do not put every section in cards. The current app's divider-based design is stronger.

## Component Guidance

### Buttons

Primary:

- Background: maroon.
- Hover: maroon dark.
- Text: cream.
- Radius: `4px` or `6px`, not pill.
- Add subtle shadow only on major CTAs.

Secondary:

- Transparent background.
- Border: line.
- Text: ink.
- Hover border/text: maroon.

Icon/send:

- Maroon text.
- Hover opacity or small translate.
- Keep compact.

### Inputs

- Transparent or soft surface.
- Bottom border by default.
- Focus border: maroon.
- Placeholder: faint ink.
- OTP input can use larger brand type and maroon caret/focus.

### Chat Messages

AI message:

- Mono text, ink.
- No bubble by default.
- Optional soft maroon/olive accent line for first welcome message only.

User message:

- Right aligned.
- Can remain plain text.
- If bubble is introduced, use maroon background and cream text, but only if it does not make the chat feel heavy.

### Chips

Skill chips:

- Border: line.
- Text: muted ink.
- Hover: maroon border.
- Optional support-soft background for selected/active tags.

Remove buttons:

- Use subdued maroon/faint ink.
- Avoid bright red except destructive states.

### Nav

Current sticky nav is good. Update:

- Add small logo mark.
- Use `--font-brand` for brand text.
- Keep user meta on right.
- Border line remains subtle.

### Match Rows

Use divider-led layout with richer accents:

- Name: ink, medium/semibold.
- Meta: muted.
- Reason: mono, muted, left border or quote accent in maroon-soft.
- CTA: secondary button.

### Member Rows

Keep highly scannable:

- Slight hover tint: `accent-soft`.
- Name and year aligned.
- Skills muted with olive separator or faint bullet.

### Loading

Recommended text:

```txt
lagi nyusun profil kamu...
lagi nyariin orang-orangnya...
```

Visual:

- Dots remain.
- Optional small logo mark above the text for full-screen loading.

## Patterns And Texture

The website uses a dotted/patterned cream background. The app can use a quieter version:

```css
body {
  background-color: var(--bg);
  background-image: radial-gradient(rgba(127, 32, 32, 0.055) 0.7px, transparent 0.7px);
  background-size: 24px 24px;
}
```

Use this carefully. If it hurts text clarity, restrict the pattern to auth/welcome only:

```css
.brand-screen {
  background-image: radial-gradient(...);
}
```

Avoid large decorative blobs, heavy gradients, or pure marketing-page treatment inside the product.

## Screen-by-Screen Direction

### Welcome

Goal: first strong Al-Fath brand moment.

Changes:

- Add Al-Fath mark or lockup.
- Use brand heading font.
- Primary CTA maroon.
- Add subtle cream pattern.
- Keep form simple.

### Verify Email

Goal: trustworthy verification.

Changes:

- Same brand treatment as Welcome.
- OTP field gets maroon focus and larger type.
- Error text should be clear, not too faint.

### Onboarding

Goal: preserve intimate AI conversation.

Changes:

- Header brand lockup with maroon accent.
- AI text remains mono.
- Send button maroon.
- Input bar slightly warmer.
- Avoid cards/bubbles unless needed.

### Review

Goal: profile feels like a crafted member card.

Changes:

- Heading uses brand font.
- Field labels use muted olive/maroon.
- Skills chips use soft olive/maroon interactions.
- Publish button maroon.

### Matches

Goal: recommendations feel meaningful, not generic list items.

Changes:

- Match reason gets a soft maroon quote/accent style.
- CTA secondary buttons use maroon hover.
- Empty state should invite browsing with warm tone.

### Community Home

Goal: directory remains functional and scannable.

Changes:

- Nav gets logo.
- Greeting can use `firstName` and brand voice.
- Member rows get subtle hover tint.
- Discovery AI response can keep mono but use better spacing.

### Member Profile

Goal: profile reads like a concise builder identity.

Changes:

- Name heading brand or semibold body depending how expressive we want.
- Skills chips use consistent token.
- Back action uses maroon hover.
- Vibe remains mono.

## Development Plan

### Phase 1 - Design Tokens Only

Scope:

- Update global CSS variables in `apps/app/src/index.css`.
- Add Google font links in `apps/app/index.html`.
- Update button, input, chip, nav, loading, and text styles.
- Fix `Loading` default label while touching UI atoms.

Expected outcome:

- App immediately feels Al-Fath without changing layout or behavior.

### Phase 2 - Brand Assets

Scope:

- Add official logo assets under `apps/app/public/brand/`.
- Update favicon.
- Use mark/lockup on Welcome, VerifyEmail, and nav.

Expected outcome:

- Brand identity is visible in key surfaces.

### Phase 3 - Screen Polish

Scope:

- Add `brand-screen` pattern for auth/welcome.
- Improve match reason treatment.
- Improve member row hover/focus states.
- Add accessible focus states for clickable rows and buttons.

Expected outcome:

- The whole flow feels cohesive, not just recolored.

### Phase 4 - Landing Alignment

Scope:

- Decide whether `apps/landing` should stay in its current custom style or align with the new app tokens.
- Avoid duplicate visual language between landing and SPA unless intentionally shared.

Expected outcome:

- Public page and app feel related but not identical.

## Technical Guardrails

- Do not change product flow while implementing the design system.
- Prefer CSS variable updates before component rewrites.
- Keep layout width and routing unchanged.
- Keep text readable on mobile.
- Avoid nested card UI.
- Avoid overusing glassmorphism in the SPA.
- Test at mobile and desktop widths.
- Run typecheck after changes because current `Loading` calls need cleanup.

## Acceptance Criteria

The design system pass is successful when:

- The app clearly feels connected to LDK Al-Fath.
- The UI still feels calm and chat-first.
- Primary actions, focus states, and links consistently use maroon.
- Secondary accents use olive, not random gray/brown.
- Logo appears in brand moments without overwhelming the interface.
- Typography hierarchy is more distinctive but still readable.
- No screen feels like a generic template.
- No text overlaps or becomes too small on mobile.

## Open Decisions

Before implementation, confirm:

- Which official logo files should be used.
- Whether the app name should remain "Al-Fath Berkarya" or include "LDK Al-Fath" in nav/auth screens.
- Whether `El Messiri` should be used for all screen headings or only brand/welcome headings.
- Whether the subtle pattern should be global or only used on welcome/auth screens.

