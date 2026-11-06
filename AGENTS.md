# AGENTS.md

> **Ownership handover in progress.** Before any task, read [`HANDOVER.md`](./HANDOVER.md) and tell the owner which of its open steps still apply.

Canonical entry point for every AI coding agent working in this repository: Claude Code, Codex and GPT, Gemini CLI, Cursor, Copilot, Windsurf, Aider, opencode, Continue. If your tool reads `AGENTS.md` you are in the right place; if it reads its own file (`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.cursor/rules/`, `.windsurfrules`, `.aider.conf.yml`) that file points back here. Read this first; it is short on purpose. Everything deeper lives under [`docs/ai/`](./docs/ai/).

## 1. What this repo is

Tempra is a static SvelteKit 2 / Svelte 5 app published on GitHub Pages at https://tempra.ventilii.dev, backed by a Supabase project (Postgres + Realtime) that the browser talks to directly with the publishable key. There is no server of our own. What `ls` and `package.json` cannot tell you:

- **Two actors, no accounts.** A coach owns a squad through a `coach_key` (random hex, created server-side, stored in the coach's browser and in the coach link). Athletes join with a six-character squad code and a display name. Every write goes through a `SECURITY DEFINER` RPC; see [`docs/ai/backend/README.md`](./docs/ai/backend/README.md).
- **Config travels one way.** Coach publishes `SquadConfig` to `squad_config`; athletes subscribe over Realtime (`postgres_changes` filtered by code) with a 20 s poll as fallback. `DEFAULT_SQUAD_CONFIG` in `src/lib/constants/config.constants.ts` mirrors `default_squad_config()` in the migration: change both together.
- **Games are self-contained components** under `src/lib/components/games/`, all taking the same `GameProps` (`difficulty`, `timePressure`, `onTrial`). The block runner mounts one per slot and unmounts it when the slot ends; a game never manages the block clock. Difficulty ladders are five-entry arrays read with `ladder(...)`.
- **Scoring is pure** (`src/lib/utils/scoring.utils.ts`) and unit-tested with the Node test runner; UI never recomputes it differently.
- **Everything user-visible is translated** (it, en, pt-BR) through `t({ locale, key })`; the catalog check runs inside `npm run lint`.
- **One build, three surfaces.** `build/` is the website (GitHub Pages) and the web layer of the Android and iOS apps (`android/`, `ios/`, Capacitor). Never branch behaviour on the platform unless a native capability requires it.
- **Live roster through Realtime presence**, not a table: who is online and in which game is announced on the squad channel; only completed blocks are rows (`results`).

## 2. Commandments

1. **Reuse first.** Primitives live in `src/app.css` (`.card`, `.btn`, `.kpi`, `.input`, `.badge`, `.stim`, `.answers`) and `src/lib/components/ui/`. Add a Tailwind utility before a new class, a new class before a new component.
2. **Svelte 5 runes only.** `$props()` with a named `interface Props`, `$state`, `$derived`, `$effect`. No `export let`, no `$:`. Values derived from props are `$derived`, never plain `const` (svelte-check flags the capture).
3. **Game loops live in `onMount`**, not `$effect`, so writes to `$state` inside the loop cannot retrigger it. Clean up in the returned function and resolve any pending trial gate.
4. **Nullish checks** use `isNullish` / `nonNullish` from `$lib/utils/nullish.utils`; eslint rejects direct `null` / `undefined` comparisons.
5. **Import through `$lib/...`**, never relative paths across folders.
6. **No AI attribution** in commits or PRs. No em dashes in prose or UI copy. UI copy is short, clear and human, in every locale.
7. **Mobile first.** The athlete screen is used one-handed, sweating, at arm's length: large targets, high contrast, verify at 390px.
8. **Run the gates** before opening a PR: `npm run quality`, `npm run check`, `npm test`, `npm run e2e`, `npm run build`.

## 3. Where to look

| You are about to...                       | Read first                                                   |
| ----------------------------------------- | ------------------------------------------------------------ |
| Open any PR                               | [`docs/ai/pr-and-ci.md`](./docs/ai/pr-and-ci.md)             |
| Understand shipped behaviour              | [`docs/ai/PRODUCT.md`](./docs/ai/PRODUCT.md)                 |
| Touch a frontend file, add a game or copy | [`docs/ai/frontend/README.md`](./docs/ai/frontend/README.md) |
| Touch the schema, RPCs, keys or realtime  | [`docs/ai/backend/README.md`](./docs/ai/backend/README.md)   |
| Check what you may change without asking  | [`docs/ai/governance.md`](./docs/ai/governance.md)           |
| Work on an Officina task or write a spec  | [`docs/ai/officina.md`](./docs/ai/officina.md)               |

## 4. Meta-update rule

A PR that introduces a new pattern, shared component, game, parameter or workflow updates the matching page under `docs/ai/` in the same PR. `PRODUCT.md` changes in the same PR as any behaviour change.
