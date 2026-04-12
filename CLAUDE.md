# Shelf Starter Instructions

Shelf is the starter repository for the **Self-Testing AI Agents** course. It is a real SvelteKit + TypeScript book application, not a generated scaffold.

## What "done" means

A task is not done until all four exit zero, in this order:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run knip`
4. `npm run test`

Do not report a task complete with any of these failing. If a failure looks unrelated, say so explicitly and link the failing test name in your summary.

## Routes

- Public: `/`, `/login`, `/design-system`, `/playground`
- Protected: `/search`, `/shelf`, `/admin` — gate server-side on `locals.user`, never with client guards
- `/playground` is the lab fixture for `lab-locator-challenges`. It ships three intentional a11y violations (div-as-button, icon-only button with no accessible name) that trip svelte-check warnings on every typecheck and build. Do not "fix" them — they are the bad examples the lab targets.
- `/admin` is the protected fixture for `lab-bugbot-on-a-planted-bug`. The planted permission bug lives on branch `planted-bug/admin-feature`; `main`'s admin route is the clean baseline.
- Do not reintroduce `src/routes/demo/` or any generated starter pages
- New routes must match the Shelf product domain (books, shelves, ratings)

## How tests get written

- Write a failing test before the implementation. Commit the test first.
- Unit tests live next to the file under test as `<name>.test.ts` and run with Vitest.
- End-to-end tests live in `tests/end-to-end/` and run with Playwright.
- Test fixtures live in `tests/fixtures/` (including HAR files). Share data there instead of redefining it per spec.

## Playwright locator rules

- `getByRole` first. `getByLabel` or `getByText` second. `data-testid` only when semantics genuinely don't exist.
- Never use raw CSS or XPath selectors in specs.
- Never use `page.waitForTimeout` or `page.waitForLoadState('networkidle')`. Use `expect(locator).toBeVisible()`, `page.waitForResponse`, or `page.waitForRequest`.
- When a Playwright test fails, open `playwright-report/index.html` and its trace before proposing a fix.

## Playwright authentication

- Login happens once in `tests/end-to-end/authentication.setup.ts` and all authenticated specs inherit the resulting storage state.
- Never log in from inside a regular test. If a test redirects to `/login`, the setup file is broken — do not add a login block to the failing test.
- Never commit `playwright/.authentication/` — it contains real session cookies.

## Database seeding and isolation

- Tests call `seedFreshDatabase` (setup project only) or `resetShelfContent` (individual specs) from `tests/end-to-end/helpers/seed.ts`. Both POST to the dev-only `/api/testing/seed` endpoint, which is gated on `ENABLE_TEST_SEED=true`.
- Individual specs must never reset users — that invalidates the stored browser session. Use `resetShelfContent`.
- The starter pins `workers: 1` in `playwright.config.ts` because every worker currently points at the same SQLite file. Do not flip `fullyParallel`-related knobs without adding per-worker database isolation first.

## HAR recording

- HARs live in `tests/fixtures/` and replay through `page.routeFromHAR` with `notFound: 'abort'`.
- Never commit a new HAR without a human reviewing it — HARs can contain credentials.
- Do not re-record a HAR to fix a failing test. If the HAR no longer matches, the application changed in a way that deserves investigation.

## Accessibility

- Run `tests/end-to-end/accessibility.spec.ts` after any meaningful UI change. Treat new axe violations as blocking.
- Complex UI flows (dialogs, menus) also get a manual pass through `docs/accessibility-smoke-checklist.md`.
- Suppressions must be scoped narrowly with a written reason in code.

## When a test fails

1. Run `npm run dossier` to generate a summary at `playwright-report/dossier.md`.
2. Read the dossier. It contains the error, screenshot path, trace path, and reproduction command for every failing test.
3. Use the reproduction command to rerun just the failing test while you iterate.
4. Do not "fix" a failing test by changing the assertion. Fix the underlying code.
5. Do not add `console.log` calls to test files to debug. The trace already has the DOM at every step; open it with `npx playwright show-trace <path>`.

## UI copy

- User-facing copy stays about books, shelves, and reading. Do not mention Playwright, seeded fixtures, test IDs, HARs, or course material in rendered page copy.
- Testing rationale and infrastructure details belong in code comments, `CLAUDE.md`, or `README.md`.

## Static layer

- `eslint.config.js` bans `page.waitForTimeout`, raw `page.locator('...')` strings, `waitForLoadState('networkidle')`, and reading `userId` from the request body. The error messages name the fix and reference this file — read them instead of silencing them.
- `tsconfig.json` ships with `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, and `noFallthroughCasesInSwitch`. Respect them. Do not bypass with `@ts-expect-error`.
- `knip.json` is the dead-code source of truth. Every file you touch must leave `npm run knip` at zero findings — either complete the wiring so the file is actually used, or delete it.

## Git hooks and secrets

- `lefthook` manages git hooks via `lefthook.yml` at the repo root. Pre-commit runs ESLint, Prettier, and a Gitleaks scan on staged files; pre-push runs typecheck + knip + unit tests via `npm run pre-push`. Never commit with `--no-verify`.
- The pre-commit `secrets` command shells out to `scripts/run-gitleaks-staged.ts`, which materializes the staged index into a tmp directory and runs `gitleaks dir` against it — that is more reliable for newly-added files than Gitleaks' direct staged mode.
- Never commit real secrets. `sample-config.json` and `tests/fixtures/` are deliberate bait allowlisted in `.gitleaks.toml`. Use obviously-fake placeholder values (`your_api_key_here`), not strings that pattern-match real formats.

## Do not

- Do not silence type errors with `any` or `@ts-expect-error`. Fix the type.
- Do not add `eslint-disable` comments. Fix the code.
- Do not add new dependencies without flagging them in your summary.
- Do not modify `src/lib/server/db/auth.schema.ts` by hand — regenerate with `npm run auth:schema`.
- Do not use `git commit --no-verify` to bypass hooks. If a hook is wrong, fix the hook.
