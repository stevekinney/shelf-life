import { test as base } from '@playwright/test';
import type { APIRequestContext, Browser } from '@playwright/test';
import { resetShelfContent } from '../../helpers/seed';

/**
 * SOLUTION-STATE fixture file for the "Fixtures: Worker-Scoped, Test-Scoped,
 * and the Trap Between Them" lab.
 *
 * This is one reasonable refactor of `bad-fixtures.ts`. Yours may look
 * different — the lab grades on the quality of your decisions, not a
 * byte-for-byte match. What matters is:
 *
 *   - Fixtures are named for what they *provide*, not what they *do*.
 *   - Every fixture that mutates state has a teardown half that is awaited.
 *   - Scope choices are justified in a one-line comment.
 *   - Helpers that got elevated to fixtures for no reason are back to being
 *     plain functions.
 *
 * See the lab's solution writeup for the commit-by-commit narrative.
 */

type SeededReader = {
	email: string;
	name: string;
};

type GoodFixtures = {
	seededReader: SeededReader;
	seededShelf: APIRequestContext;
};

export const test = base.extend<GoodFixtures>({
	// Test-scoped: the reader identity is a small, read-only value used
	// across multiple labs. It's a constant right now; the fixture shape
	// lets us swap in a different seeded user later without touching
	// specs.
	// eslint-disable-next-line no-empty-pattern
	seededReader: async ({}, use) => {
		await use({ email: 'alice@example.com', name: 'Alice Reader' });
	},

	// Test-scoped: each test gets a freshly-seeded shelf. The teardown
	// resets content on the way out, so any mutation this test made
	// cannot leak into the next one via worker state.
	seededShelf: async ({ request }, use) => {
		await resetShelfContent(request);
		await use(request);
		await resetShelfContent(request);
	}
});

/**
 * Opens a fresh unauthenticated context. Only one lab spec needs this, so
 * it lives as a plain helper rather than a fixture. Callers are responsible
 * for closing the returned context — the helper intentionally does not hide
 * that, because a fixture would own teardown.
 */
export const openLoggedOutPage = async (browser: Browser) => {
	const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
	const page = await context.newPage();
	return { page, context };
};

export { expect } from '@playwright/test';
