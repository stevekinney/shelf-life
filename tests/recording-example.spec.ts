import { expect, test } from '@playwright/test';

test('search', async ({ page }) => {
	await page.route('**/openlibrary.org/search.json*', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				docs: [
					{
						key: '/works/OL1W',
						cover_edition_key: 'OL1M',
						title: 'The Sun Never Rises',
						author_name: ['Ernest Hemingway'],
						first_publish_year: 1926,
						first_sentence: ['A novel about expatriates in Paris and Spain.']
					}
				]
			})
		});
	});

	await page.goto('/search');
	await page.getByRole('textbox', { name: 'Search by title, author, or' }).click();
	await page.getByRole('textbox', { name: 'Search by title, author, or' }).fill('Hemingway');
	await page.getByRole('button', { name: 'Search' }).click();
	const firstResult = page.getByRole('heading', { name: 'The Sun Never Rises' });

	await expect(firstResult).toBeVisible();
});
