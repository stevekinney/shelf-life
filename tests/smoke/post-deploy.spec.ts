import { expect, test } from '@playwright/test';

/**
 * Post-deploy smoke test. Reads the target URL from `SMOKE_BASE_URL` so the
 * same test can run against a local `npm run preview`, a hosted staging
 * environment, or a production preview. Kept intentionally small: prove the
 * home page loads and the primary "sign in" affordance is present. Any
 * deeper smoke coverage rides on the full end-to-end suite, not this check.
 */
const smokeBaseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4173';

test.use({ baseURL: smokeBaseUrl });

test('home page renders and exposes sign in', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.getByRole('main').getByRole('link', { name: 'Sign in' })).toBeVisible();
});
