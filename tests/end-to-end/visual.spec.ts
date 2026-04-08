import { expect, test } from '@playwright/test';

test('design system matches the starter visual baseline', async ({ page }) => {
	await page.goto('/design-system');
	await expect(page).toHaveScreenshot('design-system.png', {
		fullPage: true
	});
});
