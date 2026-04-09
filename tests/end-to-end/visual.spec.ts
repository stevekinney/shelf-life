import { expect, test } from './fixtures';

test('design system matches the starter visual baseline', async ({ page }) => {
	await page.goto('/design-system');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page).toHaveScreenshot('design-system.png', {
		fullPage: true
	});
});
