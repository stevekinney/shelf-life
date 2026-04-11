import { expect, test } from '@playwright/test';

/**
 * Trace A: config / auth mismatch.
 *
 * This spec is part of the "Triage Three Traces" lab and is intentionally
 * broken. It opts out of the authenticated storage state that the
 * `labs-broken-traces` project mounts by default, so when it navigates to
 * `/shelf` the server redirects it to `/login` (Shelf gates `/shelf` on
 * `locals.user` per the app CLAUDE.md).
 *
 * Smoking gun: the Network pane shows a 302 from `/shelf` to `/login`, and
 * the DOM snapshot at failure shows the login form instead of the shelf.
 * The test never reaches any shelf-specific assertion.
 *
 * Do not "fix" this test — the failure IS the lesson. It exists so
 * `npm run traces:generate` can capture its trace for students to triage.
 */

test.use({ storageState: { cookies: [], origins: [] } });

test('user can see their shelf', async ({ page }) => {
	await page.goto('/shelf');

	const heading = page.getByRole('heading', { name: 'Your books' });
	await expect(heading).toBeVisible();
});
