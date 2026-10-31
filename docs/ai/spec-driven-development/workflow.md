# Spec-driven development

Write a spec first, implement it second. Specs are Markdown files under [`specs/`](./specs/): the handoff between whoever plans the change (a person, a planning session or [Officina](../officina.md)) and the agent that builds it.

**When to use:** new features, behaviour changes and non-trivial fixes, when the human opts in. Small changes (a typo, a one-liner) are implemented directly. Officina tasks always start from a spec.

## Rules

- **Read the guidance first:** [`AGENTS.md`](../../../AGENTS.md), then the area page ([frontend](../frontend/README.md), [backend](../backend/README.md)). A spec never overrides `docs/ai/**`; it sits below it in the [truth hierarchy](../governance.md#truth-hierarchy).
- **Ground it in real code:** actual paths, component names, catalog keys, RPC names.
- **Write for the owner where the owner decides.** Goal and Acceptance criteria are in plain Italian, because the owner approves the spec and checks the result against them. The technical sections stay in English.
- **One spec, one PR.** If the work does not fit one reviewable PR, split the spec.
- **Every spec carries a `Status:` line.** An `Implemented` spec is a historical record, not current truth: for shipped behaviour, the code and [`PRODUCT.md`](../PRODUCT.md) win.

## Files

| Path                                | What                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------- |
| `specs/YYYY-MM-DD-<type>-<slug>.md` | one spec; `type` is `feat`, `impr`, `fix` or `chore`                       |
| `specs/YYYY-MM-DD-<type>-<slug>/`   | optional assets (mocks, screenshots), kept after merge                     |
| [`template.md`](./template.md)      | copy this to start a spec                                                  |
| [`../officina.md`](../officina.md)  | the agent workshop that follows this workflow and sets the `Status:` lines |

## Status

| Status                 | Meaning                                                             | Who sets it                                          |
| ---------------------- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| `Draft`                | written, not building yet                                           | author                                               |
| `In progress (#PR)`    | implementation PR open; the spec is the source of truth for that PR | Officina when it opens the PR, or the implementer    |
| `Implemented (#PR)`    | merged; frozen decision record                                      | Officina when the result is verified, or implementer |
| `Superseded by <spec>` | replaced by a newer spec                                            | author of the new spec                               |
| `Abandoned`            | will not be built; keep the why                                     | whoever decides                                      |

## Steps

1. **Clarify:** scope, edge cases, acceptance criteria. Search code and open issues.
2. **Spec:** copy the template into `specs/`, status `Draft`. Resolve every pending decision before building.
3. **Build:** implement on one branch, update `PRODUCT.md` and both locale catalogs in the same PR, run the gates in [`pr-and-ci.md`](../pr-and-ci.md#4-local-quality-gates).
4. **Adjust:** a small gap (wrong path, missed edge case) is fixed in the spec while building; a product question stops the build until the owner answers.
5. **Close:** compare the result with the spec before review and flag any divergence. The spec and its assets stay after merge.
