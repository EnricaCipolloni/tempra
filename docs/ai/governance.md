# Governance

## Truth hierarchy

The order is the one in the universal standard (https://github.com/AntonioVentilii/officina/blob/main/standards/code.md#truth-hierarchy). In this repository it reads:

1. The code (`src/**`, `supabase/migrations/**`, `scripts/**`, `e2e/**`).
2. CI workflows (`.github/workflows/**`), with `checks-pass` the single required status.
3. `CODEOWNERS`: none today (removed in `e812aa3`); the ruleset's code owner review stays inactive until one exists.
4. This folder (`docs/ai/**`).
5. [`AGENTS.md`](../../AGENTS.md) and the universal standard.
6. Tool-specific layers: `CLAUDE.md` and `.claude/` (Claude Code), `GEMINI.md` (Gemini CLI), `.github/copilot-instructions.md` (Copilot), `.cursor/rules/tempra.mdc` (Cursor), `.windsurfrules` (Windsurf), `.aider.conf.yml` (Aider). Codex, opencode and Continue read `AGENTS.md` directly. Each layer is a thin pointer and never contradicts 1 to 5; new substance lands in `docs/ai/` first, then the pointers are updated in the same PR.

A contradiction is a bug in the lower-ranked source: stop and ask the owner, or fix it in its own change.

## Allowed without asking

- Edit anything under `src/lib/**`, `src/routes/**`, `src/app.css`, `src/app.html`, `src/service-worker.ts`, `src/tests/**`, `e2e/**`.
- Add a game component under `src/lib/components/games/` and register it (see [`workflows/add-a-game.md`](./workflows/add-a-game.md)).
- Add i18n keys to every catalog.
- Update `docs/ai/**` when the meta-update rule fires.
- Run any `npm run …` script.

## Ask first

- A net-new feature: ask before using a spec-first workflow; small changes are implemented directly.
- A new dependency, a new top-level folder, a new layer under `src/lib/`, or a new store or service that overlaps an existing one.
- Anything that branches behaviour on the platform (web, Android, iOS) beyond a native capability.
- Any automatic deletion of data (see [`backend/README.md`](./backend/README.md#retention)).

## Protected paths (change only when the task names them)

| Path                                                                                                        | Reason                                                                            |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `.github/workflows/**`, `.github/dependabot.yml`                                                            | CI and deploy integrity; `ci(...)` PRs only.                                      |
| `package.json` dependencies, `package-lock.json`                                                            | New or upgraded dependencies need an explicit ask.                                |
| `supabase/migrations/**`                                                                                    | Append-only history of the live database. Never edit an applied file.             |
| `src/lib/constants/supabase.constants.ts`                                                                   | Project URL and publishable key. Rotate deliberately, never casually.             |
| `src/lib/constants/legal.constants.ts`                                                                      | Operator name and contact: set by the owner before a store release.               |
| `static/CNAME`                                                                                              | The custom domain; DNS points here.                                               |
| `capacitor.config.ts`, `android/**`, `ios/**`                                                               | App ID and native projects; the App ID is fixed after the first store submission. |
| `eslint.config.js`, `eslint-suppressions.json`, `knip.jsonc`, `.jscpd.json`, `.prettierrc`, `tsconfig.json` | Lint, format and TS policy; the quality gate baseline only shrinks.               |
| `release-please-config.json`, `.release-please-manifest.json`, `CHANGELOG.md`                               | Owned by release-please.                                                          |
| `HANDOVER.md`                                                                                               | The owner's checklist; tick boxes only when a step is really done.                |

## Generated paths (never edit by hand)

- `build/`, `.svelte-kit/`, `node_modules/`, `test-results/`, `playwright-report/`: outputs of the build, `svelte-kit sync`, npm and Playwright, all gitignored.
- The web assets Capacitor copies into `android/` and `ios/` on `npm run cap:sync` (gitignored inside each shell). The plugin manifests it rewrites (`ios/App/CapApp-SPM/Package.swift`, `android/capacitor.settings.gradle`, `android/app/capacitor.build.gradle`) are committed, but only as `cap:sync` writes them.
- `CHANGELOG.md` and the `version` field of `package.json`: written by release-please.

## Forbidden

- Any secret in the repo: service-role keys, database passwords, tokens, keystores, signing certificates. The publishable key is the only key allowed and it is public by design.
- Disabling an eslint rule, suppressing a svelte-check warning or using `any` to get past a type.
- Force-pushing or rewriting shared history without an explicit, named ask.
- Reading or writing another coach's squad from the client without the coach key (the RPCs enforce it; do not add policies that bypass them).
- Merging a PR or turning on auto-merge unless the owner says so: PRs are merged by hand.

## Meta-update map

A PR that introduces a new pattern, shared component, game, remote parameter, naming convention, workflow or policy updates the matching page in the same PR, with the smallest delta that keeps the next agent from rediscovering it.

| The change adds or alters...                          | Update                                       |
| ----------------------------------------------------- | -------------------------------------------- |
| Shipped behaviour, a game, a parameter, a ladder      | [`PRODUCT.md`](./PRODUCT.md)                 |
| A shared component, util, service, store, type, class | [`reusability.md`](./reusability.md)         |
| A folder, a layer, an import direction                | [`structure.md`](./structure.md)             |
| A way of handling state, I/O, errors or loops         | [`patterns.md`](./patterns.md)               |
| Test layout, a mock, a test command                   | [`testing.md`](./testing.md)                 |
| A gate, a CI job, a title scope, a release step       | [`pr-and-ci.md`](./pr-and-ci.md)             |
| The game contract, i18n, tokens, copy rules, shells   | [`frontend/README.md`](./frontend/README.md) |
| A table, an RPC, a grant, realtime, retention, keys   | [`backend/README.md`](./backend/README.md)   |
| A recurring kind of change with several steps         | a page under [`workflows/`](./workflows/)    |
| A protected path, a permission, a tool layer          | this page, then the pointers in the same PR  |
