import { redirect } from '@sveltejs/kit';
import { createLoginPath } from '$lib/authentication-navigation';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		const returnToPath = `${url.pathname}${url.search}`;

		throw redirect(303, createLoginPath(returnToPath));
	}

	return {};
};
