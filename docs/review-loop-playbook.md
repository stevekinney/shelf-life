# Review loop playbook

This is the neutral, tool-agnostic description of how the second-opinion loop works on Shelf. It survives a switch from Bugbot to any other reviewer (Copilot, Codex, CodeRabbit, Claude Code) because it describes the rules instead of the tool.

## Finding categories

### Blocking

A finding is blocking when it matches one of these patterns:

- An API handler under `src/routes/api/` reads user identity from the request body instead of `locals.user`.
- An admin-only route handler (anything under `src/routes/api/admin/**`) does not call `requireAdministrator(locals.user)` from `$lib/server/authorization`.
- A Drizzle query operating on user-owned data (`shelfEntry`, `readingGoal`) does not scope by the current user.
- A `catch` block swallows an error and returns a 2xx response.
- A Playwright spec uses `page.waitForTimeout`, a raw CSS `page.locator`, or a UI login flow outside `authentication.setup.ts`.
- A change removes the `npm run dossier` script, the `playwright-report/report.json` reporter, or the retained trace configuration.

Blocking findings must be fixed before merge. If the reviewer disagrees with the blocking label, escalate in a comment thread rather than ignoring the finding.

### Judgment

A finding needs judgment when it is symptom-level: "this name is unclear," "this error message could be better," "this helper could be extracted." These are worth reading and usually worth addressing, but the reviewer is welcome to push back with reasoning rather than blindly complying.

### Noise

A finding counts as noise when it applies to:

- Generated files under `playwright-report/` or `build/`
- Snapshot PNGs under `tests/end-to-end/*-snapshots/`
- HAR fixtures under `tests/fixtures/*.har`
- `sample-config.json` and `.env.example` (allowlisted for the course bait demo)
- Lockfiles

If the reviewer keeps producing noise in these categories, update its instructions surface (`.cursor/BUGBOT.md`, `.github/copilot-instructions.md`, or whatever file the chosen reviewer reads).

## The rule of three

When the same kind of finding shows up on three different pull requests, the problem is upstream:

1. **First two occurrences**: fix the PR and move on.
2. **Third occurrence**: add a rule to `CLAUDE.md` that encodes the finding.
3. **Still recurring after the rule**: add a lint rule, a test assertion, or a CI gate that makes the bad pattern a hard fail instead of an advisory comment.

Every consistent review finding is information about where the upstream prevention is weak. The review bot is not the end of the loop — it's the observer that tells you what to automate next.

## Re-review path

After a fix lands on a pull request, the reviewer reruns automatically on the next push. The agent's job on the second pass is the same as on the first: read the diff, apply the blocking rules, suggest the specific fix, shut up about the rest.

If the reviewer stays silent on a remaining blocking pattern, that is a gap in the rules file. Open a small follow-up commit that updates the reviewer's instructions.
