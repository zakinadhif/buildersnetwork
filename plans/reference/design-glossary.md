# Design glossary — the words the design system uses

*Reference: [requirements.md](requirements.md) · [content-model.md](content-model.md). The graduation rule lives in [how-to/parallel-ui-exploration.md](../how-to/parallel-ui-exploration.md). Non-authoritative working knowledge — trust the code when they diverge.*

The vocabulary of `libs/design-tokens`, `libs/ui`, and `apps/mockups`, in one place. Roughly half these terms are standard typography and design words; the other half are this repo's own. Each entry says which, because that tells you whether searching the web will help.

The definitions live in the source, in comments next to the declarations — `theme.css`, `base.css`, and `ui.css` read as design essays and are the real documentation. This doc is the map, not the territory. File paths are cited without line numbers on purpose; those rot.

## The one principle: name the role, not the value

Nearly every name here follows from it. `theme.css` states it outright — **"Reach for the role, not the number."** So the type scale is `--text-body`, not `--text-13`. Leading is `--leading-heading`, not `--leading-tight`. Radii are `card` and `panel`, not `md` and `lg`.

Two consequences worth internalizing:

- **If nothing in the scale fits, promote a new step** to `theme.css` rather than writing a one-off value at the call site. That is precisely how the app drifted to eighteen font sizes.
- **Role names are chosen to avoid shadowing Tailwind's built-ins** where the value differs. Both apps already use stock `text-sm`, `rounded-lg`, and `tracking-wide`; redefining those would silently move existing UI. Where a role collides with a built-in of a different value, it is named for the role instead.

## Layout

**Shell** *(repo)* — the three-column page frame every browsing surface shares: left nav, main, right rail. `ShellColumns` in `libs/ui/src/Shell.tsx` is the one implementation both apps render.

**Rail** *(standard)* — a narrow vertical column flanking the main content. There are two: the **left rail** (`.bn-nav`, 200px, navigation) and the **right rail** (`.bn-rail`, 232px, contextual side content). The left rail is shared chrome; the right rail's contents are each route's own business.

**Gutter** *(standard)* — padding between content and the edge of its container: `--shell-gutter`, 32px at each column edge. Distinct from **gap**, the space *between* columns.

**Measure** *(standard)* — the width of a column of content. There are exactly two:

- `--container-shell` (1052px), the three-column browsing shell.
- `--container-page` (580px), the single reading column — auth, welcome, chat.

**`--container-shell` vs `--container-shell-outer`** — the distinction that caused the system's most expensive bug. `--container-shell` measures the **content the columns divide up**; `--container-shell-outer` derives from it by adding the six column-edge gutters and two rules. Under the shared `border-box` base, `max-width` sets the **outer** box, so a shell wanting 1052px of content must ask for `--container-shell-outer`. The same declaration once meant content in the gallery and outer width in the app, and the app's centre column was 48px short for months (#91). `outer` is derived, never written down twice.

**Chrome** *(standard)* — the persistent UI frame around content: nav, shell, rails. As opposed to the content itself. `libs/ui` describes itself as "the chrome that has stopped moving."

**Stub** *(repo)* — a compact representation of something bigger. The **user stub** is the avatar + name + handle block at the bottom of the nav.

**Slot** *(standard component vocabulary)* — a named hole a parent leaves for a caller to fill. `LeftNav`'s `filters` prop is the slot between the nav items and the user stub.

## Type

**Eyebrow** *(standard editorial)* — the small uppercase label sitting *above* a heading, like a brow over an eye. Not a free-form style: it is a shared object exported from `libs/design-tokens` as `eyebrow`, and screens spread it (`style={eyebrow}`) rather than rebuilding it.

**Wordmark** *(standard branding)* — the brand name set as type rather than a logo.

**Leading** *(standard; rhymes with "heading")* — line-height, named for the strips of lead once set between lines of metal type. Three roles: `heading` (1.15), `compact` (1.3, for interface text — buttons, chips, nav items, eyebrows), `body` (1.55, for prose). The document defaults to the **body role** in `base.css`; anything whose role is not body says so at the element that owns the role.

**Tracking** *(standard)* — letter-spacing across a run of text. `eyebrow` (0.08em), `tag` (0.02em), `heading` (-0.01em, because display type sets loose by default).

**Byline** *(standard editorial)* — who authored it. On Scroll the byline is deliberately the **karya**, not the person; the contributor is a small avatar dipping into the karya logo's corner. That inversion is the surface's signature, not an accident.

### The three faces — each one a role

| Token | Family | Means |
|---|---|---|
| `--font-display` | Lora (serif) | brand and display copy |
| `--font-body` | Plus Jakarta Sans | body, labels, meta |
| `--font-mono` | IBM Plex Mono | **the AI voice** |

Mono is semantic here, not decorative. Setting something in mono claims the machine is talking.

### The type scale — eight steps, all roles

The bottom four sit 1px apart **by design**: dense meta separated further by case, weight, and colour rather than by size.

| Token | Size | Role |
|---|---|---|
| `--text-micro` | 10px | eyebrow labels, tags, chips, dense inline meta |
| `--text-caption` | 11px | subtitles, standalone secondary text, small counts |
| `--text-ui` | 12px | nav, filters, controls, buttons, secondary body |
| `--text-body` | 13px | primary body: descriptions, bios |
| `--text-stat` | 15px | featured metric values |
| `--text-title` | 18px | serif list-item titles, callout heading |
| `--text-feature` | 23px | serif wordmark, featured title |
| `--text-display` | 30px | serif page heading |

## Colour and surface

**Ink** *(standard print metaphor)* — text colour. The ramp is `ink` (near-black) → `ink2` (muted body) → `ink3` (meta). The numbers mean *further back*, never a size. Contrast ratios are AA against the surface each colour sits on; keep them that way.

**Accent** — terracotta, in five roles: `accent` (the colour), `accent-mid` (a lighter mid that still clears AA on the page), `accent-fg` (text *on* accent), `accent-tint` (the wash), `accent-line` (a tinted hairline).

**Hairline** *(standard)* — a 1px rule, the thinnest visible line. `--color-line` is the neutral hairline, `--color-line-dark` a heavier one, `--color-accent-line` the tinted one. "Hairline quiet" describes a treatment signalled with nothing louder than a thin border.

**Tint** / **wash** *(standard, used interchangeably here)* — a colour diluted far toward white, for backgrounds rather than text.

**Surface vs bg** — `--color-bg` is "gallery white" (98%), the page. `--color-surface` is pure white, the **lifted** card — lifted meaning it reads as raised because it is brighter than the page behind it.

**Ring** *(repo)* — the 1px border an avatar or cover wears, exported as `RING` from `libs/ui/src/Avatar.tsx`. The rule that matters: under `border-box` the ring sits **inside** the box, so the box carries it. `Avatar size={28}` is a 28px face rendering as a 30px element — `size` is the face, not the box.

**Off-palette** *(repo)* — a value that is in the system but has not earned its place. `--color-danger` is the only one: a bare hex in an otherwise all-oklch palette, with no counterpart in the mockups. It was promoted out of a hiding place rather than designed, and it still owes the palette a real oklch value.

## Components

**Monogram** *(standard)* — initials standing in for a face: `initials("Zaki Nadhif")` → `"ZN"`, on a pastel disc whose hue is hashed from the full name (not the first letter, which collides).

**Facepile** *(standard)* — a row of small overlapping avatars showing who is involved. The faces make a thread read as a conversation rather than a counter.

**Roster** *(repo)* — the karya card's facepile: faces lapping each other, then a `+N` chip for the remainder.

**Cover** *(repo)* — the app-icon tile for a karya. Square, rounded, ringed.

**Tag / chip / pill** *(standard, near-synonyms here)* — a single-line UI label. One `--tracking-tag` covers all three.

**Stage** *(repo/domain)* — a karya's lifecycle marker or seeking-signal, rendered as a tag beside the title. The one that is a call to act gets the accent.

**Activity line** *(repo)* — the accent-lit "what's new" plus its timestamp, at the top of a karya card.

**Proof-shot** *(repo)* — a landscape screenshot in the Play-Store-style carousel. *Proof* because it is evidence the thing exists.

**Card vs panel** — the two radii, as roles. `--radius-card` (8px): buttons, nav items, inputs. `--radius-panel` (16px): lifted cards, rails, the CTA block.

## Spacing

**The 4px grid** — `--spacing: 0.25rem`, stated rather than inherited. It matches Tailwind's default step, so `gap-4` and `px-3` are unchanged; it is written down so the grid is a decision instead of an accident. **Half-steps are legal** for the 6/10/14px values already in use (`gap-1.5`, `p-2.5`) — a 10px gap is not off-grid.

## The doctrine words

These carry the most weight and exist nowhere outside this repo.

**North star** *(repo)* — the mockups. When the gallery and the app disagree, the app conforms. "The mockup is the north star and it wins every disagreement."

**Drift** *(repo)* — two implementations of one design silently diverging. The system's central antagonist, with a documented rap sheet: #26 shared the token *values*; #87 found the type had drifted anyway; #91 found the box model had too. The line to remember: **tokens pin the leaves; they cannot pin the tree.**

**Graduation** *(repo)* — when chrome moves out of the gallery's inline-style idiom into `libs/ui` as one shared implementation. Requires **both** conditions: the design is ratified, *and* both apps render it. Something only the gallery renders has nothing to drift against; something still moving is not ready to be pinned. The bar is that neither app moves a pixel — *"if your refactor changes how something looks, that is a design change wearing a refactor's clothes."* Full rule in [parallel-ui-exploration.md](../how-to/parallel-ui-exploration.md).

**Variant** *(repo)* — a competing exploration of one screen (`screens/cari/Variant*`). Variants keep their inline styles and their freedom to move fast. Never force a variant into `libs/ui`.

**The gallery** *(repo)* — `apps/mockups`. A document that scrolls, where the app is a fixed pane that scrolls inside itself. Its inline-style idiom is a **feature, not debt**: a screen you can rewrite in one file, with no CSS to name and no component to keep in sync, is what makes five directions in a day possible.

## Two mechanics that explain the shapes

**`@theme static` is load-bearing.** Tailwind only emits the theme variables whose utilities it finds in a source scan. Both consumers here reach for tokens through hand-written `var()` — in plain CSS and in React inline styles — which the scanner cannot see. Without `static`, those variables are tree-shaken away and every reference silently resolves to nothing. Do not drop it.

**`T` holds references, not copies.** Every value in the `T` object is a `var(--...)` *reference* into `theme.css`. So `T.size.body` is the string `"var(--text-body)"`, not `13` — CSS resolves it; JavaScript cannot do arithmetic on it. A literal in that file would be a second declaration of a token, which is the exact condition that let the two apps drift apart. If you need to compute from a size, read the custom property at runtime rather than reintroducing a literal.
