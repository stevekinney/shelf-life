import { defineConfig, devices } from '@playwright/test';

/**
 * Dedicated Playwright config for the post-deploy smoke test. It runs
 * against the URL in `SMOKE_BASE_URL` (default: local preview on 4173) and
 * does not spin up its own web server — the deployment workflow is expected
 * to point it at an already-running target.
 */
export default defineConfig({
	testDir: 'tests/smoke',
	testMatch: /post-deploy\.spec\.ts/,
	fullyParallel: true,
	workers: 1,
	reporter: [['html', { open: 'never', outputFolder: 'playwright-report/smoke-html' }], ['list']],
	use: {
		baseURL: process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4173',
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
