# CLAUDE.md

Claude-specific runtime layer. [`AGENTS.md`](./AGENTS.md) is the canonical entry for all agents and [`docs/ai/`](./docs/ai/README.md) is the source of truth; this file only adds Claude-only hints and never restates a rule.

> **Handover:** while [`HANDOVER.md`](./HANDOVER.md) exists, read it before anything else.

> **Mandatory first step:** read [`AGENTS.md`](./AGENTS.md) and the universal standard it links, then the page its "Where to look" table names for your task.

## Claude-only hints

- [`.claude/hooks/session-start.sh`](./.claude/hooks/session-start.sh) runs `npm ci` once when a session starts, so the gates in `AGENTS.md` section 2 work right away.
- Before declaring done, run the gates in `AGENTS.md` section 2; they are the same ones CI runs.
