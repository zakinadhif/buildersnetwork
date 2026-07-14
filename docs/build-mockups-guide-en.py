"""Builds the mockup-contributor getting-started guide as a .docx.

For designers and light contributors: no database, no Docker, no API keys — just
the gallery. The .docx is a build artifact; edit this script, not the Word file.
The Indonesian edition is build-mockups-guide-id.py; keep the two in lockstep.

    pip install python-docx
    python docs/build-mockups-guide-en.py   # -> docs/getting-started-mockups.docx
"""

from pathlib import Path

from _docx_kit import NOTE_BG, WARN_BG, new_doc

doc, k = new_doc()

k.title(
    "Al-Fath Berkarya",
    "Contributing to the mockups — a guide for designers",
    "Verified end-to-end on a clean clone — 14 July 2026.\n"
    "You need Node, pnpm, and Git. You do not need Docker, a database, or any API key.",
)

k.para(
    "The mockup gallery is where the look of Al-Fath Berkarya is designed. It is a standalone "
    "static app: React screens with fake data, no backend of any kind. That makes it the easiest "
    "part of the project to contribute to, and one of the most valuable — the mockups are the "
    "north star the shipping app is built against."
)
k.para(
    "This guide gets you from nothing installed to the gallery running on your machine, and then "
    "to your first change in a pull request. It is deliberately the short path: everything that "
    "belongs to the full app — the database, Docker, API keys, code generation — you can skip "
    "entirely."
)

k.callout(
    "You are installing a fraction of the project.",
    "The full app pulls in 923 packages, including some that compile native code and are slow or "
    "painful on a low-end machine. The gallery needs 67, and none of them compile anything. The "
    "install command in Section 3 is what keeps it that way — it is not the one in the README.",
)

# =============================================================================
doc.add_heading("1. What you need", level=1)

k.para("Three tools. That is the whole list.")

k.table(
    ["Tool", "Version", "What for"],
    [
        ["Node.js", "22 or newer", "Runs the dev server"],
        ["pnpm", "10 or newer", "Installs packages — npm and yarn will not work here"],
        ["Git", "any recent", "Getting the code, and sending your changes back"],
    ],
    widths=[1.5, 1.7, 3.3],
)

k.para(
    "Not needed: Docker, any database, any API key, any paid service. If a step ever asks you for "
    "one of those, you are following the wrong guide — that one is docs/getting-started.docx, for "
    "people working on the full app.",
    muted=True,
    size=9.5,
)

doc.add_heading("Node.js 22", level=2)
k.code(
    """
# Windows (PowerShell)
winget install CoreyButler.NVMforWindows
nvm install 22
nvm use 22

# macOS / Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22
nvm use 22

# Check it worked
node -v      # -> v22.x.x
"""
)
k.para(
    "The installer from nodejs.org works too — pick the 22 LTS download. The version manager above "
    "is only nicer if you juggle several projects.",
    muted=True,
    size=9.5,
)

doc.add_heading("pnpm 10", level=2)
k.para(
    "Node 22 already ships the tool that installs pnpm, so this is two lines. Do not substitute "
    "npm or yarn — this project is a pnpm workspace and the others will produce a broken install."
)
k.code(
    """
corepack enable
corepack prepare pnpm@10.18.1 --activate

# Check it worked
pnpm -v      # -> 10.x.x
"""
)

doc.add_heading("Git", level=2)
k.code(
    """
# Windows
winget install Git.Git

# macOS
brew install git

# Debian / Ubuntu
sudo apt install git
"""
)

# =============================================================================
doc.add_heading("2. Get the code", level=1)

k.para(
    "If you have write access to the repository, clone it directly. If you do not — or you are not "
    "sure — fork it on GitHub first and clone your fork; contributing from a fork is fully "
    "supported, and your pull request still gets a live preview."
)
k.code(
    """
git clone https://github.com/zakinadhif/buildersnetwork.git
cd buildersnetwork
"""
)

# =============================================================================
doc.add_heading("3. Install — the small install", level=1)

k.para("This is the one command in this guide you must get right.")
k.code(
    """
pnpm install --filter mockups...
"""
)

k.callout(
    "Mind the three dots.",
    "`--filter mockups...` means \"the mockups app and the things it needs\" — nothing else. The "
    "trailing `...` is part of the syntax, not punctuation in this sentence. Plain `pnpm install` "
    "would install the entire project: the API, the database driver, the image processor, the "
    "Cloudflare runtime. It works, but it is roughly 14x the packages and it compiles native code, "
    "which is exactly what you do not want on a modest laptop.",
    WARN_BG,
)

k.table(
    ["", "`pnpm install --filter mockups...`", "`pnpm install`"],
    [
        ["Packages", "67", "923"],
        ["Compiles native code", "No", "Yes — better-sqlite3, sharp, workerd"],
        ["Enough to run the gallery", "Yes", "Yes"],
    ],
    widths=[1.5, 2.6, 2.4],
)

k.para(
    "If you ever do need the full app later, just run plain pnpm install then — nothing you do now "
    "has to be undone.",
    muted=True,
    size=9.5,
)

# =============================================================================
doc.add_heading("4. Run the gallery", level=1)

k.code(
    """
pnpm dev:mockups
"""
)
k.para(
    "Open http://localhost:5173. That is it — there is no environment file to fill in, no database "
    "to create, no second terminal to run. The gallery starts in well under a second and reloads "
    "the moment you save a file."
)

k.callout(
    "It should just work.",
    "If the page loads and you can see the Launchpad screen with its cards, avatars and font "
    "switcher, your setup is complete and correct. There is no further verification step — the "
    "gallery has no backend that could be misconfigured.",
)

# =============================================================================
doc.add_heading("5. What you are looking at", level=1)

k.para(
    "Everything lives in apps/mockups/src. You will spend nearly all your time in two of these "
    "folders — screens/ and lib/tokens.ts."
)

k.table(
    ["Path", "What it holds"],
    [
        [
            "`screens/`",
            "One file per mockup screen — `Launchpad.tsx`, `Jelajahi.tsx`, `cari/`. This is where a "
            "screen's layout and composition live. Start here.",
        ],
        [
            "`lib/tokens.ts`",
            "The design tokens — colour, type scale, spacing — as a single object `T`. **This is "
            "the single source of the design system.** Change a colour here and every screen "
            "changes with it.",
        ],
        [
            "`components/`",
            "The shared chrome every screen reuses: `Shell`, `LeftNav`, `Avatar`, `Tag`.",
        ],
        [
            "`data/`",
            "The fake content the screens render — karya, members, asks. Invented, not from a "
            "database. Edit freely.",
        ],
        [
            "`gallery/`",
            "The gallery's own plumbing: which screens exist, and the font switcher. You rarely "
            "touch this.",
        ],
    ],
    widths=[1.5, 5.0],
)

k.callout(
    "Design in the tokens, not in the screen.",
    "If you find yourself hard-coding a hex colour or a pixel size inside a screen, stop — it "
    "belongs in `lib/tokens.ts` as a token, so the rest of the gallery stays consistent with it. "
    "A one-off value in one screen is how a design system quietly dies.",
)

# =============================================================================
doc.add_heading("6. Make a change", level=1)

k.para(
    "Try the smallest possible edit first, to prove the loop works end to end. Open "
    "apps/mockups/src/lib/tokens.ts, change the `accent` colour, and save. Every screen in the "
    "gallery repaints instantly. Change it back."
)
k.para(
    "From there the loop is just: edit a file, look at the browser, repeat. There is nothing to "
    "restart and nothing to rebuild."
)

doc.add_heading("Before you open a pull request", level=2)
k.para("Two commands. Both work with the small install.")
k.code(
    """
pnpm lint                     # formatting + code style (Biome)
pnpm --filter mockups build   # type-checks and builds — catches broken imports
"""
)
k.para(
    "If lint complains about formatting, `pnpm lint:fix` will fix most of it for you.",
    muted=True,
    size=9.5,
)

doc.add_heading("Sending it in", level=2)
k.code(
    """
git checkout -b desain/nama-perubahanmu
git add .
git commit -m "desain: ringkasan singkat perubahanmu"
git push -u origin desain/nama-perubahanmu
"""
)
k.para(
    "Then open a pull request on GitHub. Any PR that touches apps/mockups gets its own live "
    "preview URL posted to it automatically — including from a fork — so reviewers can click "
    "through your change instead of imagining it from a diff."
)

# =============================================================================
doc.add_heading("7. If something goes wrong", level=1)

k.table(
    ["Symptom", "Fix"],
    [
        [
            "`pnpm: command not found`",
            "Corepack step did not take. Re-run `corepack enable`, then open a new terminal.",
        ],
        [
            "The install is huge, slow, or fails compiling something",
            "You almost certainly ran plain `pnpm install`. Use "
            "`pnpm install --filter mockups...` — note the three dots.",
        ],
        [
            "`Port 5173 is already in use`",
            "Something else is on that port — often the main app's dev server. Close it, or let "
            "Vite pick the next port when it offers.",
        ],
        [
            "A blank page, or an import error in the terminal",
            "Usually a typo in a file you just edited. The terminal running `pnpm dev:mockups` "
            "prints the file and line.",
        ],
        [
            "The browser shows an old version",
            "A hard reload (Ctrl+Shift+R / Cmd+Shift+R) clears it.",
        ],
    ],
    widths=[2.5, 4.0],
)

# =============================================================================
doc.add_heading("8. Where to go next", level=1)

k.bullet(
    "the live gallery, always current with main. Useful for seeing what already exists before you "
    "design something new.",
    bold_lead="mockups.buildersnetwork.web.id — ",
)
k.bullet(
    "how mockup previews and deploys work, if you are curious what happens after you open a PR.",
    bold_lead="plans/how-to/mockup-gallery.md — ",
)
k.bullet(
    "the design process the mockups serve — how several visual directions get explored in "
    "parallel and one gets chosen.",
    bold_lead="plans/how-to/parallel-ui-exploration.md — ",
)
k.bullet(
    "the full-app setup, for the day you want to work on the real thing. Nothing in this guide "
    "conflicts with it.",
    bold_lead="docs/getting-started.docx — ",
)

k.para(
    "All UI copy in this project is Bahasa Indonesia kasual — write it the way you would say it "
    "out loud, not the way a bank would write it."
)

out = Path(__file__).resolve().parent / "getting-started-mockups.docx"
doc.save(out)
print(f"saved -> {out}")
