import { error, json } from '@sveltejs/kit';
import { getReadingGoalProgress, upsertReadingGoal } from '$lib/server/reading-goals';
import type { RequestHandler } from './$types';

type PutGoalBody = {
	targetBooks?: number;
};

const currentYear = () => new Date().getUTCFullYear();

export const PUT: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) {
		error(401, 'Sign in to set a reading goal.');
	}

	let body: PutGoalBody;
	try {
		body = (await request.json()) as PutGoalBody;
	} catch {
		error(400, 'Invalid JSON');
	}

	const targetBooks = body.targetBooks;
	if (
		typeof targetBooks !== 'number' ||
		!Number.isInteger(targetBooks) ||
		targetBooks < 1 ||
		targetBooks > 999
	) {
		error(400, 'Enter a whole number between 1 and 999.');
	}

	const year = currentYear();
	await upsertReadingGoal(locals.user.id, year, targetBooks);
	const progress = await getReadingGoalProgress(locals.user.id, year);

	return json({ ok: true, progress, savedAt: new Date().toISOString() });
};
