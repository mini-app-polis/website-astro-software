# website-astro-software

Technical portfolio for software engineering, powered by live data from the `deejay-marvel-api` FastAPI service.

## Audience

Built for potential employers and clients who want proof that a working engineering system exists behind the projects.

## Local development

```bash
npm install
npm run dev
```

Open the URL shown in the terminal.

## Environment variables

`PUBLIC_API_URL`  
Base URL for the FastAPI service (must be publicly reachable from the browser).

Example:
```bash
PUBLIC_API_URL=https://your-api-url.railway.app
```

## Build

```bash
npm run build
```

## Versioning

This repo uses semantic-release for automated versioning.
Versions are determined automatically from commit messages
on merge to main:

- feat: → minor version bump (0.3.1 → 0.4.0)
- fix: → patch version bump (0.3.1 → 0.3.2)
- feat!: or BREAKING CHANGE → major bump (0.3.1 → 1.0.0)
- chore/docs/refactor/test/ci → no version bump

Never manually edit the version in package.json.
Never manually edit CHANGELOG.md.
Both are managed automatically on merge to main.

## Tests / Quality checks

This project currently uses build-time verification (Astro type-check + compile).

```bash
npm run check
```

If you add automated tests later (e.g., API contract tests), list them here.

## Deploy (Cloudflare Pages)

1. Connect this Git repository in Cloudflare Pages.
2. Set the environment variable `PUBLIC_API_URL` in the Pages project settings.
3. Build command: `astro build`
4. Output directory: `dist`

## CORS requirement

The frontend makes browser requests to your FastAPI service, so `PUBLIC_API_URL` must support CORS for the Cloudflare Pages domain.

### Frontend-called endpoints

- `GET /v1/stats/overview` (client-side StatsBar)
- `GET /v1/sets?year=&limit=&offset=` (client-side sets browser)
- `GET /v1/stats/top-artists?limit=` (client-side catalog)
- `GET /v1/stats/top-tracks?limit=` (client-side catalog)
- `GET /v1/evaluations/summary` (client-side evaluation summary)
- `GET /v1/flags` (client-side FeatureFlags)
- `GET /v1/evaluations?limit=5` (client-side recent findings)

### Backend requirement

Add CORS handling (e.g. `CORSMiddleware`) in your FastAPI app before deploying.

