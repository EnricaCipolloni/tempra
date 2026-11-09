# Add a remote parameter

A parameter the coach sets and the athletes receive (`SquadConfig`). Title: `feat(coach): ...` or `feat(session): ...`, whichever side the effect is on.

A new parameter touches these places in one PR:

1. **The type:** a field in `SquadConfig` (`src/lib/types/config.ts`).
2. **The default:** the same field in `DEFAULT_SQUAD_CONFIG` (`src/lib/constants/config.constants.ts`). Choices a coach can pick from (like `BLOCK_DURATIONS_S`) are a constant next to it.
3. **The database default:** a new migration that does `create or replace function public.default_squad_config()` with the field added ([`change-the-schema.md`](./change-the-schema.md)). Never edit the migration that created it. `update_squad_config` stores any JSON object, so no RPC changes; `normaliseConfig` fills the field for rows written before it existed.
4. **The form:** a control in `src/lib/components/coach/ConfigForm.svelte`, editing `draft` like the others.
5. **The effect:** read it where it acts, usually `BlockRunner.svelte` or the athlete page, never by re-reading storage.
6. **Copy:** the label, any hint and the value names in every catalog.
7. **Tests:** `e2e/supabase-mock.ts` `defaultConfig` gets the field; an e2e spec shows the coach publishing it and the athlete getting it when the effect is visible. A pure rule behind it gets a unit spec.
8. **Docs:** the row in the parameter table of [`../PRODUCT.md`](../PRODUCT.md).

Then the gates in `AGENTS.md` section 2. Apply the migration before merging: the deploy publishes on every push to `main`.
