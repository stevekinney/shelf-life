#!/usr/bin/env node
/**
 * Generates the three lab traces used by the "Triage Three Traces" lab in
 * the self-testing-ai-agents course.
 *
 * This script owns the full trace-generation lifecycle:
 *
 *   1. Runs `drizzle-kit push --force` to match the existing test:e2e bootstrap.
 *   2. Invokes Playwright against `playwright.labs.config.ts` with the
 *      `setup` and `labs-broken-traces` projects. The lab specs are
 *      intentionally red, so a nonzero exit from Playwright is expected.
 *   3. Locates the resulting trace zips under `playwright-report/test-results`
 *      (the configured `outputDir`), maps each one to its spec file, and
 *      copies the three expected traces into `playwright-report/lab-traces/`
 *      under stable, predictable filenames.
 *   4. Fails loudly only if any of the three expected traces are missing
 *      after the Playwright run, which would mean the lab scaffolding is
 *      broken (e.g. the project was renamed, the testMatch regex drifted,
 *      or a spec was accidentally fixed).
 *
 * Run via `npm run traces:generate`. Clean via `npm run traces:clean`.
 */
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIR = resolve(ROOT, 'playwright-report/test-results');
const DEST_DIR = resolve(ROOT, 'playwright-report/lab-traces');

// Playwright truncates spec filenames and interpolates hashes into the
// output-dir name, so we match on the minimal stable prefix
// (`labs-broken-traces-trace-a`, etc.) rather than the full spec stem.
const EXPECTED_TRACES = [
	{ spec: 'trace-a-config', prefix: 'labs-broken-traces-trace-a' },
	{ spec: 'trace-b-race', prefix: 'labs-broken-traces-trace-b' },
	{ spec: 'trace-c-stale-locator', prefix: 'labs-broken-traces-trace-c' }
];

const runStep = (name, command, args) => {
	process.stderr.write(`[traces:generate] ${name}: ${command} ${args.join(' ')}\n`);
	const result = spawnSync(command, args, { stdio: 'inherit', cwd: ROOT });
	if (result.error) {
		throw result.error;
	}
	return result.status ?? 0;
};

const findTraceForSpec = async (dirPrefix) => {
	let entries;
	try {
		entries = await readdir(SOURCE_DIR);
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
			return null;
		}
		throw error;
	}

	for (const entry of entries) {
		if (!entry.startsWith(dirPrefix)) continue;
		const entryPath = join(SOURCE_DIR, entry);
		const entryStat = await stat(entryPath).catch(() => null);
		if (!entryStat || !entryStat.isDirectory()) continue;
		const inner = await readdir(entryPath);
		if (inner.includes('trace.zip')) {
			return join(entryPath, 'trace.zip');
		}
	}
	return null;
};

const main = async () => {
	const drizzleStatus = runStep('drizzle push', 'npx', ['drizzle-kit', 'push', '--force']);
	if (drizzleStatus !== 0) {
		console.error(`[traces:generate] drizzle push failed with status ${drizzleStatus}`);
		process.exit(drizzleStatus);
	}

	// Clear any previous run's output so we don't pick up stale traces.
	await rm(SOURCE_DIR, { recursive: true, force: true });

	// The lab specs are intentionally red. Playwright will exit non-zero;
	// that's expected, and the script does not treat it as fatal.
	const playwrightStatus = runStep('playwright test', 'npx', [
		'playwright',
		'test',
		'--config=playwright.labs.config.ts',
		'--project=setup',
		'--project=labs-broken-traces'
	]);
	process.stderr.write(
		`[traces:generate] playwright exited with status ${playwrightStatus} (nonzero is expected)\n`
	);

	await mkdir(DEST_DIR, { recursive: true });

	const missing = [];
	for (const { spec, prefix } of EXPECTED_TRACES) {
		const source = await findTraceForSpec(prefix);
		if (!source) {
			missing.push(spec);
			continue;
		}
		const destination = join(DEST_DIR, `${spec}.zip`);
		await copyFile(source, destination);
		process.stderr.write(`[traces:generate] copied ${spec}.zip\n`);
	}

	if (missing.length > 0) {
		console.error(
			`[traces:generate] missing traces for: ${missing.join(', ')}. Check that the ` +
				`labs-broken-traces project is running and that each spec still fails.`
		);
		process.exit(1);
	}

	process.stderr.write(`[traces:generate] wrote ${EXPECTED_TRACES.length} traces to ${DEST_DIR}\n`);
};

main().catch((error) => {
	console.error('[traces:generate] fatal:', error);
	process.exit(1);
});
