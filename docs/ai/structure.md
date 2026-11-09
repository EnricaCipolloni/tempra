# Structure

## Folder taxonomy (closed)

```
src/
  app.css                     design tokens (dark-first), @theme bridge to Tailwind, shared primitives
  app.html                    font preload, manifest, favicon (fonts are self-hosted in static/fonts, @font-face in app.css)
  service-worker.ts           offline shell (cache-first assets, network-first pages)
  routes/
    +layout.svelte            header (brand, Athlete / Coach tabs), footer (legal links, locale picker, vibration switch, version), Toast
    +layout.ts                ssr = false, prerender
    +page.svelte              landing
    athlete/+page.svelte      join form → home card → BlockRunner → BlockSummary
    coach/+page.svelte        create / restore → squad card + ConfigForm + ResultsTable
    privacy/+page.svelte      privacy notice, one section per catalog key group (privacy.*)
    terms/+page.svelte        terms of use, one section per entry of TERMS_SECTIONS (terms.<id>.title|text)
  lib/
    components/
      games/                  one component per game + index.ts (GAME_COMPONENTS)
      session/                BlockRunner, BlockSummary, TrialTimer, Distractors
      coach/                  Roster, AthleteHistory, ConfigForm, ResultsTable
      ui/                     Brand, Kpi, Toast, Sparkline, InfoTip ("i" button that shows a detail on demand)
    constants/                config, legal, locale, supabase, messages/{it,en,pt-BR}.ts
    services/                 supabase.service (lazy client), squad.service (RPC wrappers), realtime.service (channel: config, presence, result broadcast), haptics.service (fire-and-forget vibration)
    stores/                   locale, haptics, squad (athlete side), coach, results (local history), outbox (unsent results), toast
    types/                    config, result, game, presence
    utils/                    i18n, legal, nullish, random, scoring, roster, storage, time, trial, device
  tests/                      node --test specs, `$lib/...` imports resolved by scripts/test/lib-resolver.mjs
e2e/                          Playwright specs + supabase-mock.ts (every RPC intercepted, no network)
supabase/migrations/          append-only SQL history of the live project
scripts/                      check-locale-catalogs.mjs (run by npm run lint), test/ (the $lib resolver for node --test)
static/                       fonts (with OFL.txt), icons, manifest, CNAME
android/, ios/                Capacitor shells; `npm run cap:sync` copies build/ into them. Generated web assets inside them are gitignored.
```

New code goes into the folder that already owns the concern. No new top-level folder and no new folder under `src/lib/` without an explicit ask.

## Where new code goes

| You are writing...                                   | It goes in                                                    | Named                        |
| ---------------------------------------------------- | ------------------------------------------------------------- | ---------------------------- |
| A pure function (no DOM, no network, no storage)     | `src/lib/utils/<topic>.utils.ts`, with a spec in `src/tests/` | `camelCase` export           |
| A call to Supabase (RPC or channel)                  | `src/lib/services/<topic>.service.ts`                         | verb first: `getSquad`       |
| Browser state shared across routes, persisted or not | `src/lib/stores/<topic>.store.ts`, a `writable` plus setters  | `<topic>Store`, `set<Topic>` |
| A fixed value, list, ladder or limit                 | `src/lib/constants/<topic>.constants.ts`                      | `UPPER_SNAKE`                |
| A shape shared by more than one module               | `src/lib/types/<topic>.ts`                                    | `PascalCase`                 |
| User-visible text                                    | every catalog under `src/lib/constants/messages/`             | `area.thing.detail` key      |
| A game                                               | `src/lib/components/games/<Name>.svelte`                      | see the workflow             |
| A piece of the athlete block                         | `src/lib/components/session/`                                 | `PascalCase.svelte`          |
| A piece of the coach panel                           | `src/lib/components/coach/`                                   | `PascalCase.svelte`          |
| A primitive used by both sides                       | `src/lib/components/ui/` or a class in `src/app.css`          | `PascalCase.svelte`          |
| A page                                               | `src/routes/<path>/+page.svelte`, plus an e2e spec            |                              |
| A database change                                    | a new `supabase/migrations/YYYYMMDDHHMMSS_<snake_case>.sql`   |                              |

A route wires stores, services and components together; logic worth a test does not live in a route or a component (move it to `utils/`).

## Direction of dependencies

Imports point down this list, never up, and always through `$lib/...` (never a relative path across folders):

```
routes
  → components   (session → games, ui; games → session/TrialTimer; coach → ui; ui → nothing)
    → stores
      → services
        → utils
          → constants
            → types
```

- `types/` imports only other types.
- `constants/` imports only types (and other constants).
- `utils/` never imports a service, a store or a component; it may read constants (for example `legal.utils` reads `legal.constants`).
- `services/` never import a store or a component. They talk to Supabase or to Capacitor and nothing else.
- `stores/` may call a service (`outbox.store` → `squad.service`, `haptics.store` → `haptics.service`), never a component.
- A game never imports a service or a store other than `locale.store`, and from `session/` only `TrialTimer`: it gets everything else through `GameProps` and reports through `onTrial`. Only `BlockRunner` mounts games (through `GAME_COMPONENTS`) and plays the haptics.
- `ui/` components import no other component; they may read `locale.store` and `toast.store`.

The code follows this today; keep it that way.
