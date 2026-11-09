# Add a game

Title: `feat(games): add <name>`. One game per PR.

1. **Read the contract** in [`../frontend/README.md`](../frontend/README.md#the-game-contract) and copy the shape of an existing game of the same kind (`Flanker.svelte` for a two-button choice, `Stroop.svelte` for four answers, `NBack.svelte` for a withhold).
2. **Write `src/lib/components/games/<Name>.svelte`.** Destructure `GameProps`; put every tuning value in a five-entry ladder next to the game, read with `ladder(...)`; run the trial loop in `onMount` with one `createTrialGate()` per trial and an `active` flag; report `rt_ms` only for correct taps; render `TrialTimer` inside `{#key trialId}` when `timePressure` is on. Use `.stim`, `.answers`, `.btn` from `src/app.css`; no new class unless none fits.
3. **Register it** in one go: the key in `GAME_KEYS` (`src/lib/types/config.ts`), the component in `GAME_COMPONENTS` (`src/lib/components/games/index.ts`). TypeScript then fails anywhere a `Record<GameKey, ...>` misses it.
4. **Copy:** `game.<key>.name`, `game.<key>.hint` and `game.<key>.about` in every catalog under `src/lib/constants/messages/` (see [`add-copy-or-a-locale.md`](./add-copy-or-a-locale.md)). Buttons that abbreviate a word get their own `.short` key.
5. **Defaults:** decide with the owner whether the game joins `DEFAULT_SQUAD_CONFIG.games`. If it does, that is also a new migration for `default_squad_config()` ([`change-the-schema.md`](./change-the-schema.md)), and the e2e mock's `defaultConfig`.
6. **Pure logic** a game needs (generating a trial, checking an answer) goes in `src/lib/utils/` with a spec in `src/tests/`.
7. **Docs:** the game and its ladder in [`../PRODUCT.md`](../PRODUCT.md); a new shared piece in [`../reusability.md`](../reusability.md).
8. **Check at 390px** on the athlete screen, then run the gates in `AGENTS.md` section 2. An e2e spec for the game is welcome when it has a tap flow Stroop's spec does not cover.
