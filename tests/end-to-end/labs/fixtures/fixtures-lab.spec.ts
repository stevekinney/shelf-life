import { test, expect } from './bad-fixtures';

/**
 * Green-by-default spec for the fixtures refactor lab.
 *
 * This file exercises every fixture in `bad-fixtures.ts` and passes as
 * committed. As you refactor `bad-fixtures.ts` (renaming, adding teardowns,
 * demoting helpers), update *this* spec to match. The refactor is not done
 * until this spec still passes against your changes.
 *
 * Do not change what each test is checking — only how it asks for the
 * setup. That discipline is what keeps the exercise about fixture design
 * rather than test rewriting.
 */

test.describe('fixtures lab — starting state', () => {
	test('seeded reader identity is available to tests', async ({ setupUser }) => {
		expect(setupUser.email).toBe('alice@example.com');
	});

	test('empty-shelf fixture leaves the server in a baseline state', async ({ setupEmptyShelf }) => {
		const response = await setupEmptyShelf.get('/api/shelf');
		expect(response.ok()).toBeTruthy();
		const body = (await response.json()) as { entries: unknown[] };
		expect(Array.isArray(body.entries)).toBe(true);
	});

	test('shelf-with-books fixture returns seeded shelf entries', async ({ setupShelfWithBooks }) => {
		const response = await setupShelfWithBooks.get('/api/shelf');
		expect(response.ok()).toBeTruthy();
		const body = (await response.json()) as { entries: Array<{ book: { title: string } }> };
		const titles = body.entries.map((entry) => entry.book.title);
		expect(titles).toEqual(expect.arrayContaining(['Station Eleven', 'Piranesi']));
	});

	test('authed page lands on the shelf', async ({ authedPage }) => {
		await expect(authedPage).toHaveURL(/\/shelf/);
	});

	test('logged-out page is redirected to login when it asks for /shelf', async ({
		loggedOutPage
	}) => {
		await loggedOutPage.goto('/shelf');
		await expect(loggedOutPage).toHaveURL(/\/login/);
	});
});
