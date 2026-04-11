import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the self-testing-ai-agents course labs.
 *
 * This file is deliberately separate from the root `playwright.config.ts`:
 * the lab projects include intentionally-red specs (broken-traces) and
 * starting-state code that isn't the production suite. Keeping them in a
 * dedicated config means `npm run test:e2e`, IDE Playwright integrations,
 * and the root-config `npx playwright test` never discover them.
 *
 * The `testDir` intentionally matches the root config (`tests/end-to-end`)
 * rather than narrowing to `tests/end-to-end/labs`. Playwright project
 * dependencies are resolved within a single config, and the lab projects
 * need a `setup` project that runs the existing `authentication.setup.ts`
 * (outside the labs subtree). Per-project `testMatch` regexes scope each
 * project correctly.
 */

const readerStorageState = path.resolve('playwright/.authentication/user.json');

export default defineConfig({
	testDir: 'tests/end-to-end',
	fullyParallel: true,
	workers: 1,
	outputDir: 'playwright-report/test-results',
	webServer: {
		command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		env: {
			...process.env,
			ENABLE_TEST_SEED: 'true'
		}
	},
	use: {
		baseURL: 'http://127.0.0.1:4173',
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure'
	},
	reporter: [['html', { open: 'never', outputFolder: 'playwright-report/html-labs' }], ['list']],
	expect: {
		toHaveScreenshot: {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
			maxDiffPixelRatio: 0.01
		}
	},
	projects: [
		{
			name: 'setup',
			testMatch: /authentication\.setup\.ts/
		},
		{
			name: 'admin-setup',
			testMatch: /labs\/admin\.setup\.ts/,
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'labs-fixtures',
			testMatch: /labs\/fixtures\/.*\.spec\.ts/,
			use: {
				...devices['Desktop Chrome'],
				storageState: readerStorageState
			},
			dependencies: ['setup']
		},
		{
			name: 'labs-broken-traces',
			testMatch: /labs\/broken-traces\/.*\.spec\.ts/,
			use: {
				...devices['Desktop Chrome'],
				storageState: readerStorageState,
				trace: 'on'
			},
			dependencies: ['setup']
		}
	]
});
