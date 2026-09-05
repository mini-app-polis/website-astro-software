## [2.0.3](https://github.com/mini-app-polis/website-astro-software/compare/v2.0.2...v2.0.3) (2026-09-05)


### Bug Fixes

* **deps:** pin @astrojs/check to an exact version ([0e0c79a](https://github.com/mini-app-polis/website-astro-software/commit/0e0c79a0c18a32b0c270c9d8807f34c622938991))

## [2.0.2](https://github.com/mini-app-polis/website-astro-software/compare/v2.0.1...v2.0.2) (2026-09-04)


### Bug Fixes

* **deploy:** drop the unused Cloudflare adapter that 404'd the site ([1cea591](https://github.com/mini-app-polis/website-astro-software/commit/1cea591c24063ea4a8257b2ea6a32e7619fcffa0))

## [2.0.1](https://github.com/mini-app-polis/website-astro-software/compare/v2.0.0...v2.0.1) (2026-09-04)


### Bug Fixes

* **deps:** bump js-yaml from 4.3.2 to 5.4.1 ([dc6fe58](https://github.com/mini-app-polis/website-astro-software/commit/dc6fe582ef35180cf80456a00fe2e3a40589997a))

# [2.0.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.26.1...v2.0.0) (2026-09-04)


* fix(deps)!: upgrade to astro 7 and clear 11 security advisories ([b4ad2b5](https://github.com/mini-app-polis/website-astro-software/commit/b4ad2b5a0e33fa24bdaed44bd8f503f2efc3fd99)), closes [#ffb020](https://github.com/mini-app-polis/website-astro-software/issues/ffb020) [#0f121a](https://github.com/mini-app-polis/website-astro-software/issues/0f121a) [#0b0c0f](https://github.com/mini-app-polis/website-astro-software/issues/0b0c0f)


### BREAKING CHANGES

* deploys move from Cloudflare Pages to Cloudflare
Workers. The Cloudflare side of that cutover is not in this commit.

npm audit reported 11 vulnerabilities, 7 high. These are not
dev-server issues: on a hybrid site behind the Cloudflare adapter the
live ones include SSRF via the /_image endpoint, reflected XSS via
server islands, Host-header SSRF in the prerendered error page fetch,
and authentication bypass via double URL encoding. audit now reports
zero.

There was no cheaper route. astro is a direct dependency, so the
overrides trick used elsewhere in the fleet does not apply, and the
lowest astro that clears the highs is 6.4.6. @astrojs/tailwind cannot
follow it — 6.0.2 is its last release and it peers on astro ^3 || ^4
|| ^5 — so Tailwind 4 comes along whether or not it was wanted.

  astro                4.16.19 -> 7.3.1
  @astrojs/cloudflare  11.2.0  -> 14.3.0
  @astrojs/tailwind    removed, replaced by @tailwindcss/vite
  tailwindcss          3 -> 4
  autoprefixer, postcss  removed (Tailwind 4's plugin does both)

Four things changed shape:

output "hybrid" is gone in astro 5. "static" with an adapter is its
exact replacement — pages prerender by default, `prerender = false`
opts out. No page here opts out, so the built output is unchanged.

Tailwind is configured in CSS now. tailwind.config.mjs is deleted and
its theme.extend values move into @theme in global.css, under the
namespaces v4 reads. darkMode: "class" becomes @custom-variant. No
`dark:` utility is used today, but Base.astro sets class="dark", so
the variant is kept for parity.

wrangler.toml becomes a Workers config. @astrojs/cloudflare v11 was
the last release supporting Pages; v12 onward targets Workers with
static assets, and the /_image SSRF is only fixed in v12.6.6+. So no
version combination clears this audit and stays on Pages. `main` is
deliberately not declared: the adapter generates the worker entry at
build time and wrangler validates the field before that exists.

Verified: build produces all 9 pages, audit is clean, and the

## [1.26.1](https://github.com/mini-app-polis/website-astro-software/compare/v1.26.0...v1.26.1) (2026-09-04)


### Bug Fixes

* **git:** never three-way merge a lockfile ([2b7e0ac](https://github.com/mini-app-polis/website-astro-software/commit/2b7e0acf0fad09f08081fee828d09b849f790ec5))

# [1.26.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.25.0...v1.26.0) (2026-09-04)


### Features

* **deps:** automate dependency updates ([5edd131](https://github.com/mini-app-polis/website-astro-software/commit/5edd1319fbcce8583e31d0172756d2123ef00087))

# [1.25.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.24.2...v1.25.0) (2026-09-04)


### Features

* **security:** call the shared security workflow, clear 10 advisories ([3f9f712](https://github.com/mini-app-polis/website-astro-software/commit/3f9f712f1067f6c4773a8f08ffc5712c6a14a3cb))

## [1.24.2](https://github.com/mini-app-polis/website-astro-software/compare/v1.24.1...v1.24.2) (2026-08-16)


### Bug Fixes

* adding products page ([7f7b016](https://github.com/mini-app-polis/website-astro-software/commit/7f7b016fe42baf6ccd63d9234ed26b2d33d8f117))

## [1.24.1](https://github.com/mini-app-polis/website-astro-software/compare/v1.24.0...v1.24.1) (2026-08-16)


### Bug Fixes

* adding products page ([2cfc8e5](https://github.com/mini-app-polis/website-astro-software/commit/2cfc8e507eb40650027e3d68fb5dfe7108e85354))

# [1.24.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.23.2...v1.24.0) (2026-08-16)


### Features

* adding products page ([436b02f](https://github.com/mini-app-polis/website-astro-software/commit/436b02f7f47200c4b7224e8f6d8470aa12e16f13))

## [1.23.2](https://github.com/mini-app-polis/website-astro-software/compare/v1.23.1...v1.23.2) (2026-05-12)


### Bug Fixes

* **standards:** resolve homepage standards version from repo, not findings ([777623c](https://github.com/mini-app-polis/website-astro-software/commit/777623cb26eadd6456a57c69d27e9b367a831ae4))

## [1.23.1](https://github.com/mini-app-polis/website-astro-software/compare/v1.23.0...v1.23.1) (2026-04-24)


### Bug Fixes

* show full run_id in pipeline finding cards ([a1e67fd](https://github.com/mini-app-polis/website-astro-software/commit/a1e67fdce6fadfb10c1ad3495ee1c506d1d058d7))

# [1.23.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.22.2...v1.23.0) (2026-04-24)


### Features

* sort standards domains alphabetically and drop service descriptions from ecosystem page ([9eb8ea9](https://github.com/mini-app-polis/website-astro-software/commit/9eb8ea9778cf20866ea6da39a607b538420743eb))

## [1.22.2](https://github.com/mini-app-polis/website-astro-software/compare/v1.22.1...v1.22.2) (2026-04-24)


### Bug Fixes

* let astro bundle component scripts so shared lib imports resolve ([9a4759d](https://github.com/mini-app-polis/website-astro-software/commit/9a4759dde73dfdd419e6aa15c5ff210a7f7dd383))

## [1.22.1](https://github.com/mini-app-polis/website-astro-software/compare/v1.22.0...v1.22.1) (2026-04-23)


### Bug Fixes

* **standards-browser:** fetch from raw.githubusercontent.com, not Contents API ([e7f08ea](https://github.com/mini-app-polis/website-astro-software/commit/e7f08ea7770b91b33a90d63d2da9880d4e827bf3))

# [1.22.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.21.1...v1.22.0) (2026-04-23)


### Features

* **pipeline:** sort findings by severity within each run ([733c615](https://github.com/mini-app-polis/website-astro-software/commit/733c61586aca764275cbc523fbbb8f302f8a55e7))

## [1.21.1](https://github.com/mini-app-polis/website-astro-software/compare/v1.21.0...v1.21.1) (2026-04-23)


### Bug Fixes

* **pipeline:** cluster sweep sources by flow for supersede logic ([2602fa6](https://github.com/mini-app-polis/website-astro-software/commit/2602fa6767e597c449ea2e88d696a6c75630c2dd))

# [1.21.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.20.0...v1.21.0) (2026-04-23)


### Features

* **pipeline:** source-dependent latest-run filter ([fba896f](https://github.com/mini-app-polis/website-astro-software/commit/fba896f9c3065921406122b58f63b95789c3a55d))

# [1.20.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.19.0...v1.20.0) (2026-04-23)


### Features

* **evaluation-summary:** add All aggregate tab ([a2baed3](https://github.com/mini-app-polis/website-astro-software/commit/a2baed36716bbbd3f5a3e933b1e2ab8785b40f71))

# [1.19.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.18.0...v1.19.0) (2026-04-23)


### Features

* **nav:** pipeline dropdown + trim pipeline page chrome ([b00ae7b](https://github.com/mini-app-polis/website-astro-software/commit/b00ae7bb3081e47bd32f93f38e36e9d65cdd1a76))

# [1.18.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.17.0...v1.18.0) (2026-04-23)


### Features

* **pipeline:** add sub-tabs + redesign filtered counts card ([8913509](https://github.com/mini-app-polis/website-astro-software/commit/8913509243f8fde8483c4243b97dbc13c7f1746a))

# [1.17.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.16.2...v1.17.0) (2026-04-23)


### Features

* **pipeline:** move Summary to its own page, add filtered counts strip ([edc5079](https://github.com/mini-app-polis/website-astro-software/commit/edc5079659c93b851ef2e456b569a0b9d119a3ab))

## [1.16.2](https://github.com/mini-app-polis/website-astro-software/compare/v1.16.1...v1.16.2) (2026-04-22)


### Bug Fixes

* **pipeline:** scope Findings list to latest run per (repo, source) ([5ecfa07](https://github.com/mini-app-polis/website-astro-software/commit/5ecfa074a8c1fbd147f21e3e2db5660eaee66415))

## [1.16.1](https://github.com/mini-app-polis/website-astro-software/compare/v1.16.0...v1.16.1) (2026-04-21)


### Bug Fixes

* pagination issue for findings ([ced868e](https://github.com/mini-app-polis/website-astro-software/commit/ced868e7ac9b0f58a9f006f2a3a271c85a02ab42))

# [1.16.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.15.1...v1.16.0) (2026-04-21)


### Features

* adding 4th bucket, adding view by rule ([8e66093](https://github.com/mini-app-polis/website-astro-software/commit/8e660932278edc0b3d8605a93e9926eaa60d33ab))

## [1.15.1](https://github.com/mini-app-polis/website-astro-software/compare/v1.15.0...v1.15.1) (2026-04-21)


### Bug Fixes

* regroupings based on current data labels ([86df450](https://github.com/mini-app-polis/website-astro-software/commit/86df4504b1f0c8a4f33f658f9b551e11c2cbfd0d))

# [1.15.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.14.0...v1.15.0) (2026-04-12)


### Features

* **summary:** add CRITICAL and SUCCESS severity support to EvaluationSummary ([ebe2308](https://github.com/mini-app-polis/website-astro-software/commit/ebe230824eb8bc16038fb21a1f3df5cb459cc1a9))

# [1.14.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.13.0...v1.14.0) (2026-04-12)


### Features

* **pipeline:** add CRITICAL and SUCCESS severity — colors, filter buttons, pinning logic ([87b29cf](https://github.com/mini-app-polis/website-astro-software/commit/87b29cf051d7a2796e9c5a0baebc62b8a77b76dd))

# [1.13.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.12.1...v1.13.0) (2026-04-10)


### Features

* **pipeline:** render violation_id as severity-colored pill ([0266fdd](https://github.com/mini-app-polis/website-astro-software/commit/0266fddef9328cba46d78e7356f7e87bfe0e2aa1))

## [1.12.1](https://github.com/mini-app-polis/website-astro-software/compare/v1.12.0...v1.12.1) (2026-04-10)


### Bug Fixes

* **pipeline:** remove redundant per-card timestamps — time shown at run group header level ([7c4d5fe](https://github.com/mini-app-polis/website-astro-software/commit/7c4d5fe7bd60b938fe32712f63fea329d174e2c2))

# [1.12.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.11.0...v1.12.0) (2026-04-10)


### Features

* **pipeline:** show violation_id on findings cards; unify timestamp to footer row ([3e2e7a7](https://github.com/mini-app-polis/website-astro-software/commit/3e2e7a7d1cf743e4ab1fd530bea66eabf3e26d92))

# [1.11.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.10.0...v1.11.0) (2026-04-09)


### Features

* break EvaluationSummary down by run type with per-bucket counts ([56269d7](https://github.com/mini-app-polis/website-astro-software/commit/56269d7bf7249bb5f5b66002c1dc771f6f0535a4))

# [1.10.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.9.4...v1.10.0) (2026-04-09)


### Bug Fixes

* hydrate standards version badge client-side from evaluations API ([7bf2ab1](https://github.com/mini-app-polis/website-astro-software/commit/7bf2ab1944c75dbdfee41a16a0d83f27d7ae4f11))


### Features

* add run type filter to pipeline findings browser ([43b9de1](https://github.com/mini-app-polis/website-astro-software/commit/43b9de124c496188e51e0577f9fd8127602eb6fa))

## [1.9.4](https://github.com/mini-app-polis/website-astro-software/compare/v1.9.3...v1.9.4) (2026-04-05)


### Bug Fixes

* addressing findings ([516d9bd](https://github.com/mini-app-polis/website-astro-software/commit/516d9bd127bc675aa5137c641cdf0270ca49a212))

## [1.9.3](https://github.com/mini-app-polis/website-astro-software/compare/v1.9.2...v1.9.3) (2026-04-05)


### Bug Fixes

* 2 hardcoded strings, and repo filter on pipeline ([01ea3a4](https://github.com/mini-app-polis/website-astro-software/commit/01ea3a4c13a30cce456176e24143b77cbb18b7ac))

## [1.9.2](https://github.com/mini-app-polis/website-astro-software/compare/v1.9.1...v1.9.2) (2026-04-05)


### Bug Fixes

* scope evaluation summary to latest run per source type ([c72a524](https://github.com/mini-app-polis/website-astro-software/commit/c72a52495b75f0f7234a655b01029c5a98b1d9c9))

## [1.9.1](https://github.com/mini-app-polis/website-astro-software/compare/v1.9.0...v1.9.1) (2026-04-02)


### Bug Fixes

* og image url ([0b835ed](https://github.com/mini-app-polis/website-astro-software/commit/0b835ed96eb7a46fabdc29b5e0d4456f263743da))

# [1.9.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.16...v1.9.0) (2026-04-02)


### Features

* adding og image ([50c314f](https://github.com/mini-app-polis/website-astro-software/commit/50c314f0b18467fc463793c5d5bcd2db5273f183))

## [1.8.16](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.15...v1.8.16) (2026-04-01)


### Bug Fixes

* updated projects setup ([7b6ad1d](https://github.com/mini-app-polis/website-astro-software/commit/7b6ad1d6a895b6b6f09fc7327139f6301869bfce))

## [1.8.15](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.14...v1.8.15) (2026-04-01)


### Bug Fixes

* updated projects setup ([7c4088b](https://github.com/mini-app-polis/website-astro-software/commit/7c4088be26c296c004d55101de505af27f225259))

## [1.8.14](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.13...v1.8.14) (2026-04-01)


### Bug Fixes

* updated projects setup ([7b9f9eb](https://github.com/mini-app-polis/website-astro-software/commit/7b9f9eb148d65f750e5aa6c77f4c8688ae706f9f))

## [1.8.13](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.12...v1.8.13) (2026-04-01)


### Bug Fixes

* eco report ([b701af9](https://github.com/mini-app-polis/website-astro-software/commit/b701af950f6eaae60b8f41c43afd0109f945e4b3))

## [1.8.12](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.11...v1.8.12) (2026-04-01)


### Bug Fixes

* eco report ([804a9ad](https://github.com/mini-app-polis/website-astro-software/commit/804a9ad462730d9adfa16c603f4854154c9c2f56))

## [1.8.11](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.10...v1.8.11) (2026-04-01)


### Bug Fixes

* load standards via GitHub contents API ([d179ca0](https://github.com/mini-app-polis/website-astro-software/commit/d179ca0a08dd64ae2547c30117ab47176f74ddc1))

## [1.8.10](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.9...v1.8.10) (2026-04-01)


### Bug Fixes

* refresh lockfile for js-yaml imports ([da61f2a](https://github.com/mini-app-polis/website-astro-software/commit/da61f2aadfac390d6db8ca124b1ab1ae9a8e65a7))

## [1.8.9](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.8...v1.8.9) (2026-04-01)


### Bug Fixes

* updating api url ([7cf93ff](https://github.com/mini-app-polis/website-astro-software/commit/7cf93fff5e6bc71ac23440add7c8f1648cf617e2))

## [1.8.8](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.7...v1.8.8) (2026-04-01)


### Bug Fixes

* adjusting ecosystem fetch at build ([988a61d](https://github.com/mini-app-polis/website-astro-software/commit/988a61d318a69e524da35e23908d470d5f169cdc))

## [1.8.7](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.6...v1.8.7) (2026-03-31)


### Bug Fixes

* adding content back to homepage ([625b863](https://github.com/mini-app-polis/website-astro-software/commit/625b86372004fe572e85cd8d4eb7058a01195f82))

## [1.8.6](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.5...v1.8.6) (2026-03-31)


### Bug Fixes

* removing details from homepage ([35a9e88](https://github.com/mini-app-polis/website-astro-software/commit/35a9e8875d3cdf058597f059ff4cdefc0d09df1c))

## [1.8.5](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.4...v1.8.5) (2026-03-31)


### Bug Fixes

* reconnecting after an api update ([f54a37d](https://github.com/mini-app-polis/website-astro-software/commit/f54a37d3f7029d68c036c125efb3ab38e6a75789))

## [1.8.4](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.3...v1.8.4) (2026-03-31)


### Bug Fixes

* reconnecting after an api update ([63cb120](https://github.com/mini-app-polis/website-astro-software/commit/63cb12071945b17e3791188b7e00d693dbcf6bf5))

## [1.8.3](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.2...v1.8.3) (2026-03-31)


### Bug Fixes

* findings and summary update ([9aa6dec](https://github.com/mini-app-polis/website-astro-software/commit/9aa6dece1cfe4e1872123d1947699e738449a860))

## [1.8.2](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.1...v1.8.2) (2026-03-31)


### Bug Fixes

* updating filtering for findings ([4c5ec24](https://github.com/mini-app-polis/website-astro-software/commit/4c5ec24f31b92148b173a0a23c78729f1e19ec31))

## [1.8.1](https://github.com/mini-app-polis/website-astro-software/compare/v1.8.0...v1.8.1) (2026-03-31)


### Bug Fixes

* rebuilds both filter button sets on every page ([55dfb0e](https://github.com/mini-app-polis/website-astro-software/commit/55dfb0e0cc6c5d6b275e820ba2ca44e34ed548d3))

# [1.8.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.7.4...v1.8.0) (2026-03-30)


### Features

* adding ecosystem standards at build time ([0c79ed9](https://github.com/mini-app-polis/website-astro-software/commit/0c79ed97c5fc1fb20f6bde60cd4e447f67c79490))

## [1.7.4](https://github.com/mini-app-polis/website-astro-software/compare/v1.7.3...v1.7.4) (2026-03-30)


### Bug Fixes

* footer formatting ([fa4e6e1](https://github.com/mini-app-polis/website-astro-software/commit/fa4e6e1a46e21e50df955d7ea62c64e09cc72859))

## [1.7.3](https://github.com/mini-app-polis/website-astro-software/compare/v1.7.2...v1.7.3) (2026-03-30)


### Bug Fixes

* footer format ([6624eee](https://github.com/mini-app-polis/website-astro-software/commit/6624eee398a4720d4874caa14ef67b47868ad90b))

## [1.7.2](https://github.com/mini-app-polis/website-astro-software/compare/v1.7.1...v1.7.2) (2026-03-30)


### Bug Fixes

* footer version ([412164d](https://github.com/mini-app-polis/website-astro-software/commit/412164de55e54b02a2de5869375df5cef80dbf04))

## [1.7.1](https://github.com/mini-app-polis/website-astro-software/compare/v1.7.0...v1.7.1) (2026-03-29)


### Bug Fixes

* link to music data ([c03c3db](https://github.com/mini-app-polis/website-astro-software/commit/c03c3db18b3b8be416e21d6cc5ac44ed59a98ee9))

# [1.7.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.6.0...v1.7.0) (2026-03-29)


### Features

* removing wcs heavy content for display ([bd79a9b](https://github.com/mini-app-polis/website-astro-software/commit/bd79a9b2fd0ee87129f7071642eee5d6a8371447))

# [1.6.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.5.0...v1.6.0) (2026-03-29)


### Features

* **pipeline:** build repo filter buttons from API data ([1fbc123](https://github.com/mini-app-polis/website-astro-software/commit/1fbc1237589993baa0de321006f25ef0e60dfab3))

# [1.5.0](https://github.com/mini-app-polis/website-astro-software/compare/v1.4.3...v1.5.0) (2026-03-29)


### Features

* **pipeline:** show repo badge on finding cards ([c808b87](https://github.com/mini-app-polis/website-astro-software/commit/c808b87883da33a0b6775e1bdc8b003496a2c6ad))

## [1.4.3](https://github.com/mini-app-polis/website-astro-software/compare/v1.4.2...v1.4.3) (2026-03-29)


### Bug Fixes

* adding repo badge to findings ([0e2459f](https://github.com/mini-app-polis/website-astro-software/commit/0e2459ff51f50e7cd89932b9d42d0cc40974408d))
* urls ([fa2a2ed](https://github.com/mini-app-polis/website-astro-software/commit/fa2a2edf319050a42e6b40141046b4ab6d4d722d))

## [1.4.2](https://github.com/kaianolevine/website-astro-software/compare/v1.4.1...v1.4.2) (2026-03-29)


### Bug Fixes

* content update ([87b0cac](https://github.com/kaianolevine/website-astro-software/commit/87b0cacfe6ae64f0148f4538b9212caec290a285))

## [1.4.1](https://github.com/kaianolevine/website-astro-software/compare/v1.4.0...v1.4.1) (2026-03-26)


### Bug Fixes

* api url ([8503077](https://github.com/kaianolevine/website-astro-software/commit/8503077c5233caf28860dd183a89e29d5eed2f7c))

# [1.4.0](https://github.com/kaianolevine/website-astro-software/compare/v1.3.0...v1.4.0) (2026-03-25)


### Features

* adding booking page ([bd36bbd](https://github.com/kaianolevine/website-astro-software/commit/bd36bbd69d1c826ca12d4f78c04470a1b512f0ba))

# [1.3.0](https://github.com/kaianolevine/website-astro-software/compare/v1.2.0...v1.3.0) (2026-03-23)


### Features

* adding flow name information ([e3ff2d3](https://github.com/kaianolevine/website-astro-software/commit/e3ff2d30287ff003e6e47e16e0f4396338dbcb75))

# [1.2.0](https://github.com/kaianolevine/website-astro-software/compare/v1.1.1...v1.2.0) (2026-03-23)


### Features

* surface it as a badge on each finding ([db69d80](https://github.com/kaianolevine/website-astro-software/commit/db69d80e326ac3af4ae0d3baaf74263a751020d4))

## [1.1.1](https://github.com/kaianolevine/website-astro-software/compare/v1.1.0...v1.1.1) (2026-03-23)


### Bug Fixes

* managing updates for eval ui ([b419e61](https://github.com/kaianolevine/website-astro-software/commit/b419e61acdd4fec593469ad1775e19bfcafa5d5b))

# [1.1.0](https://github.com/kaianolevine/website-astro-software/compare/v1.0.0...v1.1.0) (2026-03-23)


### Features

* adding live music page ([09103c3](https://github.com/kaianolevine/website-astro-software/commit/09103c31d74eaab77c6e56ed41a50dc01bb3fb1a))

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
