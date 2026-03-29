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

| Variable | Description |
|---|---|
| `PUBLIC_API_URL` | Base URL for the FastAPI service (must be publicly reachable from the browser) |

Example:
```
PUBLIC_API_URL=https://api.kaianolevine.com
```

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
2. Set `PUBLIC_API_URL` in Pages environment variables (not as a secret — it's build-time and baked into JS).
3. Build command: `astro build`
4. Output directory: `dist`

## CORS requirement

The frontend makes browser requests directly to `PUBLIC_API_URL`, so the API must allow the Cloudflare Pages domain in its `CORS_ORIGINS`.

### Endpoints called client-side

- `GET /v1/stats/overview`
- `GET /v1/sets`
- `GET /v1/sets/:id`
- `GET /v1/stats/top-artists`
- `GET /v1/stats/top-tracks`
- `GET /v1/evaluations/summary`
- `GET /v1/evaluations`
- `GET /v1/flags`
- `GET /v1/live-plays`
- `GET /v1/spotify/playlists`
