import { expect, test } from '@playwright/test';

test('search', async ({ page }) => {
	await page.routeFromHAR('./recordings/openlibrary.har', {
		url: '**/openlibrary.org/**'
	});

	await page.goto('/search');
	await page.getByRole('textbox', { name: 'Search by title, author, or' }).click();
	await page.getByRole('textbox', { name: 'Search by title, author, or' }).fill('Hemingway');
	await page.getByRole('button', { name: 'Search' }).click();
});
