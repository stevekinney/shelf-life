import type { PageServerLoad } from './$types';
import { searchStarterBooks } from '$lib/sample-books';

export const load: PageServerLoad = async ({ url, locals }) => {
	const query = url.searchParams.get('query')?.trim() ?? '';

	return {
		query,
		user: locals.user,
		results: searchStarterBooks(query)
	};
};
