# Backend (Supabase)

Project `tempra`, ref `znhomweyvdkkhvgcnvdc`, region eu-central-2, organisation "AntonioVentilii's Org". The browser talks to it directly with the publishable key in `src/lib/constants/supabase.constants.ts`. There is no server of our own and no auth: identity is "I hold the squad code" (athlete) or "I hold the coach key" (coach).

## Tables

| Table          | Purpose                                     | RLS                                                                                                       |
| -------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `squads`       | id, code (unique, 6 chars), name, coach_key | Enabled, no policies: reachable only through RPCs.                                                        |
| `squad_config` | squad_id, code, config jsonb, updated_at    | `select` open to anon (athletes read and subscribe). No write policy. In `supabase_realtime` publication. |
| `results`      | one row per completed block                 | Enabled, no policies: insert and read via RPCs.                                                           |

The coach key never leaves Postgres except once, in the `create_squad` response.

## RPC surface (all `SECURITY DEFINER`, granted to `anon`)

| Function                                                                                                                       | Who     | Does                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `create_squad(p_name)`                                                                                                         | coach   | New code (unambiguous alphabet, no 0/O/1/I), random key (`extensions.gen_random_bytes`), default config. Returns code, coach_key, config. |
| `get_squad(p_code)`                                                                                                            | anyone  | code, name, config, updated_at. No key.                                                                                                   |
| `update_squad_config(p_code, p_coach_key, p_config)`                                                                           | coach   | Rejects a non-object config, verifies the key, replaces the config, bumps `updated_at`.                                                   |
| `submit_result(p_code, p_athlete, p_game, p_difficulty, p_score, p_accuracy, p_mean_rt_ms, p_trials, p_duration_ms, p_params)` | athlete | Inserts a result for an existing squad. `p_game` is `'block'` for a whole block; `p_params` carries `index`, `games`, `per_game`.         |
| `list_results(p_code, p_coach_key, p_limit)`                                                                                   | coach   | Verifies the key, newest first, max 1000.                                                                                                 |
| `delete_athlete_results(p_code, p_coach_key, p_athlete)`                                                                       | coach   | Verifies the key, deletes every result of that athlete name in the squad, returns how many.                                               |
| `delete_squad(p_code, p_coach_key)`                                                                                            | coach   | Verifies the key and deletes the squad; `squad_config` and `results` go with it (`on delete cascade`).                                    |

Validation lives in the functions (name lengths, unknown squad, unauthorized). The client surfaces failures as toasts and never retries blindly. The one exception is `unknown squad` in `flushOutbox`: the coach deleted the squad, so the queued result is dropped instead of retried forever.

## Retention

Nothing expires by itself: history stays until the coach deletes it (`delete_athlete_results`, `delete_squad`) or someone asks, because following an athlete over the years is the product. Any automatic deletion, including a shorter history as a plan limit later, must change the privacy copy (`privacy.keep.text`) in the same PR. With no accounts, a squad whose coach link is lost has no one left who can delete it, so a request for it is handled by hand on the project.

## Realtime

One channel per squad, `squad:<code>` (`src/lib/services/realtime.service.ts`), carries three things:

- `postgres_changes` on `squad_config` filtered by code (coach → athletes). Realtime applies the table's RLS, which is why `squad_config` has an open `select`.
- Presence: every device tracks `{ role, name, status, game, since }` under a stable per-device key (`athlete:<deviceId>` / `coach:<deviceId>`), so the coach's roster shows who is online and who is in a block, live.
- A `result` broadcast (athlete → coach) right after `submit_result`, so the panel refreshes without waiting for the poll.

Fallbacks: athletes poll `get_squad` every 20 s, the coach polls `get_squad` + `list_results` every 10 s. Broadcast and presence are skipped while the socket is not `SUBSCRIBED`; nothing is lost because the poll catches up. Results that fail to submit sit in a localStorage outbox (`outbox.store.ts`) and are retried on load and on the `online` event.

## Changing the schema

Step by step, including a new RPC and a new `SquadConfig` field: [`../workflows/change-the-schema.md`](../workflows/change-the-schema.md) and [`../workflows/add-a-remote-parameter.md`](../workflows/add-a-remote-parameter.md). `normaliseConfig` in `squad.service.ts` merges defaults over stored JSON, so older rows keep working.

## Keys

- Publishable key (`sb_publishable_…`): in the repo, public by design, protected by RLS and RPC checks.
- Legacy anon JWT: exists, unused; prefer the publishable key.
- Service role: never in this repo, never in CI.
