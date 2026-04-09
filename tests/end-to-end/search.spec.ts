import path from 'node:path';
import { expect, test } from './fixtures';
import { resetShelfContent } from './helpers/seed';

const STATION_ELEVEN_HAR = path.resolve('tests/fixtures/open-library-station-eleven.har');

test.beforeEach(async ({ request }) => {
	await resetShelfContent(request);
});

test('search returns Open Library results from the replayed HAR', async ({ page }) => {
	await page.routeFromHAR(STATION_ELEVEN_HAR, {
		url: '**/openlibrary.org/**',
		notFound: 'abort'
	});

	await page.goto('/search?query=station+eleven');

	const stationEleven = page.getByRole('article', { name: /Station Eleven/ }).first();
	await expect(stationEleven).toBeVisible();
	await expect(stationEleven.getByText(/Emily St\. John Mandel/)).toBeVisible();
});

test('adding a search result through the UI lands it on the shelf', async ({ page, request }) => {
	await page.routeFromHAR(STATION_ELEVEN_HAR, {
		url: '**/openlibrary.org/**',
		notFound: 'abort'
	});

	await page.goto('/search?query=station+eleven');

	// First reset the shelf so the add button is visible even though the
	// reader seed already has Station Eleven shelved — delete the pre-seeded
	// entry through the API so this spec owns its state.
	const shelfResponse = await request.get('/api/shelf');
	const { entries } = (await shelfResponse.json()) as {
		entries: Array<{ id: string; book: { title: string } }>;
	};
	const seededStationEleven = entries.find((entry) => entry.book.title === 'Station Eleven');
	if (seededStationEleven) {
		await request.delete(`/api/shelf/${seededStationEleven.id}`);
	}
	await page.reload();

	const result = page.getByRole('article', { name: /Station Eleven/ }).first();
	const addShelfResponse = page.waitForResponse(
		(response) => response.url().endsWith('/api/shelf') && response.request().method() === 'POST'
	);
	await result.getByRole('button', { name: 'Add to shelf' }).click();
	const addResponse = await addShelfResponse;
	expect(addResponse.ok()).toBe(true);

	await expect(page.getByRole('status')).toHaveText(/Added Station Eleven/);
});
