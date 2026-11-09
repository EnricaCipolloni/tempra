# Testing

Two layers, nothing in between: unit specs for pure modules (plus `haptics.service`, the one side-effecting module tested with its platform stubbed), Playwright for everything a user does. There are no component tests.

## Unit (`src/tests/*.test.ts`)

- `npm test` runs `node --test` over `src/tests/*.test.ts` with TypeScript stripped on the fly (`--experimental-strip-types`). `scripts/test/register.mjs` loads `scripts/test/lib-resolver.mjs`, so specs import through `$lib/...` like the app does.
- Pure modules: scoring, roster, i18n, legal, and the documented exception haptics (the service, with `navigator.vibrate` stubbed) and the trial gate (today inside `src/tests/i18n.test.ts:65`; a new spec for it goes in its own `trial.test.ts`). Keep logic that deserves a test out of components and routes; move it to `src/lib/utils/` and test it there.
- Style: `describe` / `it` from `node:test`, `assert` from `node:assert/strict`, a small factory with `Partial<T>` overrides for fixtures (`row(...)` in `src/tests/roster.test.ts:7`). One file per module, named after it (`scoring.utils.ts` → `scoring.test.ts`).
- A spec may spell out the values it expects; nothing else may (rule 5 of the universal standard).

## End to end (`e2e/*.spec.ts`)

- `npm run e2e` runs Playwright (`playwright.config.ts`): chromium desktop plus Pixel 7, locale `it-IT`, the dev server on port 5173, one retry on CI. Specs are written against the Italian copy.
- `e2e/supabase-mock.ts` intercepts every call to the Supabase host and plays the RPC contract back, so the suite is deterministic and never touches the live project. Mock state is per test: `const state = await mockSupabase(page)`, then set `state.config` before `page.goto`. `state.calls` records every RPC for assertions.
- Select by `data-tid` (`page.getByTestId(...)`, the configured `testIdAttribute`), by role and accessible name, or by label. A CSS class only where none of them reaches the element (the answer buttons of a game, a `.kpi` value).
- One spec per surface or concern: `home`, `athlete`, `coach`, `outbox`, `haptics`, `stroop`, `fonts` (fails if a font comes from a CDN).
- A new page, flow or RPC gets a spec, and the mock learns the RPC in the same PR.
- Locally without a Playwright download: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npx playwright test` where that folder exists; otherwise `npm run e2e:install` once.

## Static checks that act as tests

- `npm run check`: `svelte-check`, zero errors and zero warnings.
- `npm run lint` includes `scripts/check-locale-catalogs.mjs`: every catalog has exactly the Italian keys.
- CI's `site` job asserts the static export (`build/index.html`, `build/404.html`, `build/athlete.html`, `build/coach.html`, `build/CNAME`), see [`pr-and-ci.md`](./pr-and-ci.md#5-what-ci-runs).
- Haptics: the iOS Simulator has no vibration, so real feedback can only be confirmed on a physical phone.

Never skip, weaken or delete a test to get to green.
