import { expect, test } from '@playwright/test';
import { resetShelfContent } from '../../helpers/seed';

/**
 * Trace C: order-dependent rendering / locator ambiguity.
 *
 * This spec is authenticated by default. The seed endpoint shelves two
 * books (Station Eleven and Piranesi), so the shelf renders two articles
 * and each article has its own "Rate this book" button. The test calls
 * `getByRole('button', { name: 'Rate this book' })` without scoping to a
 * specific article, which resolves to multiple elements and throws a
 * Playwright strict-mode violation.
 *
 * Smoking gun: the Playwright error/console pane shows "strict mode
 * violation: getByRole('button', { name: 'Rate this book' }) resolved to
 * 2 elements", and the DOM snapshot shows both matching buttons.
 *
 * The fix — taught by the existing Locators lesson — is to scope the
 * locator to the target article first:
 *   `page.getByRole('article', { name: /Station Eleven/ })
 *       .getByRole('button', { name: 'Rate this book' })`
 *
 * Do not "fix" this test — the failure IS the lesson.
 */

test.beforeEach(async ({ request }) => {
	await resetShelfContent(request);
});

test('user can click the rate-this-book button on the shelf', async ({ page }) => {
	await page.goto('/shelf');

	// Intentional: no region scoping. Matches multiple "Rate this book"
	// buttons, one per shelved book.
	await page.getByRole('button', { name: 'Rate this book' }).click();

	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
});
