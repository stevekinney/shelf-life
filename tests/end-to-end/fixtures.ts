import { test as base } from '@playwright/test';

/**
 * Shelf's shared Playwright fixture. Extends the default `page` fixture to
 * forward browser console errors and warnings plus failing network responses
 * to the Node process's stderr. The forwarded lines show up in Playwright's
 * `list` reporter output, the HTML report, and—critically—in the report JSON
 * that the failure dossier summarizer reads.
 *
 * Benign navigation aborts (`ERR_ABORTED`, `NS_BINDING_ABORTED`) are filtered
 * out so the output stays actionable.
 */
export const test = base.extend({
	page: async ({ page }, use) => {
		page.on('console', (message) => {
			const messageType = message.type();
			if (messageType === 'error' || messageType === 'warning') {
				console.error(`[browser ${messageType}] ${message.text()}`);
			}
		});

		page.on('pageerror', (error) => {
			console.error(`[browser pageerror] ${error.message}`);
		});

		page.on('requestfailed', (request) => {
			const failureText = request.failure()?.errorText ?? 'unknown error';
			if (failureText.includes('ERR_ABORTED') || failureText.includes('NS_BINDING_ABORTED')) {
				return;
			}
			console.error(`[network failed] ${request.method()} ${request.url()} - ${failureText}`);
		});

		page.on('response', (response) => {
			if (response.status() >= 400) {
				console.error(
					`[network ${response.status()}] ${response.request().method()} ${response.url()}`
				);
			}
		});

		await use(page);
	}
});

export { expect } from '@playwright/test';
