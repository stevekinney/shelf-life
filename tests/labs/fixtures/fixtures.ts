import { test as base, expect } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';
import { resetShelfContent } from '../../helpers/seed';

/**
 * STARTING-POINT fixture file for the "Fixtures: Worker-Scoped, Test-Scoped,
 * and the Trap Between Them" lab.
 *
 * This file is deliberately smell-heavy. Every smell the lesson calls out
 * lives here. Your job in the lab is to refactor this file without breaking
 * `fixtures-lab.spec.ts` — it already passes green, and it must still pass
 * after your refactor.
 *
 * Smells you can find:
 *   1. Names that describe setup steps instead of what each fixture provides.
 *   2. Fixtures that mutate state without a teardown half.
 *   3. Fixtures that would only ever be used in a single test — helpers in
 *      disguise.
 *   4. No justification comments for scope choices (though nothing here is
 *      worker-scoped yet, either).
 *   5. A fixture that duplicates what `resetShelfContent` already does.
 *
 * The solution lives on the course site in the fixtures-refactor solution
 * writeup. This repository intentionally keeps only the exercise file.
 */

type LabFixtures = {
	setupUser: { email: string };
	setupEmptyShelf: APIRequestContext;
	setupShelfWithBooks: APIRequestContext;
	authedPage: Page;
	loggedOutPage: Page;
};

export const test = base.extend<LabFixtures>({
	// Smell: name is a setup verb, not what it provides. Smell: no scope
	// comment. Smell: this is a one-liner that doesn't need to be a fixture
	// at all — it's just a constant.
	// eslint-disable-next-line no-empty-pattern
	setupUser: async ({}, use) => {
		await use({ email: 'alice@example.com' });
	},

	// Smell: this mutates server state but has no teardown half.
	setupEmptyShelf: async ({ request }, use) => {
		await resetShelfContent();
		// What happens between tests? Nothing. The next test inherits
		// whatever mess this one left behind.
		await use(request);
	},

	// Smell: same as above, and it duplicates `resetShelfContent` — the seed
	// helper already shelves two books by default. This fixture is a
	// helper wearing a fixture costume.
	setupShelfWithBooks: async ({ request }, use) => {
		await resetShelfContent();
		await use(request);
	},

	// Smell: this "fixture" just returns the default `page` with a login
	// navigation. No teardown. No justification for why it's a fixture
	// instead of a `beforeEach`.
	authedPage: async ({ page }, use) => {
		// By the time this lab runs, you should already have some authenticated
		// default Playwright setup for protected Shelf pages. This fixture
		// pretends to do that work anyway, which is the exact confusion the
		// lesson is trying to prevent.
		await page.goto('/shelf');
		await expect(page).toHaveURL(/\/shelf/);
		await use(page);
	},

	// Smell: only used in one place, would be clearer as a helper function.
	loggedOutPage: async ({ browser }, use) => {
		const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
		const fresh = await context.newPage();
		await use(fresh);
		// Teardown exists, which is good — but the fixture itself is
		// helper-shaped: one test uses it, it's awkward to compose, and it
		// fights the authenticated default browser state you already set up
		// for the lab run.
		await context.close();
	}
});

export { expect } from '@playwright/test';
