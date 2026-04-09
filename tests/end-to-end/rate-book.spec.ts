import { expect, test } from './fixtures';
import { resetShelfContent } from './helpers/seed';

test.describe('rate a book on your shelf', () => {
	test.beforeEach(async ({ request }) => {
		await resetShelfContent(request);
	});

	test('user can rate Station Eleven', async ({ page, request }) => {
		await page.goto('/shelf');

		const stationEleven = page.getByRole('article', { name: /Station Eleven/ });
		await expect(stationEleven).toBeVisible();

		await stationEleven.getByRole('button', { name: 'Rate this book' }).click();

		const dialog = page.getByRole('dialog', { name: /Rate Station Eleven/ });
		await expect(dialog).toBeVisible();

		await dialog.getByRole('radio', { name: '4 stars' }).check();

		const ratingResponse = page.waitForResponse(
			(response) =>
				/\/api\/shelf\/.+/.test(response.url()) && response.request().method() === 'PATCH'
		);
		await dialog.getByRole('button', { name: 'Save rating' }).click();
		const savedResponse = await ratingResponse;
		expect(savedResponse.ok()).toBe(true);

		await expect(page.getByRole('status')).toHaveText(/Thanks/);
		await expect(stationEleven.getByText('Rated: 4/5')).toBeVisible();

		// Hybrid API assertion: the rating actually persisted.
		const shelfResponse = await request.get('/api/shelf');
		expect(shelfResponse.ok()).toBe(true);
		const body = (await shelfResponse.json()) as {
			entries: Array<{ book: { title: string }; rating: number | null }>;
		};
		const stationElevenEntry = body.entries.find((entry) => entry.book.title === 'Station Eleven');
		expect(stationElevenEntry?.rating).toBe(4);
	});
});
