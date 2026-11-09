# Change the schema or an RPC

Title: `feat(supabase): ...` or `fix(supabase): ...`. `supabase/migrations/` is a protected path: the task must name the change.

1. **Add `supabase/migrations/YYYYMMDDHHMMSS_<snake_case>.sql`.** Never edit an applied file; a change to a function is a new file with `create or replace`.
2. **Start with a header comment** that says why, and leave a line for the applied state (`-- Applied to project znhomweyvdkkhvgcnvdc on <date> as \`<name>\`.`), as in `20261027120000_delete_athlete_and_squad.sql`.
3. **A new RPC** is `language plpgsql security definer set search_path = public`, validates its inputs and raises a short lowercase message (`'invalid athlete name'`, `'unauthorized'`), verifies the coach key when it is a coach action, bounds every free-form input, and ends with `revoke all on function ... from public;` then `grant execute on function ... to anon, authenticated;`. No table grants and no RLS policies that bypass the RPCs ([`../backend/README.md`](../backend/README.md)).
4. **The client:** one typed wrapper in `src/lib/services/squad.service.ts`, named-object argument, throws `new Error(error.message)`. A route or store calls it and turns a failure into a toast. Matching on an error message is a known smell (`outbox.store.ts`); do not add another.
5. **The mock:** teach `e2e/supabase-mock.ts` the new RPC so the suite stays offline, and cover the flow with a spec.
6. **Apply** it to the `tempra` project (Supabase MCP `apply_migration`, or the dashboard SQL editor) before merging, then write the applied date in the header. Say in the PR body whether it is applied.
7. **Docs:** the table or RPC row in [`../backend/README.md`](../backend/README.md); retention or privacy effects in the privacy copy (`privacy.*`) and [`../PRODUCT.md`](../PRODUCT.md).
