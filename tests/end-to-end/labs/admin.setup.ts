import path from 'node:path';
import { expect, test as setup } from '@playwright/test';
import { resetShelfContent } from '../helpers/seed';

/**
 * Admin storage-state setup for the course labs.
 *
 * The default `/api/testing/seed` run already provisions an admin account
 * (`admin@example.com` / `ShelfStarter123!`) alongside the reader, so this
 * file only needs to log that existing user in and persist the session.
 *
 * The resulting `playwright/.authentication/admin.json` is what the
 * "APIRequestContext Beyond Storage State" lesson references when it shows
 * the multi-actor example. Do not remove that file path without updating
 * the lesson.
 */

const SEEDED_ADMIN = {
	email: 'admin@example.com',
	password: 'ShelfStarter123!',
	name: 'Admin Reader'
} as const;

const adminStorageStatePath = path.resolve('playwright/.authentication/admin.json');

setup('authenticate the seeded admin', async ({ page, request }) => {
	// `resetShelfContent` sends `resetUsers: false`, so it provisions the
	// admin account on first run without invalidating any reader session.
	await resetShelfContent(request);

	await page.goto('/login');
	await page.getByLabel('Email').fill(SEEDED_ADMIN.email);
	await page.getByLabel('Password').fill(SEEDED_ADMIN.password);
	await page.getByLabel('Display name').fill(SEEDED_ADMIN.name);
	await page.getByRole('button', { name: 'Sign in' }).click();

	await expect(page).toHaveURL(/\/shelf/);

	await page.context().storageState({ path: adminStorageStatePath });
});
