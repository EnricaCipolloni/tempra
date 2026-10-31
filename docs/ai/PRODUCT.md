# Product

Living description of what Tempra does today. Change it in the same PR as the behaviour.

## Purpose

Athletes rest between sets for one to four minutes. Tempra fills that window with short cognitive tasks under fatigue (inhibition, working memory, attention, processing speed), so the brain trains to stay sharp when the body is loaded and the stress carries over to competition. The coach controls how hard and how long from their own phone, during the session, and follows every athlete live and over time.

## Surfaces

The same SvelteKit static build ships three ways: the website at https://tempra.ventilii.dev, an Android app and an iOS app (Capacitor shells in `android/` and `ios/`, `appId` `dev.ventilii.tempra`). All three talk to the same Supabase project; a squad created on one surface is visible on the others.

## Actors

- **Coach**: creates a squad at `/coach`, gets a six-character code and a coach link (`/coach?code=…&key=…`). Publishes parameters; follows the roster live; reads each athlete's history. The coach key is the only credential; losing the link means creating a new squad.
- **Athlete**: joins at `/athlete` with the squad code and a display name (no account). The device remembers squad and name. Starts recovery blocks; sees own history on the device.

No accounts, passwords or payments for now: anyone with the code can play, anyone with the coach link can coach. Everything is cached on the device (squad, config, own results, pending uploads), so a reload or a signal gap does not lose work.

## Remote parameters (`SquadConfig`)

| Parameter          | Values                      | Effect                                                                                        |
| ------------------ | --------------------------- | --------------------------------------------------------------------------------------------- |
| `difficulty`       | 1 to 5                      | Selects a value from each game's five-entry ladder (stimulus windows, interference, N, grid). |
| `games`            | subset of the six game keys | Rotation order inside a block; at least one.                                                  |
| `block_duration_s` | 60, 90, 120, 180, 240       | Length of one recovery block.                                                                 |
| `game_duration_s`  | 20, 30, 45, 60              | Slot per game inside the block (last slot shrinks to fit, never below 8 s).                   |
| `time_pressure`    | boolean                     | Each trial gets a countdown bar; expiry counts as an error.                                   |
| `distractors`      | boolean                     | Random colour flashes and moving blobs over the stage while a game runs.                      |
| `penalty_on_error` | boolean                     | Errors subtract 5 points (otherwise they only add nothing).                                   |
| `auto_adapt`       | boolean                     | Per athlete and device: accuracy ≥ 90% raises the next block's level, < 60% lowers it.        |
| `message`          | text, up to 120 chars       | Shown on the athlete's home card.                                                             |

Defaults: difficulty 3, all six games, 90 s block, 30 s per game, time pressure on, distractors off, penalty on, auto-adapt off.

## Games

| Key       | Name       | Rule                               | Ladder (level 1 → 5)                                                                       |
| --------- | ---------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| `stroop`  | Stroop     | Tap the ink colour, not the word.  | Window 2500 → 1000 ms; congruent 60% → 20%; from level 4 buttons mis-coloured              |
| `gonogo`  | Go / No-Go | Tap GO, never NO.                  | Shown 900 → 400 ms; no-go 20% → 40%; from level 4 half the no-go are green with a NO label |
| `nback`   | N-back     | Match if the letter equals N back. | N 1,1,2,2,3; stimulus 2000 → 1000 ms                                                       |
| `flanker` | Flanker    | Direction of the centre arrow.     | Window 2000 → 800 ms; incongruent 50% → 80%; 3 → 7 arrows                                  |
| `math`    | Arithmetic | Pick the result among four.        | Operands up to 10 → 200; × from level 3; window 7 → 3 s; close distractors from level 4    |
| `trail`   | Trail      | Tap numbers in ascending order.    | 9 → 25 numbers; from level 4 the grid reshuffles after each correct tap                    |

## A block

1. Athlete taps start. The block clock counts down; the progress bar fills. The device announces "in a block" (and the current game) on the squad channel.
2. For each slot: 1.5 s interstitial with the game's name and rule, then the game runs for the slot length.
3. Points: 10 per correct trial, minus 5 per error when the penalty is on, never below zero per game.
4. When under 3 s remain no new slot starts; the block ends. Aborting discards the block.
5. Haptics: a light tick on a correct tap, a stronger one on any error (a wrong tap or a missed trial), a distinct pattern when the block ends. Nothing on a correct withhold, since no tap happened. The Abort button ticks too. The apps use the phone's haptics; the website uses the browser's vibration API where one exists, so iOS Safari stays silent. The Vibration switch in the footer turns all of it off on that device: it is on by default, remembered on the device, and hidden where the browser cannot vibrate.
6. Summary: points, accuracy, mean reaction time (correct trials only), Tempra index = round((0.6 · accuracy + 0.4 · speed) · 100 · (0.8 + 0.08 · difficulty)) where speed maps mean RT from 2200 ms (0) to 400 ms (1), 0.5 when no RT exists. A verdict line keys off accuracy (≥ 90%, ≥ 60%, below).
7. The result is stored on the device and sent to the squad (`submit_result`), then broadcast on the channel so the coach's roster updates at once. If the send fails it goes into an outbox and is retried on reload and when the device comes back online; a badge on the home card shows how many are pending.

## Coach panel

- Squad card: code, name, live badge (real time or 10 s poll), last publish time, copy athlete link, copy coach link, leave.
- **Roster**: one row per athlete, live first. Status badge: in a block (with the game), online, offline. Blocks played, last index with trend arrow (last three blocks vs the three before, ±3 points), mean accuracy, last block time, sparkline of the last twelve indices. Athletes who joined but never played appear as soon as they are online.
- **Athlete history**: tap a roster row for the full track record: index (ember) and accuracy (grey) over time, plus the table of every block. A button deletes every result of that athlete after a browser confirm.
- Config form: all parameters above; Publish writes them in one call and athletes receive them within a second.
- Latest squad blocks: the fifteen most recent results across athletes, with index badge (green ≥ 75, amber ≥ 50, red below).
- **Delete the squad**: after a browser confirm, removes the squad, its config and every result on the server and clears the coach session on the device. The code stops working; athletes keep only what their own device cached.

## Copy

Short by design: the athlete home shows level, block length, game count, the coach's message and the live badge; time pressure, last update and how a block works sit behind an "i". The landing folds "how it works" and the games list. Coach toggle hints and the live hint are behind an "i" too. Game rules on the 1.5 s interstitial are a few words each.

## Offline

A service worker caches the app shell and assets at install, so the app opens without signal; the athlete plays with the last config the device saw and results queue in the outbox. API calls are never cached.

## Look

Track-and-field identity from the Tempra Brand canvas: asphalt ground, volt accent, condensed italics, bib-shaped buttons, lane-stripe progress. See `docs/ai/frontend/README.md` § Design tokens.

## Privacy

`/privacy` (linked from the footer and from the athlete join form) leads with one line, then folds each topic in a `<details>`: what is collected (display name, block results, squad name, a random per-browser id kept in localStorage and sent only over presence, never written to the database), who sees it, where it lives (Supabase in Zurich, GitHub Pages, the device), how long it is kept, how minors use the app and how to have data deleted. The join form says a name or nickname is enough. A button erases everything Tempra saved on the device except the language, after a confirm. Squads inactive for 12 months are deleted on the server (see backend README § Retention). Fonts are self-hosted, so no third party sees visitors beyond hosting and Supabase. Placeholders in square brackets (controller, legal basis, contact) are open decisions for the owner.

## Languages

Italian (default), English and Brazilian Portuguese (pt-BR, also served to any other Portuguese browser). The first visit follows the browser languages in order of preference, falling back to Italian; the globe picker in the footer switches language and the choice is remembered on the device (there are no accounts to store it on).

## Not in the product (yet)

Accounts (Google or e-mail sign-in), payments, per-athlete assignments, audio distractors, export of results, push notifications, signed store builds.
