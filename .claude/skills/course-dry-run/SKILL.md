---
name: course-dry-run
description: Walk the Self-Testing AI Agents course end-to-end against the current shelf-life main, patch drift, audit prose for unexplained code, add screenshots where a reader would want a visual reference, and reconcile main. Use when the user asks to "dry-run the course", "rerun the dry run", "validate the course against the starter", or any equivalent phrasing about reconciling shelf-life with /Users/stevekinney/Developer/stevekinney.net/courses/self-testing-ai-agents.
---

# Course dry-run

Repeatable validation pass for the **Self-Testing AI Agents** course. The job is to actually execute every lesson and lab a reader can execute locally against the `shelf-life` starter, capture screenshots where a reader would want one, audit the prose for unexplained code, backport anything that belongs in the starting state, and reconcile `main` so a fresh clone walks the course cleanly.

## The two repositories

- **Code:** `/Users/stevekinney/Developer/shelf-life` — SvelteKit + TypeScript book app.
- **Course:** `/Users/stevekinney/Developer/stevekinney.net/courses/self-testing-ai-agents` — 46 lesson + lab markdown files plus `./assets/`. Use `index.toml` as the canonical walk order. Already allowed via `.claude/settings.json`; edit directly without prompting.

## Session slug

At the very start of the skill, capture one `<session-slug>` of the form `YYYYMMDD-HHMMSS-<4-char-hash>` and reuse it for the rest of the run. Every mutable artifact is namespaced by this slug: worktree paths, the integration branch, the safety tag, the course edit branch, the port registry. The slug is the canonical namespace — if any artifact for the current slug already exists at startup, that is a hard stop.

## The loading rule for pitfalls

Read `references/pitfalls.md` before touching visual-regression baselines, CI workflow YAML, or `.husky/` scripts. Those are the three surfaces that have bitten prior runs. Do not load it speculatively.

## Phase 0 — Preflight and authorization

Before touching anything, run the preflight and ask the authorization question.

**Two-repository preflight.**

- **shelf-life:** clean worktree, on `main` (or a dry-run branch off `main`), `git fetch` succeeds. Baseline hosted CI state on `main` is **recorded, not gated** — capture `gh run list --commit <current main SHA> --limit 1 --json status,conclusion` into `DRY-RUN-NOTES.md` as the baseline. A red baseline is explicitly allowed and is often exactly the reason the skill is being run; it does not block Phase 1.
- **stevekinney.net:** clean worktree, create a new `course-dry-run/<session-slug>` branch off the default branch, verify the branch name is not already in use. Do not reuse pre-existing `playwright-dry-run-edits` or sibling branches — every run gets its own namespaced branch.

If preflight fails for any reason other than baseline-CI-red, stop and surface the specific failure. No automatic cleanup of unrelated state.

**Stale-run collision check.** Before creating any worktree or the `starter-baseline/<session-slug>` integration branch, scan for prior-run artifacts. If an artifact for the current slug already exists — hard stop. If differently-slugged artifacts exist under `tmp/dry-run/`, surface them with `git worktree list` and ask via `AskUserQuestion` whether to keep them for forensic review or prune them via `git worktree remove`. Never implicitly reuse a prior worktree.

**Authorization mode.** Ask once via `AskUserQuestion` whether the session is `local-only` or `remote-authorized`. Record the answer in `DRY-RUN-NOTES.md`. Never re-ask per push.

- `local-only` — zero remote writes. Every remote-gated lab stops at the network boundary and logs `blocked-by-external`.
- `remote-authorized` — the following pushes are pre-approved for the session, with no further prompts (all namespaced by the current `<session-slug>`):
  - First push of any branch matching `dry-run/<session-slug>*`, `course-dry-run/<session-slug>`, or `starter-baseline/<session-slug>` to `origin`.
  - Push of the annotated tag `pre-dry-run/<session-slug>` to `origin`.

Hard gates regardless of mode: opening a PR (also blocked by the committee-review hook — log the manual URL and continue), force-push or any push to `main`, any push or rebase touching `planted-bug/admin-feature`, any origin-branch deletion.

## Phase 1 — Walk every lab and actually execute it

Walk `index.toml` in order. For **every** lab, classify, isolate, bootstrap, execute, capture, and log. Do not skim. A lab is not ✅ until the execution log entry is written.

### Prerequisite class

Assign exactly one class to each lab. Full-execution promises apply only to `local-only`.

- **local-only** — everything happens inside a shelf-life worktree. Execute the commands, write the files, observe output, run the four gates.
- **GitHub-remote** — requires pushing a branch or interacting with GitHub Actions (Bugbot lab, nightly workflow lab, post-deploy smoke lab, capstone, review-portability lab). Execute up to the first remote-write boundary. If `remote-authorized`, push the namespaced branch and log the manual PR URL without invoking `gh pr create`. If `local-only`, stop at the network boundary and log `blocked-by-external`.
- **third-party SaaS** — Bugbot, external review bots. Set up everything local-side, log a manual continuation point with the exact steps a reader would take.
- **hosted-deploy** — post-deploy validation, nightly checks pointed at a live origin. Treated like SaaS.

For any non-`local-only` lab, the log records a degraded outcome (`local-setup-complete`, `blocked-by-external`, or `manual-continuation-logged`) rather than a false ✅.

### Execution mode

Isolation is mechanical via git worktrees under `tmp/dry-run/<session-slug>/`, never in-place cleanup. `git clean -fdx` does not count as isolation because tracked files from earlier labs would persist.

- **fresh-main** — a dedicated worktree at `tmp/dry-run/<session-slug>/fresh/<lab-slug>/` off the captured baseline `main` SHA. Default for labs that exercise setup and bootstrap.
- **checkpoint-accumulated** — a named worktree per checkpoint at `tmp/dry-run/<session-slug>/checkpoint-<n>/`. Labs inside one checkpoint share that worktree; the next checkpoint gets a new worktree branched off the previous checkpoint's tip.
- **shipped-end-state** — shelf-life already ships the lab's end state. Verify behavior against the dry-run working branch without rebuilding.

`fresh-main` worktrees are created, bootstrapped, used for exactly one lab, and left in place for forensic review until session teardown.

### Worktree bootstrap (serial, standardized on 4173)

Three facts constrain the bootstrap:

- `.env.example` is intentionally incomplete — `cp .env.example .env` leaves auth and the seed endpoint broken.
- `vite preview` does not build; it serves a prior build. A fresh worktree has no build output.
- `npm run test` launches its own Playwright `webServer` on `4173`. A bootstrap server already bound to `4173` collides with the gates.

Therefore: the bootstrap is **serial**, exactly one worktree has an active preview server at a time, and everything runs on `4173` so `ORIGIN`, `webServer.port`, and `baseURL` all agree.

Immediately after `git worktree add`, before any lab commands, in this exact order:

1. `cp .claude/skills/course-dry-run/references/dry-run.env.template .env` inside the worktree, then replace `__DRY_RUN_SECRET__` with an `openssl rand -hex 16` value. The real secret is synthesized at copy time and never lands in version control; the template stays clean under `.gitleaks.toml`.
2. Exclude the worktree's own nested `tmp/` via `.git/info/exclude` so `git status` stays clean.
3. `npm ci` (not `npm install` — match lockfile semantics).
4. `npm run prepare`.
5. `npx drizzle-kit push --force`.
6. `npm run build` — **required before `preview`**. Do not skip.
7. Verify `4173` is free: `lsof -nP -iTCP:4173 -sTCP:LISTEN` must return empty. If the port is in use, hard stop — never silently race another server.
8. Launch the preview server: `ENABLE_TEST_SEED=true npm run preview -- --host 127.0.0.1 --port 4173` in the background. Poll `GET http://127.0.0.1:4173/` for readiness with a five-attempt cap.
9. Seed: `curl -s -X POST http://127.0.0.1:4173/api/testing/seed -H 'Content-Type: application/json' -d '{"resetUsers": true}'`.
10. Record the server PID.

**Teardown before the four gates.** Before running `npm run typecheck && npm run lint && npm run knip && npm run test`, tear down the bootstrap preview server: SIGTERM, SIGKILL after 3 seconds, verify `4173` is free again. The gates will start their own `webServer` on `4173`. Lab execution and screenshot capture use the bootstrap server; gates use Playwright's own server.

`fresh-main` worktrees never relaunch their server after gates exit. `checkpoint-accumulated` worktrees can relaunch for the next lab in the same checkpoint.

### Red-path labs

Several labs (`post-deploy`, `nightly`, `failure-dossier`, `visual-regression`, `planted-bug`) require an intentional failure before the green state is restored. The four gates can't run after every red state. For these labs the execution log has **two checkpoints**:

- **red observed** — with the captured artifact (failing test output, dossier page, diff image).
- **green restored** — four gates exit zero.

Only the green checkpoint is required before moving on.

### Screenshot decision

Every lab gets exactly one `screenshot decision` value in its log entry:

- **captured** — path to the new image, alt text, the lesson/lab file the image is embedded into, and the line/section where it was inlined.
- **text-only** — output captured in a fenced code block in the lesson. Used for CLI-only labs.
- **blocked** — remote-gated or third-party; visual state not capturable locally. Reason recorded.

**Capture rules.** Browser screenshots via headless Playwright against the seeded preview server. Never `screencapture -R` (Darwin-only, non-deterministic). Terminal output goes to fenced blocks, never screenshots. Visual-regression diffs, Playwright trace screenshots, and dossier renderings are **reused from `playwright-report/` and `test-results/`**, not re-captured.

**When to capture.** If the lesson prose says "you'll see…" or "the output looks like…" and the output is browser-visible, capture it. CLI-only moments become fenced blocks.

**Where.** New images go to `../stevekinney.net/courses/self-testing-ai-agents/assets/` with descriptive kebab-case filenames. Edit the lesson or lab markdown in the course repo to embed `![alt](assets/filename.png)` in the spot the prose describes.

### Execution log entry (per lab)

Append a structured entry to `DRY-RUN-NOTES.md` for each lab. Fields:

- **lab** — `index.toml` slug
- **prerequisite-class** — one of the four classes
- **execution-mode** — `fresh-main` / `checkpoint-accumulated` / `shipped-end-state`
- **worktree-path** — absolute path under `tmp/dry-run/<session-slug>/`
- **bootstrap** — `ok` plus server PID, or the failure point
- **commands-run** — the actual lab commands executed
- **screenshot-decision** — `captured` / `text-only` / `blocked` with the required sub-fields
- **red-observed** (red-path labs only) — captured artifact path
- **green-restored** (red-path labs only) — four-gate exit codes
- **gates** — typecheck / lint / knip / test exit codes
- **files-touched** — every path modified, keyed by worktree
- **status** — ✅ clean / 🔧 fixed inline / 🛠 shelf code change / ⚠️ needs user attention / ⏸ prose-only / `blocked-by-external` / `local-setup-complete` / `manual-continuation-logged`
- **final-outcome** — one sentence

## Phase 2 — Backport ledger

Before the prose audit, consolidate everything the dry run touched into a **path-centric backport ledger** in `DRY-RUN-NOTES.md`. The ledger is anchored to `base-sha` values and stores decisions as **diff context**, not raw line ranges — line numbers drift as later labs edit the same files. The ledger is a living index, not write-once.

Schema per entry:

- **path**
- **base-sha** — the commit the entry was classified against (initially the preflight `main` SHA; updated if revised).
- **introduced-in-lab** — or `pre-existing` for drift fixes.
- **required-before-lab** — earliest lab assuming this file/region already exists, or `none`.
- **classification** — one of:
  - _starting-state_ — whole file ships on `main`.
  - _mixed_ — file contains both scaffold and lab-delta hunks.
  - _lab-output_ — stays off `main`.
  - _infrastructure_ — deleted before reconcile.
- **scaffold-patch** — for _mixed_: unified diff against `base-sha` with ±3 lines of context, showing the scaffold-side hunks only. For _starting-state_: the full file contents. Omitted for _lab-output_ and _infrastructure_.
- **final-action** — exact command or edit applied during reconciliation (`git apply --3way <patch>`, `rm <path>`, `cherry-pick <sha>`).
- **reason** — one sentence.

**Decision rule.** If a reader cloning `main` would hit a lab that assumes this path exists, the scaffold portion ships on `main`; the lab-delta portion does not.

**Re-anchoring.** If a later lab re-touches a file already in the ledger, the ledger entry is re-anchored to a new `base-sha` and the `scaffold-patch` is regenerated. Never leave stale patches.

## Phase 3 — Prose audit

After Phase 2, dispatch an Explore agent to walk all 46 files systematically. The audit asks two questions for every lesson + lab pair:

1. **Code coverage.** Does the lesson introduce every piece of code, config, API, file path, and command that the matching lab asks the reader to write?
2. **Screenshot coverage.** Does the lesson show the reader what success looks like visually, where a visual is appropriate?

Rank gaps by severity in both tracks: CRITICAL (blocks lab completion or makes it unverifiable), MODERATE (requires external knowledge or slows comprehension), MINOR (polish). CLI-only labs cannot have screenshot gaps by definition.

Failure modes to watch for in the code-coverage track:

- Lab asks for a script that parses some tool's JSON output; lesson never shows the schema or a walk of the structure.
- Lab asks for config values the lesson names but never explains.
- Lab asks for an ESLint selector, GitHub Actions YAML, Playwright projects block, or markdown playbook structure the lesson mentions in prose but never shows in code.
- Lab references a file path the lesson says "you'll see" but never introduces.

## Phase 4 — Fill every gap

For each gap Phase 3 surfaces:

- **CRITICAL or MODERATE code gap.** Add the code to the lesson body. Show the actual schema, the actual walk, the actual selector, with plain-English explanation. Cross-reference the shipped file in the starter using the pattern "Shelf ships X; read the sketch above to understand the walk, then open the shipped file to see the production shape."
- **CRITICAL or MODERATE screenshot gap.** Capture the image as described in Phase 1's screenshot decision protocol and embed it.
- **MINOR.** Either show the code / capture the image, or reframe the lab to point at a specific lesson section and shipped file.

**Edit direction.** Default to shipped-code-as-truth: when prose drifts from shipped code, edit the prose. But the corollary is real — _if the shipped code is wrong and the prose is right, fix the shipped code_. Whichever side better serves a first-time reader wins.

Then walk every lab one more time asking "is there anything the reader would still have to invent?" Where a lab still asks for speculative work, rewrite as a walkthrough of the shipped file with section-specific pointers back to the lesson.

## Phase 5 — Reconcile `main`

Look at all dry-run branches in shelf-life (`git branch -a`). Compare their tips. They should converge on roughly the same file set. Proceed through the safety rails in order:

1. **Pre-reconcile safety tag.** Before any mutation of `main`, tag the current `main` SHA as `pre-dry-run/<session-slug>` and push the tag (remote write pre-approved in `remote-authorized` mode). This is the rollback anchor.
2. **Integration branch.** Create `starter-baseline/<session-slug>` off the dry-run working branch. Replay ledger entries against it: `git apply --3way` each _mixed_ entry's `scaffold-patch` against its recorded `base-sha`; write whole-file _starting-state_ entries directly; delete _infrastructure_ entries. **A patch that no longer applies cleanly is surfaced for manual decision, not silently skipped.**
3. **Gates on the integration branch.** Run `npm ci && npm run typecheck && npm run lint && npm run knip && npm run test` on `starter-baseline/<session-slug>`. All four must exit zero.
4. **Delete dry-run-internal files** on `starter-baseline/<session-slug>` (`DRY-RUN-NOTES.md`, any other transient files).
5. **Fast-forward `main`** to `starter-baseline/<session-slug>` (force-push is a hard gate — ask first).
6. **Rebase `planted-bug/admin-feature`** onto the new `main` with `--force-with-lease`. Rebasing or pushing this branch is a hard gate — ask before proceeding.
7. **Clean-clone verification.** Clone `main` into a scratch directory and run `npm ci && npm run typecheck && npm run lint && npm run knip && npm run test`. All four must exit zero.
8. **Hosted CI by SHA.** Capture the new `main` SHA and poll `gh run list --commit <sha> --limit 1 --json status,conclusion` with a five-attempt cap until the run targeting that SHA completes successfully. Stale green runs on an earlier commit do not count.
9. **Deferred origin-branch deletion.** Only after step 8 passes, delete legacy dry-run branches from `origin` (hard gate — ask). Local deletion can happen earlier.

## Operating rules

- When the user locks in a decision via `AskUserQuestion`, treat it as authoritative for the rest of the session. Do not ask twice.
- Never use `--no-verify`. When the pre-commit hook complains, fix the underlying issue.
- When `gh pr create` is blocked by the committee-review hook, log the manual-follow-up URL (`https://github.com/stevekinney/shelf-life/pull/new/<branch>`) and continue. Opening the PR is a manual user follow-up.
- For checkpoints that reference external tooling (Bugbot, post-deploy targets, review bots), treat unavailable tooling as a known limitation and record it in `DRY-RUN-NOTES.md` under `⚠️ needs user attention` — do not stub around it.
- When you finish a checkpoint, report a short summary (what fired, what drifted, what committed, what got captured as a screenshot). Do not pause for permission between checkpoints unless you hit a hard gate.

## What "done" means

- Clean clone of `main` passes the four gates on first try.
- Hosted CI on the new `main` SHA is green (verified by SHA, not by branch).
- `planted-bug/admin-feature` rebased cleanly onto new `main`, single-commit diff is just the permission-check swap.
- No dry-run-internal files on `main` (`DRY-RUN-NOTES.md`, `RECONCILIATION.md`, safety tags aside).
- Only `main` and `planted-bug/admin-feature` branches exist locally and on `origin` (plus the `pre-dry-run/<session-slug>` tag).
- Every course lesson referenced by a lab either shows the code the lab asks for or points at a specific file in `main` the lab can be rebuilt from.
- Every screenshot in `courses/self-testing-ai-agents/assets/` matches what the current `main` renders, and Phase 3 screenshot gaps are filled.
- Zero remaining "dry run" / "Third dry run" / "current Shelf replay" callouts in published course prose.
- `DRY-RUN-NOTES.md` on the working branch records every lab entry and the complete backport ledger so the user can review the cumulative diff before the reconciliation commit deletes the file.

## How to start

1. Capture `<session-slug>`.
2. Read `index.toml` at `/Users/stevekinney/Developer/stevekinney.net/courses/self-testing-ai-agents/index.toml`.
3. `git branch -a` on shelf-life; `gh run list --commit <current main SHA> --limit 3`.
4. Run Phase 0: preflight, stale-run collision check, authorization question.
5. Proceed through Phases 1–5. Report progress after each phase completes.
