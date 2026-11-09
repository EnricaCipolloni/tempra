# AGENTS.md

> **Ownership handover in progress.** Before any task, read [`HANDOVER.md`](./HANDOVER.md) and tell the owner which of its open steps still apply.

Canonical entry point for every AI coding agent working in this repository: Claude Code, Codex and GPT, Gemini CLI, Cursor, Copilot, Windsurf, Aider, opencode, Continue. If your tool reads `AGENTS.md` you are in the right place; if it reads its own file (`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.cursor/rules/`, `.windsurfrules`, `.aider.conf.yml`) that file points back here. Read this first; it is short on purpose. Everything deeper lives under [`docs/ai/`](./docs/ai/README.md).

## 1. What this repo is

Tempra is a static SvelteKit 2 / Svelte 5 app published on GitHub Pages at https://tempra.ventilii.dev, backed by a Supabase project (Postgres + Realtime) that the browser talks to directly with the publishable key. There is no server of our own. What `ls` and `package.json` cannot tell you:

- **Two actors, no accounts.** A coach owns a squad through a `coach_key` (random hex, created server-side, stored in the coach's browser and in the coach link). Athletes join with a six-character squad code and a display name. Every write goes through a `SECURITY DEFINER` RPC; see [`docs/ai/backend/README.md`](./docs/ai/backend/README.md).
- **Config travels one way.** Coach publishes `SquadConfig` to `squad_config`; athletes subscribe over Realtime (`postgres_changes` filtered by code) with a 20 s poll as fallback. `DEFAULT_SQUAD_CONFIG` in `src/lib/constants/config.constants.ts` mirrors `default_squad_config()` in the migration: change both together.
- **Games are self-contained components** under `src/lib/components/games/`, all taking the same `GameProps` (`difficulty`, `timePressure`, `onTrial`). The block runner mounts one per slot and unmounts it when the slot ends; a game never manages the block clock. Difficulty ladders are five-entry arrays read with `ladder(...)`.
- **Scoring is pure** (`src/lib/utils/scoring.utils.ts`) and unit-tested with the Node test runner; UI never recomputes it differently.
- **Everything user-visible is translated** (it, en, pt-BR) through `t({ locale, key })`; the catalog check runs inside `npm run lint`.
- **One build, three surfaces.** `build/` is the website (GitHub Pages) and the web layer of the Android and iOS apps (`android/`, `ios/`, Capacitor). Never branch behaviour on the platform unless a native capability requires it.
- **Live roster through Realtime presence**, not a table: who is online and in which game is announced on the squad channel; only completed blocks are rows (`results`).

## 2. Commands

```bash
npm ci             # once; the Claude session hook does it for you
npm run dev        # http://localhost:5173
npm run quality    # prettier --write + eslint --fix, then prettier --check + eslint + i18n catalogs
npm run check      # svelte-check: zero errors, zero warnings
npm test           # node --test over src/tests
npm run e2e        # Playwright against a mocked Supabase (npm run e2e:install once)
npm run build      # static export to build/ (CI also asserts build/CNAME)
npm run cap:sync   # build + copy into android/ and ios/ (only when touching the shells)
```

All five gates (`quality`, `check`, `test`, `e2e`, `build`) pass before a PR. Details: [`docs/ai/pr-and-ci.md`](./docs/ai/pr-and-ci.md).

## 3. Layout

`src/routes/` pages, `src/lib/{components,constants,services,stores,types,utils}` the app, `src/tests/` unit specs, `e2e/` Playwright specs with the Supabase mock, `supabase/migrations/` the database, `scripts/` the catalog check and the test resolver, `android/` and `ios/` the Capacitor shells, `static/` fonts, icons and `CNAME`. Full taxonomy and dependency direction: [`docs/ai/structure.md`](./docs/ai/structure.md).

## 4. The code standard

Every change follows the universal standard in Officina: **https://github.com/AntonioVentilii/officina/blob/main/standards/code.md** (rules 1 to 14 and the truth hierarchy). It is the only copy; this repository never restates it. What follows are only Tempra's additions to it.

1. **Reuse first.** Check [`docs/ai/reusability.md`](./docs/ai/reusability.md) before writing anything. Primitives live in `src/app.css` (`.card`, `.btn`, `.kpi`, `.input`, `.badge`, `.stim`, `.answers`) and `src/lib/components/ui/`. Add a Tailwind utility before a new class, a new class before a new component.
2. **Svelte 5 runes only.** `$props()` with a named `interface Props`, `$state`, `$derived`, `$effect`. No `export let`, no `$:`. Values derived from props are `$derived`, never plain `const` (svelte-check flags the capture as `state_referenced_locally`, and CI treats the repo as warning-free).
3. **Game loops live in `onMount`**, not `$effect`, so writes to `$state` inside the loop cannot retrigger it. Clean up in the returned function and resolve any pending trial gate.
4. **Nullish checks** use `isNullish` / `nonNullish` from `$lib/utils/nullish.utils`; eslint rejects direct `null` / `undefined` comparisons.
5. **Import through `$lib/...`**, never relative paths across folders.
6. **UI copy is short, clear and human, in every locale.** Athletes read it out of breath; explanations go behind an `InfoTip`.
7. **Mobile first.** The athlete screen is used one-handed, sweating, at arm's length: large targets, high contrast, verify at 390px.
8. **The Supabase publishable key** in `src/lib/constants/supabase.constants.ts` is public by design. Never add a service-role key anywhere in this repo.
9. **Ask before a spec-first workflow** for a net-new feature; for small changes implement directly.

## 5. Where to look

| You are about to...                           | Read first                                                                                     |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Open any PR                                   | [`docs/ai/pr-and-ci.md`](./docs/ai/pr-and-ci.md)                                               |
| Write any new function, component or constant | [`docs/ai/reusability.md`](./docs/ai/reusability.md)                                           |
| Create a file or decide where code goes       | [`docs/ai/structure.md`](./docs/ai/structure.md)                                               |
| Write state, a service call or a loop         | [`docs/ai/patterns.md`](./docs/ai/patterns.md)                                                 |
| Write or change a test                        | [`docs/ai/testing.md`](./docs/ai/testing.md)                                                   |
| Understand shipped behaviour                  | [`docs/ai/PRODUCT.md`](./docs/ai/PRODUCT.md)                                                   |
| Touch a frontend file, a game, copy or styles | [`docs/ai/frontend/README.md`](./docs/ai/frontend/README.md)                                   |
| Touch the schema, RPCs, keys or realtime      | [`docs/ai/backend/README.md`](./docs/ai/backend/README.md)                                     |
| Add a game                                    | [`docs/ai/workflows/add-a-game.md`](./docs/ai/workflows/add-a-game.md)                         |
| Add a coach parameter                         | [`docs/ai/workflows/add-a-remote-parameter.md`](./docs/ai/workflows/add-a-remote-parameter.md) |
| Change a table or an RPC                      | [`docs/ai/workflows/change-the-schema.md`](./docs/ai/workflows/change-the-schema.md)           |
| Add copy or a language                        | [`docs/ai/workflows/add-copy-or-a-locale.md`](./docs/ai/workflows/add-copy-or-a-locale.md)     |
| Check what you may change without asking      | [`docs/ai/governance.md`](./docs/ai/governance.md)                                             |

## 6. Truth hierarchy

Code, then CI, then `docs/ai/**`, then this file, then the tool layers (`CLAUDE.md`, `GEMINI.md`, Copilot, Cursor, Windsurf, Aider files). The full order and how to resolve a contradiction: [`docs/ai/governance.md`](./docs/ai/governance.md#truth-hierarchy). On a contradiction, stop and ask, or fix the lower source in its own change.

## 7. Meta-update rule

A PR that introduces a new pattern, shared component, game, parameter, naming convention, policy or workflow updates the matching page under `docs/ai/` in the same PR (the map of which page is in [`docs/ai/governance.md`](./docs/ai/governance.md#meta-update-map)). `PRODUCT.md` changes in the same PR as any behaviour change.
