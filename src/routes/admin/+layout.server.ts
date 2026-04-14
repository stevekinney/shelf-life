import { redirect } from '@sveltejs/kit';
import { createLoginPath } from '$lib/authentication-navigation';
import { requireAdministrator } from '$lib/server/authorization';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(303, createLoginPath(`${url.pathname}${url.search}`));
	}

	return {
		user: requireAdministrator(locals.user)
	};
};
