# SilverFour LMS

Minimal React, TypeScript, and Vite learning management workspace configured with environment variable support, Neon CLI tooling, and [antislop](https://github.com/miqdadbadjuber/anti-slop) agent skills.

## Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Type-check with tsc -b and build production bundle
npm run lint     # Lint with oxlint
npm run preview  # Preview production build locally
```

## Environment Variables

Copy `.env.example` to `.env` when setting up on a new machine (already created locally and ignored by Git):

- `VITE_APP_NAME`, `VITE_APP_ENV`, `VITE_API_URL`, `VITE_PORT`: Client/Vite variables loaded via `loadEnv` in `vite.config.ts` and exposed through `import.meta.env`.
- `DATABASE_URL`: Server-only Neon Postgres connection string. Keep it unprefixed (no `VITE_` prefix) so Vite never bundles it into client code.

### Pulling ENV from Neon

Verify Neon CLI (`neon --version`), then sign in, link a Neon project, and pull environment variables:

```bash
neon login
neon link
neon env pull
```

## Anti-Slop Skills

All six `antislop` skills are installed under `.agents/skills/` and referenced by `AGENTS.md`. Update them later with:

```bash
npx antislop-ai --update
```
