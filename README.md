# website-astro-software

Technical portfolio for software engineering, powered by live data from `api-kaianolevine-com`.

## Audience

Built for potential employers and clients who want proof that a working engineering system exists behind the projects.

## Prerequisites

- Node.js 22+
- npm

## Running locally

```bash
npm install
```

Copy the example env file and fill in values:

```bash
cp .env.example .env
```

Start the dev server:

```bash
npm run dev
```

Run type-checking:

```bash
npm run check
```

## Environment variables

Every variable the site reads is listed, with what it does and its default,
in [`.env.example`](.env.example). All are read at build time and baked into
the static output, so all are public.

## Build

```bash
npm run build
```

## Versioning

This repo uses semantic-release for automated versioning on merge to `main`.

- `feat:` → minor bump
- `fix:` → patch bump
- `feat!:` / `BREAKING CHANGE` → major bump
- `chore/docs/refactor/test/ci` → no bump

Never manually edit `package.json` version or `CHANGELOG.md`. Both are managed automatically.

## Deploy (Cloudflare Pages)

1. Connect this Git repository in Cloudflare Pages.
2. Set `PUBLIC_API_URL` and `PUBLIC_TURNSTILE_SITE_KEY` in Pages environment variables (not as secrets — they're build-time and baked into the HTML/JS).
3. Build command: `astro build`
4. Output directory: `dist`

## CORS requirement

The frontend makes browser requests directly to `PUBLIC_API_URL`, so the API must allow the Cloudflare Pages domain in its `CORS_ORIGINS`.

### Endpoints called client-side

- `GET /v1/evaluations`
- `GET /v1/flags`
- `GET /v1/github/status`
- `GET /v1/standards/catalog`

`/resume/` also links to `GET /v1/resume` (a navigation, not a fetch).
