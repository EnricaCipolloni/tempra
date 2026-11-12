# AI agents documentation

Long-form documentation behind [`AGENTS.md`](../../AGENTS.md). Do not read everything: start from `AGENTS.md`, then open the one page that covers your task. The rules that hold in every repository live in the universal standard (https://github.com/AntonioVentilii/officina/blob/main/standards/code.md); these pages only say what is specific to Tempra.

## Cross-cutting

- [`governance.md`](./governance.md): truth hierarchy, protected and generated paths, what agents may change without asking, the meta-update map.
- [`structure.md`](./structure.md): the folder taxonomy, where each kind of new code goes, the direction of dependencies.
- [`patterns.md`](./patterns.md): the patterns the code really uses, with examples, and the anti-patterns not to copy.
- [`reusability.md`](./reusability.md): the catalog of shared components, utils, services, stores, constants, types and CSS primitives.
- [`testing.md`](./testing.md): unit and e2e tests, where they live, how they are written, the commands.
- [`pr-and-ci.md`](./pr-and-ci.md): PR title and body rules, local quality gates, what CI runs, deploys, releases, dependencies.
- [`PRODUCT.md`](./PRODUCT.md): what the shipped product does today. Updated in the same PR as any behaviour change.

## Areas

- [`frontend/README.md`](./frontend/README.md): Svelte 5 specifics, the game contract, i18n, design tokens, copy, accessibility, native shells.
- [`backend/README.md`](./backend/README.md): Supabase schema, RPC surface, security model, retention, realtime, keys.

## Workflows

- [`workflows/add-a-game.md`](./workflows/add-a-game.md)
- [`workflows/add-a-remote-parameter.md`](./workflows/add-a-remote-parameter.md)
- [`workflows/change-the-schema.md`](./workflows/change-the-schema.md)
- [`workflows/add-copy-or-a-locale.md`](./workflows/add-copy-or-a-locale.md)

When two pages disagree, the order in [`governance.md`](./governance.md#truth-hierarchy) decides. Fix the disagreement in the lower source.
