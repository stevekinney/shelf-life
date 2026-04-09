import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { resetShelfContent } from './helpers/seed';

type PerformanceBudgets = {
	runtime: {
		shelfRouteDomContentLoadedMilliseconds: number;
	};
};

const loadBudgets = async (): Promise<PerformanceBudgets> => {
	const raw = await readFile(path.resolve('performance-budgets.json'), 'utf8');
	return JSON.parse(raw) as PerformanceBudgets;
};

test.beforeEach(async ({ request }) => {
	await resetShelfContent(request);
});

test('shelf route stays within the domContentLoaded budget', async ({ page }) => {
	const budgets = await loadBudgets();
	const budgetMilliseconds = budgets.runtime.shelfRouteDomContentLoadedMilliseconds;

	await page.goto('/shelf');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

	const navigationTiming = await page.evaluate(() => {
		const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
		if (!entry) return { domContentLoaded: 0 };
		return {
			domContentLoaded: entry.domContentLoadedEventEnd - entry.startTime
		};
	});

	expect(navigationTiming.domContentLoaded).toBeLessThan(budgetMilliseconds);
});
