import { expect, test } from '@playwright/test';

test('home page renders the Shelf starter shell', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { name: /Shelf is the foundation/i })).toBeVisible();
	await expect(page.getByRole('main').getByRole('link', { name: 'Sign in' })).toBeVisible();
	await expect(
		page.getByRole('main').getByRole('link', { name: 'View the design system' })
	).toBeVisible();
});

test('protected routes redirect unauthenticated readers to login', async ({ page }) => {
	await page.goto('/search');
	await expect(page).toHaveURL(/\/login\?returnTo=%2Fsearch$/);

	await page.goto('/shelf');
	await expect(page).toHaveURL(/\/login\?returnTo=%2Fshelf$/);
});

test('login page renders starter authentication controls', async ({ page }) => {
	await page.goto('/login');

	await expect(page.getByLabel('Email')).toBeVisible();
	await expect(page.getByLabel('Password')).toBeVisible();
	await expect(page.getByLabel('Display name')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
});

test('creating an account returns the reader to the protected page they asked for', async ({
	page
}, testInfo) => {
	const uniqueIdentifier = `${Date.now()}-${testInfo.parallelIndex}`;

	await page.goto('/search?query=piranesi');
	await expect(page).toHaveURL(/\/login\?returnTo=%2Fsearch%3Fquery%3Dpiranesi$/);

	await page.getByLabel('Email').fill(`reader-${uniqueIdentifier}@example.com`);
	await page.getByLabel('Password').fill('ShelfStarter123!');
	await page.getByLabel('Display name').fill('Course Reader');
	await page.getByRole('button', { name: 'Create account' }).click();

	await expect(page).toHaveURL(/\/search\?query=piranesi$/);
	await expect(page.getByRole('heading', { name: 'Starter results' })).toBeVisible();
});
