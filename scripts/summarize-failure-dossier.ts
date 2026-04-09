#!/usr/bin/env node
/**
 * Reads `playwright-report/report.json` after a Playwright run and writes a
 * structured markdown summary of every failed test to `playwright-report/dossier.md`.
 *
 * The dossier entry for each failure includes the test title, file and line,
 * the full error message, a relative path to the retained screenshot, and an
 * exact reproduction command the agent can run to rerun just that test.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const REPORT_PATH = path.resolve('playwright-report/report.json');
const DOSSIER_PATH = path.resolve('playwright-report/dossier.md');

type PlaywrightAttachment = {
	name?: string;
	contentType?: string;
	path?: string;
};

type PlaywrightError = {
	message?: string;
	stack?: string;
};

type PlaywrightResult = {
	status?: string;
	error?: PlaywrightError;
	errors?: PlaywrightError[];
	attachments?: PlaywrightAttachment[];
};

type PlaywrightTest = {
	projectName?: string;
	results?: PlaywrightResult[];
};

type PlaywrightSpec = {
	title?: string;
	file?: string;
	line?: number;
	tests?: PlaywrightTest[];
};

type PlaywrightSuite = {
	specs?: PlaywrightSpec[];
	suites?: PlaywrightSuite[];
};

type PlaywrightReport = {
	suites?: PlaywrightSuite[];
};

type FailureSummary = {
	title: string;
	file: string;
	line: number | null;
	projectName: string;
	errorMessage: string;
	screenshotPath: string | null;
	tracePath: string | null;
	videoPath: string | null;
};

const collectSpecs = (suites: PlaywrightSuite[]): PlaywrightSpec[] => {
	return suites.flatMap((suite) => [...(suite.specs ?? []), ...collectSpecs(suite.suites ?? [])]);
};

const pickAttachment = (
	attachments: PlaywrightAttachment[] | undefined,
	predicate: (attachment: PlaywrightAttachment) => boolean
): string | null => {
	const match = (attachments ?? []).find(predicate);
	return match?.path ?? null;
};

/**
 * Prefers a `diff` or `actual` screenshot over the baseline `expected` when
 * Playwright retained all three after a visual regression failure. Falls back
 * to the first image attachment for generic failures that only produced a
 * single screenshot.
 */
const pickFailureScreenshot = (attachments: PlaywrightAttachment[] | undefined): string | null => {
	const isImage = (attachment: PlaywrightAttachment): boolean =>
		attachment.contentType?.startsWith('image/') === true;
	const byNamePreference = (name: string) =>
		(attachments ?? []).find(
			(attachment) => isImage(attachment) && attachment.name?.includes(name) === true
		);
	return (
		byNamePreference('diff')?.path ??
		byNamePreference('actual')?.path ??
		pickAttachment(attachments, isImage) ??
		null
	);
};

const relativeFromRepo = (absolutePath: string | null): string | null => {
	if (!absolutePath) return null;
	const relative = path.relative(process.cwd(), absolutePath);
	return relative.startsWith('..') ? absolutePath : relative;
};

const buildFailureList = (report: PlaywrightReport): FailureSummary[] => {
	const specs = collectSpecs(report.suites ?? []);
	const failures: FailureSummary[] = [];

	for (const spec of specs) {
		for (const test of spec.tests ?? []) {
			for (const result of test.results ?? []) {
				if (result.status !== 'failed' && result.status !== 'timedOut') continue;
				const primaryError =
					result.error?.message ?? result.errors?.[0]?.message ?? 'Unknown error';
				failures.push({
					title: spec.title ?? '(untitled test)',
					file: spec.file ?? '(unknown file)',
					line: typeof spec.line === 'number' ? spec.line : null,
					projectName: test.projectName ?? '(unknown project)',
					errorMessage: primaryError,
					screenshotPath: relativeFromRepo(pickFailureScreenshot(result.attachments)),
					tracePath: relativeFromRepo(
						pickAttachment(
							result.attachments,
							(a) => a.name === 'trace' || a.path?.endsWith('.zip') === true
						)
					),
					videoPath: relativeFromRepo(
						pickAttachment(result.attachments, (a) => a.contentType?.startsWith('video/') === true)
					)
				});
			}
		}
	}

	return failures;
};

const renderDossier = (failures: FailureSummary[]): string => {
	if (failures.length === 0) {
		return '# Playwright failure dossier\n\nNo failing tests.\n';
	}

	const sections = failures.map((failure) => {
		const location = failure.line !== null ? `${failure.file}:${failure.line}` : failure.file;
		const screenshotLine = failure.screenshotPath
			? `**Screenshot**: [${path.basename(failure.screenshotPath)}](./${failure.screenshotPath})\n\n`
			: '';
		const traceLine = failure.tracePath
			? `**Trace**: \`npx playwright show-trace ${failure.tracePath}\`\n\n`
			: '';
		const videoLine = failure.videoPath
			? `**Video**: [${path.basename(failure.videoPath)}](./${failure.videoPath})\n\n`
			: '';
		const reproduceCommand = `npx playwright test --project=${failure.projectName} ${failure.file} -g ${JSON.stringify(failure.title)}`;

		return `## ${failure.title}

**Project**: \`${failure.projectName}\`

**File**: \`${location}\`

**Error**:

\`\`\`
${failure.errorMessage}
\`\`\`

${screenshotLine}${traceLine}${videoLine}**Reproduce**:

\`\`\`sh
${reproduceCommand}
\`\`\`
`;
	});

	return `# Playwright failure dossier\n\n${sections.join('\n---\n\n')}`;
};

const main = () => {
	if (!existsSync(REPORT_PATH)) {
		console.error(`No Playwright report found at ${REPORT_PATH}. Run the e2e suite first.`);
		process.exit(1);
	}

	const report = JSON.parse(readFileSync(REPORT_PATH, 'utf8')) as PlaywrightReport;
	const failures = buildFailureList(report);

	const outputDirectory = path.dirname(DOSSIER_PATH);
	if (!existsSync(outputDirectory)) {
		mkdirSync(outputDirectory, { recursive: true });
	}

	writeFileSync(DOSSIER_PATH, renderDossier(failures));
	const status = failures.length === 0 ? 'no failures' : `${failures.length} failure(s)`;
	console.error(`Wrote dossier for ${status} to ${path.relative(process.cwd(), DOSSIER_PATH)}`);
};

main();
