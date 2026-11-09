# Reusability catalog

Everything shared that already exists. Search here and in the code before writing a component, a util, a constant, a store, a service or a type (rule 4 of the universal standard). When you add something others could use, add its line here in the same PR.

## CSS primitives (`src/app.css`)

Prefer a Tailwind utility first, then one of these classes, then a new class, and only then a new component.

| Class                                                          | What it is                                                                                                    |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `.card`, `.card-accent`                                        | Panel with the 3px top rule; volt rule with `.card-accent`.                                                   |
| `.label`                                                       | Small uppercase field label.                                                                                  |
| `.input`                                                       | Text input and select.                                                                                        |
| `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-big`               | The slanted bib button and its variants; `:disabled` is styled.                                               |
| `.kpi` (`b` value, `span` label)                               | A big number with its caption; use through `Kpi.svelte`.                                                      |
| `.code`                                                        | A squad code in the display face.                                                                             |
| `.stim`, `.stim-small`                                         | The stimulus a game shows.                                                                                    |
| `.answers`, `.answers-4`, `.answers .btn`, `.answers .btn-pad` | The answer grid under a stimulus (two columns, four with `.answers-4`); `.btn-pad` makes a taller tap target. |
| `.hint`                                                        | The one-line rule shown under a game.                                                                         |
| `.badge`, `.badge-ok`, `.badge-warn`, `.badge-bad`             | Status with a left rule.                                                                                      |
| `.info-tip`                                                    | The note `InfoTip.svelte` opens.                                                                              |
| `.toggle-row`                                                  | A label plus switch row in a form.                                                                            |
| `.track` (with an `i` fill)                                    | The block progress bar: lane stripes under a volt fill.                                                       |
| `.tnum`                                                        | Tabular digits wherever numbers line up.                                                                      |

Design tokens (`--bg`, `--fg`, `--accent`, ...) and their rules: [`frontend/README.md`](./frontend/README.md#design-tokens).

## Components

| Component                          | Props                                                        | What it does                                                                               |
| ---------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `ui/Brand.svelte`                  | `large?`                                                     | The Tempra mark and wordmark.                                                              |
| `ui/Kpi.svelte`                    | `value`, `label`                                             | One `.kpi` tile.                                                                           |
| `ui/Toast.svelte`                  | none                                                         | Renders `toastStore`; mounted once in the layout. Call `toast(...)`, never mount it again. |
| `ui/Sparkline.svelte`              | `values`, `width?`, `height?`, `label?`                      | Small SVG line of a series (the Tempra index history).                                     |
| `ui/InfoTip.svelte`                | `text`, `label`                                              | The "i" button that shows a detail on demand; where explanations go.                       |
| `session/BlockRunner.svelte`       | `config`, `difficulty`, `onDone`, `onAbort`, `onGameChange?` | Runs a recovery block: rotates games, owns the clock, scores, plays haptics.               |
| `session/BlockSummary.svelte`      | `result`, `nextDifficulty?`, `onBack`                        | The end-of-block card.                                                                     |
| `session/TrialTimer.svelte`        | `durationMs`, `onExpire`                                     | Countdown bar for one trial under time pressure; wrap it in `{#key trialId}`.              |
| `session/Distractors.svelte`       | none                                                         | Colour flashes and moving blobs over the stage.                                            |
| `coach/Roster.svelte`              | `roster`, `selected`, `onSelect`                             | Live list of athletes with presence, last index and trend.                                 |
| `coach/AthleteHistory.svelte`      | `name`, `results`, `onClose`, `onDelete`                     | One athlete's chart and table, with the delete action.                                     |
| `coach/ConfigForm.svelte`          | `config`, `busy`, `onPublish`                                | Edits a copy of `SquadConfig` and publishes it.                                            |
| `coach/ResultsTable.svelte`        | `results`, `onRefresh`                                       | Recent blocks of the whole squad.                                                          |
| `games/*.svelte`                   | `GameProps`                                                  | `Stroop`, `GoNoGo`, `NBack`, `Flanker`, `Arithmetic`, `Trail`.                             |
| `games/index.ts` `GAME_COMPONENTS` | `Record<GameKey, Component<GameProps>>`                      | The registry the runner mounts from.                                                       |

## Utils (`src/lib/utils/`, pure, unit-tested where marked)

| Export                                                                                                  | What it does                                                                                    |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `isNullish`, `nonNullish` (`nullish.utils`)                                                             | The only allowed null / undefined checks; type guards.                                          |
| `t`, `matchLocale`, type `I18nKey` (`i18n.utils`, tested)                                               | Translate a key with `{name}` placeholders and fallbacks; pick a locale from browser languages. |
| `isLegalDraft`, `legalValues` (`legal.utils`, tested)                                                   | Whether operator and contact are set; the `{owner}` / `{contact}` values or placeholders.       |
| `gameScore`, `accuracyOf`, `meanRtOf`, `tempraIndex`, `adaptDifficulty` (`scoring.utils`, tested)       | Every score, accuracy, mean reaction time, composite index and auto-adapt step.                 |
| `POINTS_PER_CORRECT`, `PENALTY_PER_ERROR`, `ADAPT_UP_ACCURACY`, `ADAPT_DOWN_ACCURACY` (`scoring.utils`) | The scoring and adaptation thresholds.                                                          |
| `buildRoster`, `trendOf`, `indexOf`, types `AthleteSummary`, `Trend` (`roster.utils`, tested)           | One summary row per athlete from results plus presence; up / down / flat trend.                 |
| `readLocal`, `writeLocal`, `removeLocal`, `clearLocal` (`storage.utils`)                                | localStorage under the `tempra.` prefix that never throws.                                      |
| `deviceId` (`device.utils`)                                                                             | Stable per-browser id, the presence key.                                                        |
| `randomInt`, `pick`, `shuffle` (`random.utils`)                                                         | Random integer, element, shuffled copy.                                                         |
| `sleep` (`random.utils`)                                                                                | Promise that resolves after `ms`.                                                               |
| `createTrialGate` (`trial.utils`)                                                                       | One-shot gate a tap and a timer race to resolve.                                                |
| `formatClock`, `formatDuration`, `formatWhen` (`time.utils`)                                            | `m:ss`, `90 s` / `2 min`, localised date and time.                                              |

## Services (`src/lib/services/`)

| Export                                                                                                                                            | What it does                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `supabase()` (`supabase.service`)                                                                                                                 | The lazy Supabase client; the only place a client is created.               |
| `createSquad`, `getSquad`, `updateSquadConfig`, `submitResult`, `listResults`, `deleteAthleteResults`, `deleteSquad` (`squad.service`)            | One typed wrapper per RPC.                                                  |
| `joinSquadChannel`, type `SquadChannel` (`realtime.service`)                                                                                      | The squad channel: config updates, presence, result broadcast, live status. |
| `hapticTap`, `hapticCorrect`, `hapticWrong`, `hapticBlockEnd`, `hapticTrial`, `hapticsSupported`, `setHapticsEnabled` (`haptics.service`, tested) | Fire-and-forget vibration on native and web.                                |

## Stores (`src/lib/stores/`)

| Export                                                                                           | What it holds                                                                   |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `localeStore`, `setLocale` (`locale.store`)                                                      | Current locale, saved choice or browser match.                                  |
| `hapticsStore`, `setHaptics` (`haptics.store`)                                                   | The vibration switch, pushed into the haptics service.                          |
| `squadStore`, `setSquad`, `leaveSquad`, `athleteNameStore`, `setAthleteName` (`squad.store`)     | The squad joined as an athlete and the athlete's name, cached.                  |
| `coachStore`, `setCoachSession`, `clearCoachSession` (`coach.store`)                             | Code and coach key of the squad this device manages.                            |
| `resultsStore`, `addResult`, `readAdaptedDifficulty`, `writeAdaptedDifficulty` (`results.store`) | The athlete's own history on the device and the adapted difficulty per athlete. |
| `outboxStore`, `queueResult`, `flushOutbox` (`outbox.store`)                                     | Results not yet sent, flushed in order.                                         |
| `toastStore`, `toast` (`toast.store`)                                                            | The one transient message; call `toast(text)`.                                  |

## Constants (`src/lib/constants/`)

| Export                                                                                                 | What it is                                                                 |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `DEFAULT_SQUAD_CONFIG` (`config.constants`)                                                            | Default parameters; mirrors `default_squad_config()` in SQL.               |
| `BLOCK_DURATIONS_S`, `GAME_DURATIONS_S` (`config.constants`)                                           | The durations a coach can choose.                                          |
| `BLOCK_TAIL_S`, `MIN_GAME_SLOT_S`, `INTERSTITIAL_MS` (`config.constants`)                              | Block runner timing.                                                       |
| `SQUAD_CODE_LENGTH`, `CONFIG_POLL_MS`, `RESULTS_POLL_MS` (`config.constants`)                          | Code length and fallback poll intervals.                                   |
| `ladder`, `NBACK_N` (`config.constants`)                                                               | Read a five-entry difficulty ladder; the N-back ladder.                    |
| `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `LOCALE_TAG`, `LOCALE_NAME`, type `Locale` (`locale.constants`) | Locales, their BCP 47 tags and their own names.                            |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (`supabase.constants`)                                      | The project; public by design.                                             |
| `LEGAL_OWNER`, `LEGAL_EMAIL`, `TERMS_SECTIONS` (`legal.constants`)                                     | Operator and contact for the legal pages; the order of the terms sections. |
| `it`, `en`, `ptBR` (`messages/`)                                                                       | The catalogs; read them only through `t(...)`.                             |

## Types (`src/lib/types/`)

| Export                                                                                  | What it describes                                                                                    |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `GAME_KEYS`, `GameKey`, `Difficulty`, `SquadConfig`, `Squad`, `CoachSession` (`config`) | The game keys (the one list of games), levels, the remote parameters, a squad, the coach credential. |
| `TrialOutcome`, `GameStats`, `BlockResult`, `RemoteResult` (`result`)                   | One trial, one game slot, one block on the device, one row from `list_results`.                      |
| `GameProps` (`game`)                                                                    | The contract every game takes.                                                                       |
| `SquadPresence`, `PresenceStatus`, `ResultBroadcast` (`presence`)                       | What a device announces on the channel; the result broadcast payload.                                |

## Scripts and test helpers

| Path                                            | What it does                                                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `scripts/check-locale-catalogs.mjs`             | Fails `npm run lint` when a catalog misses a key of the Italian one or has an extra one.           |
| `scripts/test/register.mjs`, `lib-resolver.mjs` | Let `node --test` resolve `$lib/...` imports.                                                      |
| `e2e/supabase-mock.ts`                          | `mockSupabase(page)`, `SQUAD_CODE`, `COACH_KEY`, `defaultConfig`: the whole RPC contract, offline. |
