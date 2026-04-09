import { expect, test } from './fixtures';
import { resetShelfContent } from './helpers/seed';

test.beforeEach(async ({ request }) => {
	await resetShelfContent(request);
});

test('shelf page matches the seeded visual baseline', async ({ page }) => {
	await page.goto('/shelf');

	// Wait for the shelf page to render its primary heading and content so the
	// screenshot has something stable to capture before we diff.
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.getByRole('article', { name: /Station Eleven/ })).toBeVisible();

	await expect(page).toHaveScreenshot('shelf-page.png', {
		fullPage: true
	});
});
