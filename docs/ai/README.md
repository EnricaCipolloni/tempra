# AI agents documentation

Long-form documentation behind [`AGENTS.md`](../../AGENTS.md) and [`CLAUDE.md`](../../CLAUDE.md). Do not read everything: start from `AGENTS.md`, then open the one page that covers your task.

- [`PRODUCT.md`](./PRODUCT.md): what the shipped product does today. Updated in the same PR as any behaviour change.
- [`governance.md`](./governance.md): what agents may change without asking, protected paths, the meta-update rule.
- [`pr-and-ci.md`](./pr-and-ci.md): PR title and body rules, local quality gates, what CI runs, how deploys happen.
- [`frontend/README.md`](./frontend/README.md): folder taxonomy, Svelte 5 patterns, the game contract, i18n, design tokens.
- [`backend/README.md`](./backend/README.md): Supabase schema, RPC surface, security model, realtime, how to change the schema.
- [`officina.md`](./officina.md): how Officina runs agent work here (lanes, who approves, what agents never touch), in Italian for the owner. Specs follow [`spec-driven-development/workflow.md`](./spec-driven-development/workflow.md).

When two pages disagree, code wins over CI, CI over these pages, these pages over `AGENTS.md`, and `AGENTS.md` over tool-specific files. Fix the disagreement in the same PR you noticed it.
