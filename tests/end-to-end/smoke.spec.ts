import { expect, test } from './fixtures';

test('home page reads like a real public-facing reading app', async ({ page }) => {
	await page.goto('/');

	await expect(
		page.getByRole('heading', { name: /Build a shelf that remembers what you actually read/i })
	).toBeVisible();
	await expect(page.getByRole('main').getByRole('link', { name: 'Sign in' })).toBeVisible();
	await expect(page.getByRole('main').getByRole('link', { name: 'Browse books' })).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Primary' })).toContainText('Search');
	await expect(
		page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Design system' })
	).toHaveCount(0);
	await expect(
		page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Playground' })
	).toHaveCount(0);
});

test('sign-in actions use the primary button treatment with accessible contrast', async ({
	page
}) => {
	await page.goto('/');

	const signInButtons = [
		page.getByRole('banner').getByRole('link', { name: 'Sign in' }),
		page.getByRole('main').getByRole('link', { name: 'Sign in' })
	];

	for (const signInButton of signInButtons) {
		await expect(signInButton).toBeVisible();

		const buttonStyles = await signInButton.evaluate((element) => {
			const computedStyles = window.getComputedStyle(element);
			const parseRgb = (value: string): [number, number, number] => {
				const channels = value
					.match(/\d+(\.\d+)?/g)
					?.slice(0, 3)
					.map(Number);
				const [red, green, blue] = channels ?? [];

				if (red === undefined || green === undefined || blue === undefined) {
					throw new Error(`Could not parse color value: ${value}`);
				}

				return [red, green, blue];
			};

			const toRelativeLuminance = ([red, green, blue]: [number, number, number]) => {
				const normalizeChannel = (channel: number) => {
					const normalized = channel / 255;
					return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
				};

				const [normalizedRed, normalizedGreen, normalizedBlue] = [
					normalizeChannel(red),
					normalizeChannel(green),
					normalizeChannel(blue)
				];

				return normalizedRed * 0.2126 + normalizedGreen * 0.7152 + normalizedBlue * 0.0722;
			};

			const foregroundColor = parseRgb(computedStyles.color);
			const backgroundColor = parseRgb(computedStyles.backgroundColor);
			const foregroundLuminance = toRelativeLuminance(foregroundColor);
			const backgroundLuminance = toRelativeLuminance(backgroundColor);
			const lighterLuminance = Math.max(foregroundLuminance, backgroundLuminance);
			const darkerLuminance = Math.min(foregroundLuminance, backgroundLuminance);

			return {
				backgroundColor: computedStyles.backgroundColor,
				color: computedStyles.color,
				contrastRatio: (lighterLuminance + 0.05) / (darkerLuminance + 0.05)
			};
		});

		expect(buttonStyles.color).toBe('rgb(255, 255, 255)');
		expect(buttonStyles.backgroundColor).toBe('rgb(106, 75, 31)');
		expect(buttonStyles.contrastRatio).toBeGreaterThanOrEqual(4.5);
	}
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

test('playground page renders all locator-practice sections', async ({ page }) => {
	await page.goto('/playground');

	await expect(page.getByRole('heading', { level: 1, name: /Locator playground/ })).toBeVisible();

	// Verify key section headings exist
	const sectionTitles = [
		'Buttons',
		'Form fields',
		'Text content',
		'Lists and tables',
		'Navigation',
		'Status indicators',
		'Dialogs',
		'Dynamic content',
		'ARIA attributes',
		'Test ID fallbacks',
		'Anti-patterns'
	];

	for (const title of sectionTitles) {
		await expect(page.getByRole('heading', { name: title })).toBeVisible();
	}

	// Verify element counts the lab depends on
	await expect(page.getByRole('list', { name: 'Reading list' }).getByRole('listitem')).toHaveCount(
		4
	);
	await expect(page.getByRole('table', { name: 'Book ratings' }).getByRole('row')).toHaveCount(4); // 1 header + 3 data rows
	await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(2);
	await expect(page.getByRole('link', { name: 'View details' })).toHaveCount(2);
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
	await expect(page.getByRole('heading', { level: 1, name: /Search the library/ })).toBeVisible();
});
