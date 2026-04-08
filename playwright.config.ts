import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: 'tests/end-to-end',
	fullyParallel: true,
	webServer: {
		command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	use: {
		baseURL: 'http://127.0.0.1:4173'
	},
	expect: {
		toHaveScreenshot: {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css'
		}
	},
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome']
			}
		}
	]
});
