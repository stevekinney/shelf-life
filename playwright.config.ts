import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const storageStatePath = path.resolve('playwright/.authentication/user.json');

export default defineConfig({
	testDir: 'tests/end-to-end',
	fullyParallel: true,
	// The starter uses one shared SQLite database for every worker, so we pin
	// workers to 1 to keep tests deterministic. When per-worker isolation is
	// introduced in a later phase, raise this alongside the database plumbing.
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
	reporter: [
		['html', { open: 'never', outputFolder: 'playwright-report/html' }],
		['json', { outputFile: 'playwright-report/report.json' }],
		['list']
	],
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
			name: 'public',
			testMatch: /(smoke|visual)\.spec\.ts/,
			use: {
				...devices['Desktop Chrome']
			}
		},
		{
			name: 'authenticated',
			testMatch: /(rate-book|accessibility|search|visual-authenticated|performance)\.spec\.ts/,
			use: {
				...devices['Desktop Chrome'],
				storageState: storageStatePath
			},
			dependencies: ['setup']
		},
		// Cross-browser smoke projects. They run only the `smoke.spec.ts` file
		// against Firefox and WebKit. Skip them by default — invoke via
		// `npm run test:e2e:cross-browser` when you specifically want the
		// expanded matrix.
		{
			name: 'firefox-smoke',
			testMatch: /smoke\.spec\.ts/,
			use: { ...devices['Desktop Firefox'] }
		},
		{
			name: 'webkit-smoke',
			testMatch: /smoke\.spec\.ts/,
			use: { ...devices['Desktop Safari'] }
		}
	]
});
