import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';
import { resetShelfContent } from './helpers/seed';

test.beforeEach(async ({ request }) => {
	await resetShelfContent(request);
});

test('shelf page has no automated accessibility violations', async ({ page }) => {
	await page.goto('/shelf');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

	const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

	expect(results.violations).toEqual([]);
});

test('search page has no automated accessibility violations', async ({ page }) => {
	await page.goto('/search');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

	const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

	expect(results.violations).toEqual([]);
});
