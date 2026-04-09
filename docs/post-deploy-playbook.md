# Post-deploy playbook

## Target URL

The smoke test reads `SMOKE_BASE_URL` from the environment. For local preview this should be `http://127.0.0.1:4173`; for a hosted deploy the deployment workflow is expected to inject the actual deployed URL.

## Named command

```sh
SMOKE_BASE_URL=https://shelf.example npm run test:smoke
```

Runs `playwright test --config=playwright.smoke.config.ts`, which executes `tests/smoke/post-deploy.spec.ts` against the target URL. The config retains traces and screenshots only on failure and writes the HTML report to `playwright-report/smoke-html/`.

## What the smoke test proves

- The home page loads over HTTPS (or HTTP for local preview).
- The top-level `<h1>` is visible.
- The main content area exposes a "Sign in" link, which means the unauthenticated layout rendered.

That's it. This is a tripwire, not a regression suite. Deeper validation is the job of the end-to-end suite in `tests/end-to-end/`.

## Stop-ship failures

If any of the following is true immediately after a deploy, the rollout is a stop-ship:

- The smoke test fails. Either the page did not render or the sign-in affordance is missing.
- `/login` returns a 5xx response when hit directly.
- The runtime logs for the deployment show any uncaught exception tagged `BetterAuth` or `DrizzleQueryError`.
- The post-deploy error rate is higher than the pre-deploy error rate for more than five minutes.

## Who rolls back

For the workshop Shelf repository there is no hosted target yet, so the rollback action is "push a revert commit to `main`." Once a real deploy target is wired in, replace this section with the specific workflow or CLI command that rolls the deployment back.

## Health window

Watch for five minutes after a deploy:

- error rate stayed flat or dropped
- request latency did not jump more than 20% from the baseline
- no new repeating exceptions in the runtime logs
- any background workers (none today) are still healthy

If any of those go red, roll back. Do not argue about it in a PR thread.

## Hosted gap

Shelf does not ship a hosted deploy target in the starter. The smoke test and the scripts here work end-to-end against `npm run preview` locally. When a hosted target lands, replace the local `http://127.0.0.1:4173` default with the real deployment URL and delete this section.
