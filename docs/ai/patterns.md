# Patterns

The patterns Tempra really uses, each with an example to copy. When the code holds two styles, follow the one named here. The anti-patterns at the end exist in the code today: do not copy them, and fix one only in its own PR.

## Components (Svelte 5)

- **Props.** `let { a, b }: Props = $props();` with a named `interface Props` (`src/lib/components/session/BlockRunner.svelte:22`). Games destructure `GameProps` instead (`src/lib/components/games/Flanker.svelte:11`).
- **Values from props are `$derived`.** `const total = $derived(config.block_duration_s);` (`src/lib/components/session/BlockRunner.svelte:32`). A plain `const` freezes the initial value and `svelte-check` warns (`state_referenced_locally`).
- **State seeded from a prop** uses `untrack(() => ...)`: `src/lib/components/coach/ConfigForm.svelte:21`. A form that edits a copy of a prop is remounted by its parent with `{#key}` when the server value changes (`src/routes/coach/+page.svelte:410`); no `$effect` resync (eslint forbids the `$state` + `$effect` pair).
- **Event handlers are attributes:** `onclick={...}`, `onsubmit={(e) => { e.preventDefault(); ... }}`.
- **Dynamic components:** `const Game = $derived(GAME_COMPONENTS[key]); <Game {...props} />` (`src/lib/components/session/BlockRunner.svelte:49`).
- **Test selectors** are `data-tid="..."` attributes (`src/routes/athlete/+page.svelte:234`), never CSS classes.

## Loops and subscriptions

- **Timers and async loops start in `onMount`** and are torn down in its return. A game's trial loop: `src/lib/components/games/Flanker.svelte:27`, with an `active` flag checked after every `await`.
- **One trial, one gate.** `createTrialGate()` (`src/lib/utils/trial.utils.ts:5`) lets a tap and the time-pressure timer race; the first answer wins and later ones are ignored. Render `TrialTimer` inside `{#key trialId}` (`src/lib/components/games/Flanker.svelte:69`).
- **`$effect` only for subscriptions that must restart** when a dependency changes: the squad channel keyed by code, with its poll, and a cleanup that leaves the channel and clears the interval (`src/routes/athlete/+page.svelte:119`, `src/routes/coach/+page.svelte:227`).
- **Realtime first, poll as the safety net.** `joinSquadChannel` (`src/lib/services/realtime.service.ts:23`) carries config, presence and the result broadcast; sends are skipped while the socket is not live (`src/lib/services/realtime.service.ts:79`) because the poll catches up.

## State

- **Component-local state is runes;** cross-route browser state is a `svelte/store` `writable`.
- **A store is a `writable` plus named setters** that persist and set together: `src/lib/stores/coach.store.ts:8`. Readers subscribe with `$coachStore`; nobody calls `.set` from outside the store module.
- **localStorage only through `storage.utils`** (`readLocal`, `writeLocal`, `removeLocal`, `clearLocal`, `src/lib/utils/storage.utils.ts:7`): every key gets the `tempra.` prefix and storage that throws (private mode) never breaks the page.
- **A plain flag where timing matters.** `haptics.store` pushes the switch into `setHapticsEnabled` (`src/lib/stores/haptics.store.ts:9`), so a trial never reads storage or a store on its way to the motor.

## Data access and errors

- **One lazy Supabase client:** `supabase()` (`src/lib/services/supabase.service.ts:8`), created on first use so prerendering never opens a connection.
- **One typed wrapper per RPC** in `squad.service.ts`, taking a single named-object argument and returning a domain type: `getSquad({ code })` (`src/lib/services/squad.service.ts:24`). A failed call throws `new Error(error.message)`; an empty result is `undefined`, not an error.
- **Stored config is merged over the defaults** (`normaliseConfig`, `src/lib/services/squad.service.ts:7`), so rows written before a parameter existed keep working.
- **Routes catch and tell the user.** A service error becomes a translated toast (`src/routes/coach/+page.svelte:71`); a transient poll failure is swallowed with a comment saying the poll retries (`src/routes/coach/+page.svelte:127`).
- **Never lose a result.** A block that fails to submit goes to the outbox (`src/routes/athlete/+page.svelte:218`), flushed in order on load and on `online` (`src/lib/stores/outbox.store.ts:29`).
- **Guard against stale loads.** A generation counter bumped on every hand-over (`src/routes/coach/+page.svelte:52`, checked at `:117`) stops an in-flight load from restoring deleted data.
- **Fire and forget around a reaction time.** Haptics are never awaited and never throw (`src/lib/services/haptics.service.ts:30`).

## Functions and values

- **Named-object parameters** for anything with more than one argument or any optional one: `t({ locale, key, values })` (`src/lib/utils/i18n.utils.ts:19`), `gameScore({ correct, wrong, penalty })` (`src/lib/utils/scoring.utils.ts:12`). Tiny one-argument helpers stay positional (`formatClock(seconds)`).
- **Early returns** over nesting: `src/routes/athlete/+page.svelte:69`.
- **Arrow function exports** (`export const fn = (...) => ...`), never `function` declarations.
- **Constants next to their owner, `UPPER_SNAKE`:** module-private ones at the top of the file (`TREND_WINDOW`, `src/lib/utils/roster.utils.ts:20`), shared ones in `constants/`.
- **Difficulty ladders** are five-entry arrays next to the game that uses them, read with `ladder(...)` (`src/lib/components/games/Flanker.svelte:15`).
- **Scoring is pure** and tested: `src/lib/utils/scoring.utils.ts`. The UI shows what it returns and never recomputes it.

## Anti-patterns found in the code

Each is a named follow-up. Do not copy it; fix it only in a PR of its own.

- **The game list is written three times:** `GAME_KEYS` (`src/lib/types/config.ts:1`), `DEFAULT_SQUAD_CONFIG.games` (`src/lib/constants/config.constants.ts:6`) and `GAME_ORDER` (`src/lib/constants/config.constants.ts:38`, unused). New code reads `GAME_KEYS`.
- **The config default merge is written twice:** `normaliseConfig` (`src/lib/services/squad.service.ts:7`) and inline in `src/lib/services/realtime.service.ts:49`.
- **`mean` is written inline three times** (`src/lib/utils/roster.utils.ts:30`, `:66`, `src/lib/utils/scoring.utils.ts:32`), and the same `reduce` sum appears in `src/lib/utils/scoring.utils.ts:23`, `src/lib/services/squad.service.ts:74` and `src/routes/athlete/+page.svelte:189`.
- **Block result assembly lives in a route:** `finish` (`src/routes/athlete/+page.svelte:178`) computes score, accuracy and index, untested. It belongs in `scoring.utils`.
- **Route god files:** `src/routes/athlete/+page.svelte` (424 lines) and `src/routes/coach/+page.svelte` (430 lines); the coach page repeats the `busy` / `try` / toast / `finally` block five times (from `:62` to `:199`).
- **The runner knows one game's ladder:** `BlockRunner` imports `NBACK_N` for the hint (`src/lib/components/session/BlockRunner.svelte:64`), and `NBACK_N` sits in `config.constants.ts:36` while every other ladder sits in its game.
- **`sleep` lives in `random.utils`** (`src/lib/utils/random.utils.ts:16`): it is about time, not chance.
- **Dynamic i18n keys are cast:** `` `game.${key}.name` as I18nKey `` appears eleven times (for example `src/lib/components/session/BlockRunner.svelte:63`). A typed helper would remove the casts.
- **An error matched by its message text:** `UNKNOWN_SQUAD = 'unknown squad'` (`src/lib/stores/outbox.store.ts:7`) couples the client to the wording of a SQL `raise`.
- **An eslint disable to compare with `null`:** `src/lib/services/squad.service.ts:9`, where `nonNullish(raw)` does the job.
- **A stale comment:** `src/lib/types/game.ts:7` says game cleanup happens in `$effect`; it happens in `onMount`.
- **A limit mirrored by hand:** `HISTORY_LIMIT = 1000` (`src/routes/coach/+page.svelte:37`) repeats the cap inside `list_results`.
