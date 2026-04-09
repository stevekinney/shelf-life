#!/usr/bin/env node
/**
 * Compares the current bundle stats against `performance-budgets.json`.
 *
 * Run through `npm run performance:build`, which first emits
 * `build/stats.json` via `vite build` under `BUNDLE_STATS=1`. Exits non-zero
 * and prints a human-readable diff when a threshold is exceeded.
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const STATS_PATH = resolve('build/stats.json');
const BUDGETS_PATH = resolve('performance-budgets.json');
const CLIENT_BUNDLE_PREFIX = '_app/immutable';

const formatKilobytes = (bytes) => (bytes / 1024).toFixed(1);

const computeClientBundleSizes = (stats) => {
	const parts = stats.nodeParts ?? {};
	const metas = stats.nodeMetas ?? {};
	const bundleGzipByFile = new Map();

	for (const meta of Object.values(metas)) {
		for (const [bundleFile, uid] of Object.entries(meta.moduleParts ?? {})) {
			const part = parts[uid];
			if (!part) continue;
			const previous = bundleGzipByFile.get(bundleFile) ?? 0;
			bundleGzipByFile.set(bundleFile, previous + (part.gzipLength ?? 0));
		}
	}

	const clientEntries = Array.from(bundleGzipByFile.entries()).filter(([bundleFile]) =>
		bundleFile.startsWith(CLIENT_BUNDLE_PREFIX)
	);
	const totalClientGzipBytes = clientEntries.reduce((sum, [, bytes]) => sum + bytes, 0);
	const largestClientChunkBytes = clientEntries.reduce((max, [, bytes]) => Math.max(max, bytes), 0);

	return {
		totalClientGzipBytes,
		largestClientChunkBytes,
		clientEntries
	};
};

const main = async () => {
	const [statsRaw, budgetsRaw] = await Promise.all([
		readFile(STATS_PATH, 'utf8'),
		readFile(BUDGETS_PATH, 'utf8')
	]);
	const stats = JSON.parse(statsRaw);
	const budgets = JSON.parse(budgetsRaw);

	const { totalClientGzipBytes, largestClientChunkBytes } = computeClientBundleSizes(stats);

	const totalGzipKilobytes = totalClientGzipBytes / 1024;
	const largestGzipKilobytes = largestClientChunkBytes / 1024;

	const totalBudget = budgets.build?.maxTotalGzipKilobytes;
	const largestBudget = budgets.build?.maxLargestChunkGzipKilobytes;

	const failures = [];
	if (typeof totalBudget === 'number' && totalGzipKilobytes > totalBudget) {
		failures.push(
			`Total client bundle size ${formatKilobytes(totalClientGzipBytes)} kB gzip exceeds budget of ${totalBudget} kB`
		);
	}
	if (typeof largestBudget === 'number' && largestGzipKilobytes > largestBudget) {
		failures.push(
			`Largest client chunk ${formatKilobytes(largestClientChunkBytes)} kB gzip exceeds budget of ${largestBudget} kB`
		);
	}

	if (failures.length > 0) {
		console.error('Performance budget check FAILED:');
		for (const failure of failures) console.error('  - ' + failure);
		process.exit(1);
	}

	console.log(
		`Performance budget check OK: total ${formatKilobytes(totalClientGzipBytes)} kB / ${totalBudget} kB, ` +
			`largest chunk ${formatKilobytes(largestClientChunkBytes)} kB / ${largestBudget} kB`
	);
};

main().catch((error) => {
	console.error('Performance budget check errored:', error);
	process.exit(2);
});
