import { redirect } from '@sveltejs/kit';
import { getReadingGoalProgress } from '$lib/server/reading-goals';
import type { PageServerLoad } from './$types';

const currentYear = () => new Date().getUTCFullYear();

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login?returnTo=%2Fgoals');
	const year = currentYear();
	const progress = await getReadingGoalProgress(locals.user.id, year);
	return {
		user: locals.user,
		progress
	};
};
