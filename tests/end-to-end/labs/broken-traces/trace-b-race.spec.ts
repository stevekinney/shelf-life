import { expect, test } from '@playwright/test';
import { resetShelfContent } from '../../helpers/seed';

/**
 * Trace B: timing race.
 *
 * This spec is authenticated by default (the `labs-broken-traces` project
 * mounts the reader storage state). It drives the real rate-book flow on
 * Station Eleven, but instead of waiting for the PATCH response before
 * asserting the persisted rating, it asserts immediately after the click.
 *
 * Smoking gun: the Network pane shows `PATCH /api/shelf/:id` as still
 * pending at the moment the visibility assertion fails. The DOM snapshot
 * at the failure point does not yet include the "Rated: 4/5" text.
 *
 * Do not "fix" this test — the failure IS the lesson.
 */

test.beforeEach(async ({ request }) => {
	await resetShelfContent(request);
});

test('rating appears immediately after submit', async ({ page }) => {
	await page.goto('/shelf');

	const stationEleven = page.getByRole('article', { name: /Station Eleven/ });
	await stationEleven.getByRole('button', { name: 'Rate this book' }).click();

	const dialog = page.getByRole('dialog', { name: /Rate Station Eleven/ });
	await dialog.getByRole('radio', { name: '4 stars' }).check();
	await dialog.getByRole('button', { name: 'Save rating' }).click();

	// No `waitForResponse` — the assertion runs while the PATCH is still
	// in flight. The tight timeout is what makes the race reliably
	// reproduce for the generated trace: zero grace period means the
	// network round-trip cannot sneak in under the wire.
	await expect(stationEleven.getByText('Rated: 4/5')).toBeVisible({ timeout: 1 });
});
