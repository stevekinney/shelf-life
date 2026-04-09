# Dry Run Notes: Self-Testing AI Agents Course

Working log for the course walkthrough. Walks `index.toml` in order. One section per lesson/lab.

Status legend:

- ✅ clean — no drift, no fix needed
- 🔧 fixed inline — drift patched on `playwright-dry-run-edits`
- 🛠 shelf work — code change landed on `yet-another-dry-run`
- ⚠️ needs user attention — flagged for review before publish
- ⏸ prose-only (not executed) — could not run end-to-end

Shelf branch: `yet-another-dry-run` · Course branch: `playwright-dry-run-edits`

## Checkpoint A — Framing and instructions

### `the-hypothesis.md`

- ✅ Prose-only, conceptual. Only state claim is "small SvelteKit + TypeScript book-rating app called Shelf with Vitest + Playwright" — matches.

### `instructions-that-wire-the-agent-in.md`

- ⚠️ The illustrative "what green means" block (lines 54–68 and 97–104) lists `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e` as four separate commands. Shelf's `npm run test` script already chains `test:unit && test:e2e`, so a reader who copies the four-command block verbatim will run e2e twice. The lesson uses this as a teaching template rather than as "the exact Shelf commands," so it's not broken — just worth knowing. Flagged for author review rather than silently changing, because the prose "a task is not done until all four of these exit zero" is pedagogically deliberate.

### `lab-rewrite-the-bad-claude-md.md`

- 🛠 Rewrote `shelf-life/CLAUDE.md` against the lab's full acceptance checklist. New file is 52 lines, contains a numbered "What 'done' means" block naming `npm run typecheck`, `npm run lint`, `npm run test`, a Playwright locator rule naming `getByRole`/`getByLabel`/`data-testid`, a TDD/test-layout rule, a UI-copy rule keeping course and test language out of rendered pages, and negative rules ("do not ... `eslint-disable`", etc.). Every named path resolves except the deliberately-negated `src/routes/demo/` (a do-not-reintroduce rule).
- 🛠 Created `tests/fixtures/README.md` because the new `CLAUDE.md` references the directory and the lab's stretch goals also assume it exists ("Shelf has a `tests/fixtures/` directory that's underused"). Previously missing — drift between the stretch-goal claim and actual repo state.
- 🔧 None needed on the lab prose itself — the acceptance-criteria grep/`wc`/`ls` probes all run cleanly against the rewritten `CLAUDE.md`.

**Side finding — local DB drift:** `npm run test:e2e` ran `drizzle-kit push --force`, which **dropped** `featured_book`, `user_profile`, `reading_goal` tables plus several columns on `book` and `shelf_entry` from the local SQLite. The schema code in `src/lib/server/db/schema.ts` does not declare any of those — someone previously began implementing part of the richer shelf app, then reverted the code without resetting the local DB. Nothing broken (tests pass, schema now matches code), but worth noting because later checkpoints (reading goals, stats, Open Library metadata like `published_year`/`source`) will need to re-introduce some of those tables.

**Verification:** `npm run typecheck` ✓ (0 errors), `npm run lint` ✓, `npm run test` ✓ (12 unit + 5 e2e pass).

**Probes against acceptance checklist:**

- `wc -l CLAUDE.md` → `52` (≤60 ✓)
- `grep -iE 'clean|best practices|good|appropriate' CLAUDE.md` → no matches ✓
- Every `npm run <cmd>` cited resolves to a real `package.json` script ✓
- Every resolving path (`src/lib/components/`, `src/routes/design-system/`, `tests/end-to-end/`, `tests/fixtures/`, `src/lib/server/db/auth.schema.ts`, `playwright-report/index.html`) exists ✓
- `grep -E 'getByRole|getByLabel|data-testid' CLAUDE.md` → 1 hit ✓
- Has a Playwright locator rule, a TDD rule, a UI-copy rule, and a "do not" rule ✓

## Checkpoint B — Testing pyramid framing

### `the-testing-pyramid-as-a-feedback-hierarchy.md`

- ✅ Concept-only lesson. All concrete claims (path conventions `tests/end-to-end/foo.spec.ts` and `src/routes/foo/+page.svelte`, Vitest + Playwright stack, link to the mermaid diagram) match shelf-life's state and conventions. No drift.

## Checkpoint C — Playwright armor

This is where Shelf grew a real testable application surface. Commit history for the starter:

- 🛠 Real Open Library search in `src/lib/server/open-library.ts` (network timeout + graceful-empty fallback).
- 🛠 Shelf CRUD API at `src/routes/api/shelf/+server.ts` and `src/routes/api/shelf/[entryId]/+server.ts` (GET, POST, PATCH, DELETE).
- 🛠 Rate-book dialog at `src/lib/components/rate-book-dialog.svelte` with role-based markup (`role="dialog"`, radio group, "Rate this book" / "Save rating" button names).
- 🛠 Shelf page rewritten to load real entries and expose a rating modal.
- 🛠 Search page rewritten to POST to `/api/shelf` from the UI, with a `role="status"` live region for feedback.
- 🛠 Dev-only seed endpoint at `src/routes/api/testing/seed/+server.ts`, gated on `ENABLE_TEST_SEED=true`. Supports `resetUsers` flag so individual specs don't invalidate the stored session.
- 🛠 `tests/end-to-end/helpers/seed.ts` exposes `seedFreshDatabase` (setup project only), `resetShelfContent` (individual specs), and deprecated `seedDatabase` alias.
- 🛠 `tests/end-to-end/authentication.setup.ts` + storage-state project wiring in `playwright.config.ts`.
- 🛠 `tests/end-to-end/rate-book.spec.ts` — hardened version shipping as the starter baseline (no `waitForTimeout`, no raw `page.locator`, `getByRole` chains, `waitForResponse` on PATCH, API verification via `request.get('/api/shelf')`).
- 🛠 `tests/end-to-end/accessibility.spec.ts` — two routes (`/shelf`, `/search`), axe-core scan with `wcag2a`, `wcag2aa` tags.
- 🛠 `tests/end-to-end/search.spec.ts` — two tests against a committed HAR fixture at `tests/fixtures/open-library-station-eleven.har`.
- 🛠 `docs/accessibility-smoke-checklist.md` — manual keyboard/focus pass.
- 🛠 Updated `CLAUDE.md` with Playwright auth, seeding, HAR, and a11y rules.
- 🛠 Extended `src/lib/components/button.svelte` with `onclick` support and constrained `href` to a narrow `PagePathname` union so `resolve()` type-checks cleanly even after parameterized API routes joined the `$app/types` pathname union.
- 🛠 Removed empty `src/routes/demo/` tree (it was still polluting `$app/types`'s generated `RouteId` list even though the `.svelte` files were gone).

**Course drift fixed inline on `playwright-dry-run-edits`:**

- 🔧 `lab-rewrite-the-bad-claude-md.md`: removed "Third dry run validation" callout; merged the useful fact into prose.
- 🔧 `storage-state-authentication.md`: replaced the "Third dry run validation" note with a "Why the UI login, not a raw POST" note in author voice. Rewrote "Skipping the UI entirely" → "When skipping the UI is worth it," swapping the example from a non-working `/login?/signInEmail` POST to a generic `/api/authentication/token` POST and explaining why Shelf specifically sticks with the UI route.
- 🔧 `lab-harden-the-flaky-rate-book-test.md`: removed two "Third dry run" references. Reframed the lab opener to acknowledge that Shelf ships the hardened version and to direct the student to rebuild it from the rough version in the lesson. Replaced the "third dry run that means `workers: 1`" acceptance bullet with a plain "pins `workers: 1`" explanation.
- 🔧 `the-waiting-story.md`: rewrote the "Shelf ships with a deliberately broken test" paragraph. The starter now ships the hardened spec, not the broken one.
- 🔧 `deterministic-state-and-test-isolation.md`: rewrote the "Rule one: seeding" section to teach Shelf's real pattern (dev-only HTTP seed endpoint + `APIRequestContext` helper), replaced the fictional `$lib/server/database` / `$lib/server/schema` imports with the real paths, updated the fixture example to use `resetShelfContent`, added a "What Shelf does today, and why" section explaining `workers: 1`, and rewrote the CLAUDE.md rules block to match.
- 🔧 `visual-regression-as-a-feedback-loop.md`: removed "Third dry run" callout.
- 🔧 `lab-wire-visual-regression-into-the-dev-loop.md`: replaced "Third dry run" callout with plain prose referencing the deterministic-state lesson.
- 🔧 `writing-a-custom-mcp-wrapper.md`: removed "Third dry run" callout; merged the fact into prose.
- 🔧 `lab-wrap-a-custom-verification-mcp.md`: same.
- 🔧 `failure-dossiers-what-agents-actually-need-from-a-red-build.md`: converted "Third dry run" callout into a `> [!TIP] The easiest way to see this work` hint.
- 🔧 `lab-build-a-failure-dossier-for-shelf.md`: merged the "Third dry run" content into prose.
- 🔧 `tuning-bugbot-for-your-codebase.md`: removed "Third dry run" callout; merged fact into prose.
- 🔧 `lab-bugbot-on-a-planted-bug.md`: removed "Third dry run" callout (redundant with surrounding prose).
- 🔧 `lab-wire-the-static-layer-into-shelf.md`: removed "Third dry run" callout.

**Verification:**

- `npm run typecheck` ✓ — 0 errors, 0 warnings on 1244 files.
- `npm run lint` ✓ (after one small fix: `Error.cause` added to a rethrown signUp failure).
- `npm run test:unit` ✓ — 12 tests pass.
- `npm run test:e2e` ✓ — 11 tests pass across `setup`, `public` (5), and `authenticated` (5) projects.
- Two full e2e runs back-to-back; both green, both deterministic.
- Acceptance criteria for `lab-harden-the-flaky-rate-book-test.md`:
  - `grep waitForTimeout tests/end-to-end/rate-book.spec.ts` → no hits ✓
  - `grep 'page.locator(' tests/end-to-end/rate-book.spec.ts` → no hits ✓
  - `grep "page.goto('/login')" tests/end-to-end/rate-book.spec.ts` → no hits ✓
  - `grep 'page.fill.\[name=' tests/end-to-end/rate-book.spec.ts` → no hits ✓
  - Test passes reliably — verified across two full suite runs.
- Acceptance criteria for `lab-wire-accessibility-checks-into-shelf.md`:
  - `@axe-core/playwright` installed ✓
  - `tests/end-to-end/accessibility.spec.ts` exists and covers `/shelf` + `/search` ✓
  - `docs/accessibility-smoke-checklist.md` exists ✓
  - Runs inside `npm run test:e2e` ✓

**Open items for later checkpoints:**

- `api-and-ui-hybrid-tests.md` references `/stats`, "Currently reading" counter, and `/api/shelf` POST shapes that don't all exist yet (stats page deferred to Checkpoint L). Lesson prose still reads correctly as a pattern reference; revisit in Checkpoint L.
- `deterministic-state-and-test-isolation.md`'s per-worker SQLite pattern is aspirational for Shelf. Consider implementing it in a future Checkpoint (the infrastructure change is real work: per-worker DB paths, webServer env forwarding, `TEST_WORKER_INDEX` read in `$lib/server/db`).

## Checkpoint D — Visual regression

### `visual-regression-as-a-feedback-loop.md`

- 🔧 Replaced the "Marco storage state" aside (which described a non-existent file/identity) with a description of what Shelf actually does: a `beforeEach` that calls `resetShelfContent` before the authenticated visual screenshots. Kept the "use a separate project if your tests conflict" nuance as guidance without naming a fictional user.

### `lab-wire-visual-regression-into-the-dev-loop.md`

- 🔧 Full rewrite of the Part 1 code sample. The old version imported `emptyStorageState` and `marcoAuthenticationFile` from a `./storage-state` module that does not exist in Shelf, POSTed to `/api/shelf/OL1/rating` (wrong endpoint shape — Shelf uses PATCH to `/api/shelf/[entryId]`), referenced a `/books/OL1` detail route (not in Shelf), and asserted on a `"Marco's Shelf"` heading (Shelf seeds alice, not marco).
- 🔧 Replaced it with the pattern Shelf actually uses: split `visual.spec.ts` (public, design-system) and `visual-authenticated.spec.ts` (authenticated project, shelf page with `resetShelfContent` beforeEach). Updated the `playwright.config.ts` snippet to match the real `testMatch`.
- 🔧 Updated the Part 2 "break the button" step to reference `src/lib/components/button.svelte` (lowercase — matches Shelf's kebab-case filename convention) instead of `Button.svelte`, and to show the actual `classes = $derived([...])` block that holds the `px-4 py-2` line in Shelf's button.
- 🔧 Switched all Playwright invocations from `npx playwright test tests/end-to-end/visual.spec.ts --project=chromium` to `npm run test:e2e` (or `-- --grep visual`), matching Shelf's actual script surface.

### Shelf changes

- 🛠 New `tests/end-to-end/visual-authenticated.spec.ts` — screenshots `/shelf` after `resetShelfContent`, runs under the `authenticated` Playwright project.
- 🛠 Playwright config extended so `visual-authenticated.spec.ts` routes to the `authenticated` project.
- 🛠 Committed baseline `tests/end-to-end/visual-authenticated.spec.ts-snapshots/shelf-page-authenticated-darwin.png`.
- 🛠 Updated course assets:
  - `assets/lab-visual-regression-shelf-page.png` — replaced with the current shelf-page baseline so the lesson screenshot matches what a reader generating baselines today will actually see.
  - `assets/lab-visual-regression-shelf-page-diff.png` — regenerated by temporarily bumping the button padding from `px-4 py-2` → `px-6 py-3`, capturing Playwright's diff, then reverting.

**Verification:**

- `npm run test` green: 12 unit tests + 12 e2e tests across setup/public/authenticated projects.
- Stability: suite passes green back-to-back after regeneration.
- Part 2 break-the-button flow was exercised end-to-end (padding change fired a failing shelf-page diff, revert returned the suite to green).

**Known drift carried forward:**

- `visual-regression-as-a-feedback-loop.md` line 94 still says "Shelf is going to ship with a `/design-system` route specifically for this purpose." That's already true in the current repo—the tense is fine as forward-looking prose, no fix needed.

## Checkpoint E — Performance budgets

### `performance-budgets-as-a-feedback-loop.md`

- 🔧 Replaced the aside about the course's validated website repo (`applications/website/package.json`, `bun run build:stats`) with the real Shelf implementation details: `npm run build:stats`, `BUNDLE_STATS=1`, `rollup-plugin-visualizer`, `build/stats.html` + `build/stats.json`.

### `lab-add-performance-budgets-to-shelf.md`

- 🔧 Step 1 rewritten to name `rollup-plugin-visualizer` and the `raw-data` template, with the `package.json` script shape Shelf uses.
- 🔧 Step 3 clarified to include the actual computation (walk `nodeMetas`, sum gzip per bundle file, filter to `_app/immutable` for SvelteKit client chunks).
- 🔧 Step 5 replaced with the exact script block Shelf ships, including the `drizzle-kit push --force` prefix on `performance:runtime` and the `--project=authenticated` flag.

### Shelf changes

- 🛠 Installed `rollup-plugin-visualizer` as a dev dependency.
- 🛠 Updated `vite.config.ts` to invoke the visualizer twice (treemap HTML + raw-data JSON) behind `BUNDLE_STATS=1`.
- 🛠 Added `build:stats`, `performance:build`, `performance:runtime`, and `performance:check` scripts to `package.json`.
- 🛠 New `performance-budgets.json` with captured baselines plus small buffers:
  - `maxTotalGzipKilobytes`: 110 (current measured value: 93.6 kB)
  - `maxLargestChunkGzipKilobytes`: 55 (current largest chunk: 46.2 kB — `_app/immutable/chunks/BiOosUrW.js`)
  - `shelfRouteDomContentLoadedMilliseconds`: 800 (current: ~104 ms)
- 🛠 New `scripts/check-performance-budgets.mjs` — loads stats and budgets, walks `nodeMetas` + `nodeParts` to compute client-bundle gzip totals, prints either a success line or a failure block and exits accordingly.
- 🛠 New `tests/end-to-end/performance.spec.ts` — reads `performance-budgets.json`, navigates to `/shelf`, reads `PerformanceNavigationTiming.domContentLoadedEventEnd - startTime`, asserts under threshold. Runs in the `authenticated` Playwright project with a `resetShelfContent` `beforeEach`.

**Verification:**

- `npm run performance:build` ✓ — "total 93.6 kB / 110 kB, largest chunk 46.2 kB / 55 kB"
- Force-failure drill ✓ — dropping `maxTotalGzipKilobytes` to `10` made the check exit non-zero with "Total client bundle size 93.6 kB gzip exceeds budget of 10 kB"
- `npm run test` ✓ — 12 unit + 13 e2e, all green
- `npm run typecheck` + `npm run lint` ✓

**Roadmap note:** Phase 5 in `ROADMAP.md` doesn't list Performance Budgets as a discrete phase. The lesson and lab sit between Visual Regression (Phase 4) and Runtime Probes (Phase 5) in `index.toml`, effectively adding a new phase. Not a blocker for the dry run, but the ROADMAP should probably grow a "Phase 4.5: Performance budgets" entry for internal coherence. Deferred to the final reconciliation task (#15).
