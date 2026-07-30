# The mockup gallery — previews and deploys

*How we operate the `apps/mockups` gallery: the per-PR preview, and the public site at **[mockups.buildersnetwork.web.id](https://mockups.buildersnetwork.web.id)**. The design process those mockups serve is [parallel-ui-exploration.md](parallel-ui-exploration.md); the app's own PR previews are [preview-environments.md](preview-environments.md) — a different system.*

Any pull request touching `apps/mockups/**` gets a live static preview URL posted on it. The gallery is a standalone static app — no API, no DB — which is what makes it safe to preview from forks.

## Design maturity markers

The gallery switcher marks every screen with one design status:

- **Exploration** — incomplete, transitional, or one of several directions. It cannot ground a `[Fitur]`.
- **In Review** — a coherent candidate under review. It still cannot ground a `[Fitur]`.
- **Approved Reference** — the current implementation reference for the explicitly approved slice of the screen. It clears Gate B when the feature cites the mockup and its `groundedBy` issue.

This is separate from product lifecycle. A screen can be an Approved Reference and later become **retired**, or remain active while its redesign is still Exploration.

The source is `SCREEN_META` in `apps/mockups/src/gallery/nav.ts`. An Approved Reference records:

- `groundedBy` — the GitHub design or decision issue that approved it;
- `scopeNote` — the slice that is safe to build;
- `excludes` — visible future-facing capabilities that are not approved by the screen.

New screens start as Exploration. A design PR may mark its candidate In Review. Maintainer acceptance and merge promote it to Approved Reference; starting a later redesign does not silently invalidate the approved version on `main`.

## Fork-safe by construction — two workflows, on purpose

The split is the whole security design. **A job that runs PR code never holds a secret; the job that holds the secret never runs PR code.**

- **`preview-mockups.yml`** (`pull_request`, **no secrets**) runs the PR's code to build the gallery (`pnpm --filter mockups build`) and uploads the result as an artifact. No secret is in scope, so a fork PR has nothing to steal.
- **`preview-mockups-deploy.yml`** (`workflow_run`, **trusted, has secrets**) downloads that artifact and runs `wrangler pages deploy`. It never executes PR code, so the token stays safe.

For the same reason the deploy workflow **deliberately does not read `apps/mockups/wrangler.toml`** — it passes `--project-name` / `--branch` on the CLI, so the trusted job never trusts config that came from a forked PR. The cost is that the project name lives in two places; keep them in sync.

## Production

The gallery is its own Cloudflare **Pages** project, configured in `apps/mockups/wrangler.toml` (`name`, `pages_build_output_dir`). `deploy-mockups.yml` publishes it on every push to `main` that touches `apps/mockups/**`, guarded on the `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets (it no-ops until they're set).

The custom domain serves the **production** deployment (the `main` branch); per-PR previews keep their own `*.buildersnetwork-mockups.pages.dev` URLs.

To deploy by hand — off a different branch, or before the automation is wired up:

```bash
pnpm --filter mockups deploy   # builds, then `wrangler pages deploy` (run on main)
```

## One-time setup

Enable "Require approval for all outside collaborators" (or first-time contributors) in the repo's Actions settings, create the Pages project, and give the API token the **Cloudflare Pages — Edit** permission:

```bash
wrangler pages project create buildersnetwork-mockups --production-branch=main
```

Pages custom domains can't live in `wrangler.toml`. Attach it once via the dashboard (Pages → project → Custom domains) or the API — the zone is already in this account, so the CNAME is auto-created:

```bash
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/buildersnetwork-mockups/domains" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"mockups.buildersnetwork.web.id"}'
```
