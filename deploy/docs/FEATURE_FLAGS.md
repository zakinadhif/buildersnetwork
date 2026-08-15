# Feature flags

Product feature flags are typed global booleans. The application reads them
through one provider interface; the active provider is selected at deployment.

## Local development

Local development uses the environment provider. Values live in
`apps/api/.env` (copied from `.env.example`):

```env
FEATURE_FLAG_PROVIDER=env
FEATURE_AI_ASSISTANT=true
```

## Ephemeral previews

Preview values are non-secret literals in the tracked
`wrangler.preview.template.toml`. CI copies those values unchanged into the
rendered, gitignored `wrangler.preview.toml`. Change the tracked template in a
PR to change its next preview deployment. The SPA reads `/api/features`; it has
no `VITE_FEATURE_*` configuration.

## Production

Production selects the database provider in `wrangler.toml`. Apply migrations
before changing flags. A missing row uses the safe code default; the AI
assistant defaults off.

Enable the assistant:

```powershell
pnpm exec wrangler d1 execute buildersnetwork --remote --command "INSERT INTO feature_flags (key, enabled) VALUES ('aiAssistant', 1) ON CONFLICT(key) DO UPDATE SET enabled = excluded.enabled, updated_at = cast(unixepoch('subsecond') * 1000 as integer)"
```

Disable it by running the same command with `enabled` set to `0`. Changes are
read directly from the database and require no Worker redeploy.
