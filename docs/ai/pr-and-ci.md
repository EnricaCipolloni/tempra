# PR and CI

## 1. PR title

Conventional Commits with a **required scope**: `type(scope): description`. The `pr-title` job rejects anything else. Verbs: `feat`, `fix`, `perf`, `refactor`, `style`, `docs`, `test`, `chore`, `build`, `ci`, `deps`, `revert`. Scopes in use: `games`, `session`, `coach`, `athlete`, `home`, `i18n`, `scoring`, `supabase`, `realtime`, `pages`, `brand`, `repo`, `github`, `ci`, `actions`, `deps`, `npm-deps`, `ai` (for `docs/ai/**` and the agent pointer files), `release`, `mobile`. Prefer an existing scope; a new one names the area the change lives in.

Examples: `feat(games): add simon sequence`, `fix(realtime): resubscribe after reconnect`, `docs(ai): document the game contract`.

## 2. PR body

Follow [`.github/pull_request_template.md`](../../.github/pull_request_template.md): `# Motivation`, `# Changes`, `# Tests`. No hard-wrapped lines, no filler, no diff narration; write what the diff cannot say (why, trade-offs, what was left out). Tests are concrete: commands and outcomes, manual steps at 390px.

## 3. Atomicity

Rules 2 (atomic) and 3 (small) of the universal standard. An "and also" in a title means split.

## 4. Local quality gates

```bash
npm run quality   # format (prettier --write, eslint --fix) then lint (prettier --check, eslint --max-warnings 0, i18n catalogs, knip, jscpd)
npm run check     # svelte-check against tsconfig.json
npm test          # node --test, TypeScript via --experimental-strip-types
npm run e2e       # Playwright, mocked Supabase (npm run e2e:install once)
npm run build     # vite build, static export to build/
npm run cap:sync  # build + copy into android/ and ios/ (only when touching the shells)
```

## 4a. Quality gate

`npm run lint` (inside `npm run quality`, and the `site` job in CI) also enforces, with no workflow of its own:

- **ESLint limits** in `eslint.config.js`: `complexity` 10, `max-depth` 3, `max-params` 3, `max-nested-callbacks` 3, `max-lines` 300 and `max-lines-per-function` 60 (both off for catalogs and specs), `no-explicit-any`, no `as unknown as`, and `reportUnusedDisableDirectives`.
- **Import boundaries:** `no-restricted-imports` blocks relative imports across folders (only `src/routes/+layout.svelte` may import `../app.css`), every import that points up the layers in [`structure.md`](./structure.md#direction-of-dependencies), and the component directions listed there (games, session, coach, ui).
- **Baseline:** what already broke a limit when the gate landed is listed in `eslint-suppressions.json` (ESLint bulk suppressions). It may only shrink: fixing one makes ESLint fail until you run `npx eslint . --prune-suppressions`, and a new violation is never added with `--suppress-all`.
- **Dead code:** `knip` (`knip.jsonc`, `npm run lint:dead`). Its only baseline is `ignoreDependencies` for the Capacitor plugins the native shells load; any other finding fails.
- **Duplication:** `jscpd` (`.jscpd.json`, `npm run lint:dup`) fails above 2.2% duplicated lines (2.13% when it landed). Lower the threshold when a clone is removed.

## 5. What CI runs

[`checks.yml`](../../.github/workflows/checks.yml): `pr-title`, `site` (npm ci, lint, check, test, build, and asserts `build/index.html`, `build/404.html`, `build/athlete.html`, `build/coach.html` and `build/CNAME` = `tempra.ventilii.dev`) and `e2e` (Playwright against the mocked Supabase). `checks-pass` is the single required status.

[`mobile.yml`](../../.github/workflows/mobile.yml): Android debug APK (uploaded as a run artifact) and an unsigned iOS simulator build, on every PR and push to `main`. Not part of `checks-pass` yet; promote it once the first store build exists.

## 5a. Branch ruleset

The ruleset for `main` lives only in the repository settings (Settings → Rules → Rulesets), not in a file: pull request required, squash only, review threads resolved, code owner review (inactive while there is no `CODEOWNERS` file), `checks-pass` (from GitHub Actions) required and up to date, code quality errors block the merge, no branch creation, no deletion, no force push. Nobody bypasses it.

## 6. Deploy

[`deploy.yml`](../../.github/workflows/deploy.yml) runs on every push to `main`: builds and publishes `build/` to GitHub Pages at https://tempra.ventilii.dev. Pages must be configured once in the repository settings (source: GitHub Actions, custom domain `tempra.ventilii.dev`, enforce HTTPS). DNS: `tempra.ventilii.dev CNAME enricacipolloni.github.io` at Namecheap (the domain is Antonio's, the repository and Pages site are Enrica's).

## 7. Release

[`release-please.yml`](../../.github/workflows/release-please.yml) keeps a release PR open on `main`; merging it bumps `package.json`, regenerates `CHANGELOG.md` and tags `vX.Y.Z`. It is bookkeeping for the website: the deploy already happened on merge. Needs the `RELEASE_BOT_APP_ID` variable and `RELEASE_BOT_PRIVATE_KEY` secret (the owner's GitHub App).

[`release-assets.yml`](../../.github/workflows/release-assets.yml) runs when that release is published and attaches the installable apps to it, versioned from the tag (build number `MAJOR*1000000 + MINOR*1000 + PATCH`). Signing comes from repository secrets; without them it still attaches something installable and warns on the run:

| Platform | Secrets                                                                                             | With them                                                                                                               | Without them                                                                                    |
| -------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Android  | `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` | `tempra-vX.Y.Z.apk` and `.aab`, signed with the upload key                                                              | `tempra-vX.Y.Z-debug.apk` (new debug key each run: uninstall before updating)                   |
| iOS      | `IOS_CERTIFICATE_P12_BASE64`, `IOS_CERTIFICATE_PASSWORD`, `IOS_PROVISIONING_PROFILE_BASE64`         | `tempra-vX.Y.Z.ipa`, export method read from the profile (ad hoc profile for devices, App Store profile for TestFlight) | `tempra-vX.Y.Z-unsigned.ipa`, installable only through a re-signing tool (AltStore, Sideloadly) |

`*_BASE64` values are the file encoded with `base64 -i <file>`. Run the workflow by hand with a tag to rebuild and re-attach the files of an existing release; pull requests that touch it or `android/app/build.gradle` build without attaching.

## 8. Database changes

Follow [`workflows/change-the-schema.md`](./workflows/change-the-schema.md). Never edit an applied migration, and apply a new one to the live project before merging, since the deploy runs on every push to `main`.

## 9. Dependencies

Dependabot opens weekly PRs: one grouped PR for npm minor and patch bumps, one per GitHub Action. Major npm bumps are ignored by config and done by hand in their own `chore(npm-deps)` or `deps(...)` PR, with the migration notes in the body. Merge a green dependabot PR with squash; never force a lockfile by hand.

## 10. Commits

Squash merges; the PR title becomes the commit. No AI attribution lines in commits or PR bodies.
