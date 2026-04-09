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

## Checkpoint F — Runtime tools and custom MCPs

### `runtime-tools-compared.md`

- ✅ Pure concept lesson comparing Playwright MCP, Chrome DevTools MCP, and Claude in Chrome. No shelf state claims, no drift.

### `runtime-probes-in-the-development-loop.md`

- 🔧 Replaced `bun run dev` with `npm run dev` throughout. Shelf's package.json ships npm scripts.

### `writing-a-custom-mcp-wrapper.md`

- 🔧 Rewrote the "What we're building" section to name the real `/shelf/[username]` public route, explain the email-prefix handle convention, and document the `{ ok, bookCount, consoleErrors, url }` result shape.
- 🔧 Replaced the code example with the real server Shelf ships: `fs.existsSync` storage-state fallback, a `try / finally` block so one failing navigation never leaks a Chromium process, `encodeURIComponent` on the username, a heading-level-1 wait without a name matcher (since the heading is dynamic), and a `result` object that includes the `url` field for agent self-reporting.

### `lab-wrap-a-custom-verification-mcp.md`

- 🔧 Step 2 now names the storage-state fallback (`fs.existsSync` → use if present). The previous wording required Chromium to launch _with_ the storage state, which would crash the server when the file doesn't exist (e.g., before the setup project runs).
- 🔧 Step 7 specifies the `try / finally` shutdown pattern.
- 🔧 Step 8 adds the `url` field and corrects the `ok` predicate to accept an empty public shelf (the `/shelf/[username]` route is a real page even for readers with zero entries).
- 🔧 Removed "In the validated Shelf workshop repo" phrasing in favor of plain "Shelf's MCP config lives in..."

### Shelf changes

- 🛠 Added `src/routes/shelf/[username]/+page.server.ts` and `+page.svelte`. The route is public — it loads a reader by email-prefix handle via a SQLite `lower(substr(email, 1, instr(email, '@') - 1))` comparison and renders their shelf summary + book list read-only. This finally fulfills Phase 0's "Routes the course assumes already exist: `/shelf/:username`" entry in `ROADMAP.md`.
- 🛠 Added `src/lib/public-shelf.ts` with the `toPublicShelfHandle(email)` helper.
- 🛠 Added `tools/shelf-verification-server/server.ts` — the custom MCP server from the lesson. Uses `@modelcontextprotocol/sdk`'s `McpServer` + `StdioServerTransport`, registers `verify_shelf_page`, reuses `playwright/.authentication/user.json` when it exists but falls through cleanly when it doesn't, closes the browser in a `finally` block.
- 🛠 Registered the server in `.mcp.json` alongside the existing `svelte` entry so nothing pre-existing gets clobbered.
- 🛠 Installed `@modelcontextprotocol/sdk`, `zod`, and `tsx` as dev dependencies.

**Verification:**

- `npm run typecheck` ✓ — 0 errors on 1255 files.
- `npm run lint` ✓
- `npm run test` ✓ — 12 unit + 13 e2e, all green (including the existing accessibility scan for `/shelf` and the hardened rate-book flow).
- Ran the MCP server end-to-end against a live preview server:
  1. `ENABLE_TEST_SEED=true npm run build && npm run preview` on 4173.
  2. `curl -X POST /api/testing/seed` with `resetUsers: true` to provision alice.
  3. Spoke JSON-RPC 2.0 to the MCP server via stdio: `initialize`, `notifications/initialized`, `tools/list`, `tools/call` with `{ username: "alice" }`.
  4. `tools/list` returned the `verify_shelf_page` tool with the full input and output schemas.
  5. `tools/call` returned `{ ok: true, bookCount: 2, consoleErrors: [], url: "http://127.0.0.1:4173/shelf/alice" }` — the two seeded shelf entries for alice (Station Eleven + Piranesi).

**Open for Checkpoint M:** The `assets/lab-custom-mcp-public-shelf.png` screenshot could benefit from being regenerated against the current `/shelf/[username]` rendering. Deferred so I don't lose flow; will revisit in the final-reconciliation task along with the other asset audits.

## Checkpoint G — Failure dossiers

### `failure-dossiers-what-agents-actually-need-from-a-red-build.md`

- ✅ Core lesson content matches Shelf's actual setup. The existing TIP callout about moving a baseline to force a failure is accurate against the real `playwright-report/test-results/` layout.

### `lab-build-a-failure-dossier-for-shelf.md`

- ✅ Step 1 config block matches the `playwright.config.ts` patch Shelf now ships.
- ✅ Step 2 forwarder description matches `tests/end-to-end/fixtures.ts`.
- ✅ Step 3 `summarize-failure-dossier.ts` shape matches what Shelf ships (naming, dossier fields, reproduction command).
- ✅ Step 4 CLAUDE.md block matches the "When a test fails" section now in shelf-life/CLAUDE.md.

### Shelf changes

- 🛠 `playwright.config.ts` grows `outputDir: 'playwright-report/test-results'`, `trace: 'retain-on-failure'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, and the full `reporter` block (`html` with `open: 'never'`, `json` → `playwright-report/report.json`, `list`).
- 🛠 New `tests/end-to-end/fixtures.ts` extends the `page` fixture with four forwarders:
  - `page.on('console', ...)` → `[browser error]` / `[browser warning]` on stderr
  - `page.on('pageerror', ...)` → `[browser pageerror]`
  - `page.on('requestfailed', ...)` → `[network failed]` (skips `ERR_ABORTED` / `NS_BINDING_ABORTED`)
  - `page.on('response', ...)` → `[network 4xx]` / `[network 5xx]`
- 🛠 Every spec under `tests/end-to-end/` now imports `{ expect, test }` from `./fixtures` instead of `@playwright/test` (except `authentication.setup.ts` and `helpers/seed.ts`, which don't drive pages).
- 🛠 New `scripts/summarize-failure-dossier.ts` reads `playwright-report/report.json`, walks the suite/spec/test tree, and renders `playwright-report/dossier.md`. The screenshot picker prefers a `diff` or `actual` attachment over the baseline `expected` so visual-regression failures show the meaningful image. Uses `encodeURIComponent`-equivalent `JSON.stringify` on the test title to build a safe `-g` reproduction arg.
- 🛠 New `npm run dossier` script (`tsx scripts/summarize-failure-dossier.ts`).
- 🛠 `CLAUDE.md` grows a "When a test fails" section naming `npm run dossier`, the output path, and the "don't add `console.log`" rule.

## Checkpoint H — Review agents

### `the-second-opinion.md`

- ✅ Concept-only lesson. No shelf state claims.

### `tuning-bugbot-for-your-codebase.md`

- 🔧 Rewrote the sample `.cursor/BUGBOT.md` block so it names Shelf's real authorization surface: `locals.user` (not `locals.viewer`), `requireAdministrator(locals.user)` from `$lib/server/authorization` (not the old `requireViewer` / `requireAdministrator` pair), and the `src/routes/api/admin/**` scoping convention. Updated the "what to leave alone" list to name HAR fixtures and `build/` outputs and to remove the fictional `src/lib/server/application-baseline.ts`.

### `lab-bugbot-on-a-planted-bug.md`

- 🔧 Removed the stale "the local Shelf repository has no Git remote configured" callout. Shelf has a GitHub remote at `https://github.com/stevekinney/shelf-life.git` and the lab can now run end-to-end as a hosted lab.
- 🔧 Rewrote the "Check out the `planted-bug/admin-feature` branch" section to describe the actual diff that branch ships (replacing `requireAdministrator(locals.user)` from `$lib/server/authorization` with a plain `if (!locals.user)` check) instead of the older `requireAdministrator(...)` / `requireViewer(...)` framing.

### Shelf changes

- 🛠 New `src/lib/server/authorization.ts` exposes `isAdministrator(user)` and `requireAdministrator(user)`. Administrator status is a hard-coded email allowlist (`admin@example.com`) — the lesson explains this is intentional so the starter can demonstrate permission flow without an extra database column. `requireAdministrator` is generic so it narrows the non-undefined return type back to whatever the caller passed in (necessary because `better-auth/minimal` doesn't re-export the `User` type).
- 🛠 New `src/routes/api/admin/featured-books/+server.ts` — the admin surface Module 7 targets. Calls `requireAdministrator(locals.user)`, validates the body, and updates the new `featured_position` column on the `book` table.
- 🛠 `src/lib/server/db/schema.ts` gains `featuredPosition: integer('featured_position')`. Applied via `drizzle-kit push --force`.
- 🛠 New `.cursor/BUGBOT.md` — the tuned review rules from the lesson, scoped to Shelf's actual conventions.

### Planted-bug branch

- 🛠 Rebuilt `planted-bug/admin-feature` off the current `yet-another-dry-run` baseline. The single commit replaces `requireAdministrator(locals.user)` with a plain `if (!locals.user)` authentication check, leaving the endpoint open to any signed-in reader.
- ✅ Verified all local gates (`typecheck`, `lint`, `test` — 12 unit + 13 e2e) still pass with the bug in place. That's the whole point: no existing test covers the non-admin-authenticated path, so only a reviewer notices.
- 🛠 Both `yet-another-dry-run` and `planted-bug/admin-feature` pushed to `origin` (`github.com/stevekinney/shelf-life`).

## Checkpoint I — Static layer

All six parts of the lab landed on shelf-life:

- 🛠 **ESLint custom rules** — `eslint.config.js` grows two `no-restricted-syntax` blocks (global + `tests/end-to-end/`-scoped) banning `page.waitForTimeout`, raw `page.locator('...')` string selectors, `waitForLoadState('networkidle')`, and reading `userId` from the request body. Error messages reference the relevant `CLAUDE.md` sections.
- 🛠 **TypeScript strict** — `tsconfig.json` adds `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch` on top of `strict`. 11 existing `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` errors fixed across `vite.config.ts`, the shelf CRUD endpoints, the seed endpoint, the `[entryId]` PATCH handler, and the design-system page (every `const [first] = array` pattern now checks the element before use).
- 🛠 **Knip** — `knip.json` configures the SvelteKit entry/project globs. `npm run knip` (with `DATABASE_URL=file:./tmp/knip.db` so drizzle.config.ts loads without a developer `.env`). First pass flagged a dozen findings — all cleaned:
  - Deleted `src/lib/index.ts` (unused barrel).
  - Removed the back-compat `seedDatabase` alias from `tests/end-to-end/helpers/seed.ts`.
  - Dropped `export` from `starterBooks`, `isAdministrator`, and `ShelfEntrySummary` (only used internally).
  - Installed `playwright` as a direct devDependency since `tools/shelf-verification-server/server.ts` imports from it.
  - Added `@tailwindcss/forms`, `@tailwindcss/typography`, `tailwindcss` to `ignoreDependencies` (used transitively through `@tailwindcss/vite`).
- 🛠 **Husky + lint-staged** — `.husky/pre-commit` runs `npm run pre-commit` (→ `lint-staged`), `.husky/pre-push` runs `npm run pre-push` (→ `typecheck && knip && test:unit`). `package.json` gains a `lint-staged` block that runs ESLint + Prettier on staged `.ts`/`.svelte`/etc., Prettier on docs/JSON, and the Gitleaks staged-snapshot script on every staged file. `prepare` script preserves `playwright install` and `svelte-kit sync` after `husky init` clobbered it.
- 🛠 **Gitleaks** — `.gitleaks.toml` allowlists `sample-config.json`, `tests/fixtures/`, `playwright-report/`, `.env.example`. `scripts/run-gitleaks-staged.ts` copies the exact git index into a `mkdtempSync` directory, runs `gitleaks dir --redact --config .gitleaks.toml`, and propagates the exit code. `sample-config.json` (new, deliberately bait) contains fake `AKIAIOSFODNN7EXAMPLE` bytes and is allowlisted.
- 🛠 **CLAUDE.md** — "What done means" now lists four commands (`typecheck`, `lint`, `knip`, `test`). New sections: "Static layer" (names the ESLint rule block, the strict tsconfig flags, the knip source of truth) and "Git hooks and secrets" (husky, lint-staged, Gitleaks). The "Do not" section gains the `--no-verify` ban. Final file is 92 lines, under the lab's 150-line cap.

**Verification:**

- `npm run typecheck` ✓ (0 errors on 1258 files under strict + exactOptionalPropertyTypes + noUncheckedIndexedAccess)
- `npm run lint` ✓
- `npm run knip` ✓ (0 findings)
- `npm run test` ✓ (12 unit + 13 e2e)
- Gitleaks hook drill: staging a file containing a realistic-looking `BETTER_AUTH_SECRET` → `npx tsx scripts/run-gitleaks-staged.ts` exits `1` with "leaks found: 1". Staging the allowlisted `sample-config.json` → exits `0` with "no leaks found".
- Lint drill: the lab's planted `page.waitForTimeout(1000)` and `page.locator('.foo')` patterns both fire on `npm run lint` and name the fix in the message; reverting the change returns lint to green.

### ⚠️ Hard gate hit

- The committee-review pre-tool hook blocked `gh pr create` from running directly — per global settings, all PRs must go through the committee-review skill. That conflicts with this specific lab's goal: the PR is a deliberately planted bug that needs **Bugbot** to be the first reviewer, not Claude's internal committee.
- **User follow-up needed:** open the PR manually at `https://github.com/stevekinney/shelf-life/pull/new/planted-bug/admin-feature` (base: `yet-another-dry-run`, or whichever branch becomes main after the final reconciliation step), then verify Bugbot catches the planted bug. Bugbot install status on the fork is also outside this dry run's scope — recorded in the final reconciliation task #15.

**Verification:**

- `npm run typecheck` + `npm run lint` + `npm run test` all green.
- Exercised the dossier loop end-to-end:
  1. Moved `shelf-page-authenticated-darwin.png` out of the snapshot directory to force a visual-regression failure.
  2. `npm run test:e2e -- --grep "shelf page matches"` → 1 failed, 1 passed (the dossier generation happens because the JSON reporter ran). Playwright wrote `trace.zip`, retained video, and the error context under `playwright-report/test-results/`.
  3. Moved the baseline back.
  4. `npm run dossier` → "Wrote dossier for 1 failure(s) to playwright-report/dossier.md".
  5. The generated `dossier.md` includes the test title, project name (`authenticated`), file location (`visual-authenticated.spec.ts:8`), full Playwright error message, relative paths to the diff screenshot and retained video, a `npx playwright show-trace` one-liner, and a reproduction command scoped to the failing test.
- Green-state dossier run also verified: `npm run dossier` exits zero and writes "No failing tests." when `report.json` has no failures.

## Checkpoint J — CI wiring

### `ci-as-the-loop-of-last-resort.md`

- 🔧 Removed the "Third-run validation note" callout and the "no Git remote configured" phrasing. Replaced with plain prose pointing at Shelf's `npm`, `actions/setup-node@v4`, and the `~/.npm` + `~/.cache/ms-playwright` cache pair.
- 🔧 Multiple "in the validated third-run Shelf repository" / "the third-run repository" phrases in prose rewritten to "Shelf" without the validation framing.

### `lab-write-the-ci-workflow-from-scratch.md`

- 🔧 Removed the "Third-run validation note" callout plus the "uses npm, not Bun" qualifier plus the "no Git remote configured" framing.
- 🔧 Rewrote "In the current Shelf repository", "In the validated third run", "In the remote-less workshop repo", and "In the third-run repository" into plain prose referencing Shelf directly.

### Shelf changes

- 🛠 `.github/workflows/main.yml` — 3 jobs: `static` (lint + typecheck + knip + `gitleaks/gitleaks-action@v2`), `unit` (Vitest, `needs: static`), `end-to-end` (Playwright, `needs: static`, installs chromium, writes a CI `.env` with `ENABLE_TEST_SEED=true` + a fake `BETTER_AUTH_SECRET` + `file:./tmp/ci.db`, runs the suite, and uploads `playwright-report/` plus `playwright-report/dossier.md` as separate artifacts on failure with `retention-days: 7`). Every job uses `actions/cache@v4` for `~/.npm` + `~/.cache/ms-playwright`.
- 🛠 `.github/workflows/nightly.yml` — 3 placeholder jobs: `har-refresh` (echo placeholder), `dependency-audit` (`npm audit --audit-level=high`), `cross-browser` (matrix over chromium/firefox/webkit with `fail-fast: false`, echo-only pending per-worker DB isolation).

**Verification:**

- Both YAML files parse via the `yaml` package.
- Every named step (`npm run lint`, `npm run typecheck`, `npm run knip`, `npm run test:unit`, `npm run test:e2e`, `npm run dossier`) maps to a real script in `package.json`.
- `main.yml` has no matrix so `fail-fast: false` isn't required there; `nightly.yml`'s cross-browser matrix does set it.
- Hosted run kicks in as soon as this commit is pushed to `origin`. The "agent loop check" exercise in the lab becomes exercisable for the first time against real GitHub Actions.

**Hosted run result:** pushed commit `6513719` triggered run `24204943037`, which failed at the `Secret scan` step. Root cause: `gitleaks/gitleaks-action@v2` does a partial scan over `<prev>^..<current>` using `git log --no-merges --first-parent`, but the branch had no prior commit with the workflow file present, so the range was invalid (`[git] 'git <command> [<revision>...] -- [<file>...]'` error). The scan itself found "no leaks" but the git range error flipped the exit code. Classic first-push-after-workflow-added failure mode.

**Fix:** replaced `gitleaks/gitleaks-action@v2` with a direct install + `gitleaks dir . --redact --config .gitleaks.toml` CLI invocation. Same scan surface, no dependency on the action's commit-range heuristic.

## Checkpoint K — Post-deploy validation

### `post-merge-and-post-deploy-validation.md`

- ✅ Concept-only lesson. No drift.

### `lab-add-post-deploy-smoke-checks-to-shelf.md`

- ✅ No drift — the lab already handles the "no hosted target yet" case with an explicit local build+preview fallback and a "document the hosted gap in `docs/post-deploy-playbook.md`" instruction.

### Shelf changes

- 🛠 `tests/smoke/post-deploy.spec.ts` — minimal smoke test, reads `SMOKE_BASE_URL` (default `http://127.0.0.1:4173`), verifies the home page's `h1` and a "Sign in" link inside `<main>`.
- 🛠 `playwright.smoke.config.ts` — dedicated Playwright config so `test:smoke` doesn't fight the main suite's webServer block, writes its HTML report to `playwright-report/smoke-html/`, retains traces + screenshots on failure.
- 🛠 `npm run test:smoke` script that invokes the new config directly.
- 🛠 `docs/post-deploy-playbook.md` documents the target URL variable, the named command, what the smoke test actually proves, the stop-ship failures, the rollback action (currently "push a revert to `main`" pending a hosted deploy), the five-minute health window, and the hosted-gap note.

**Verification:**

- `npm run test:smoke` passes against a local `npm run preview` on 4173.
- `npm run test` continues to pass (13 e2e + 12 unit) — the smoke spec lives in `tests/smoke/`, outside the e2e suite's `testDir: 'tests/end-to-end'`.
- `npm run knip` stays at 0 findings.
- Hosted smoke loop: **not executed**. Shelf has no deploy target. The playbook documents the gap explicitly so future reconciliation knows which lines to replace when a real deploy lands.
