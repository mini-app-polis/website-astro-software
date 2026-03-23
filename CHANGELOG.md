# 1.0.0 (2026-03-23)


### Bug Fixes

* add missing API endpoints to CORS documentation ([33821c4](https://github.com/kaianolevine/website-astro-software/commit/33821c4404d0c409c2913cacbffc13f0d3d6b81e))

# Changelog

## [0.3.1] - 2026-03-22
### Fixed
- Improved Pipeline Health run headers to show date and time
- Added per-finding timestamps to Pipeline Health page

## [0.3.0] - 2026-03-22
### Added
- Pipeline Health page with filterable evaluation findings
  grouped by run
- Pipeline nav link
### Fixed
- Project card layout on homepage — equal height cards

## [0.2.2] - 2026-03-19
### Added
- Live Feature Flags section to homepage

## [0.2.1] - 2026-03-19
### Changed
- Updated DJ Sets Platform project description to mention
  feature flags

## [0.2.0] - 2026-03-19
### Added
- Live Pipeline Evaluation section to homepage
- EvaluationSummary and RecentFindings components

## [0.1.6] - 2026-03-19
### Fixed
- Resume page Turnstile verification — show link after verify

## [0.1.5] - 2026-03-19
### Fixed
- TrackTable not rendering rows — updated TrackListItem
  interface to match full API response shape

## [0.1.4] - 2026-03-19
### Fixed
- SSR set detail page returning empty tracks — API base URL
  now resolves correctly in both SSR edge and browser contexts

## [0.1.3] - 2026-03-19
### Fixed
- MIME type error on /sets page — inlined API fetch logic
  in client-side scripts

## [0.1.2] - 2026-03-19
### Fixed
- Missing Base layout on all pages — data-api-url attribute
  now correctly appears on html tag

## [0.1.1] - 2026-03-19
### Changed
- Switched stats and catalog to client-side fetching

## [0.1.0] - 2026-03-19
### Added
- Initial build. Homepage with live stats, sets browser with
  year filter and pagination, SSR set detail pages, catalog
  with top artists and top tracks, project write-ups, resume
  with Turnstile gate. Deployed to Cloudflare Pages.
