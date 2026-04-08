import type { PageServerLoad } from './$types';
import { featuredBooks } from '$lib/sample-books';
import { calculateShelfSummary } from '$lib/shelf';

export const load: PageServerLoad = async ({ locals }) => {
	// TODO: Replace the empty starter array with real shelf entries once persistence lands.
	const summary = calculateShelfSummary([]);

	return {
		user: locals.user,
		summary,
		featuredBooks
	};
};
