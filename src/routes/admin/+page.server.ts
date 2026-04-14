import { redirect } from '@sveltejs/kit';
import { createLoginPath } from '$lib/authentication-navigation';
import { getAdminDashboardData } from '$lib/server/admin';
import { requireAdministrator } from '$lib/server/authorization';
import type { PageServerLoad } from './$types';

const requireAdminUser = (locals: App.Locals, url: URL): NonNullable<App.Locals['user']> => {
	if (!locals.user) {
		throw redirect(303, createLoginPath(`${url.pathname}${url.search}`));
	}

	return requireAdministrator(locals.user);
};

export const load: PageServerLoad = async ({ locals, url }) => {
	const currentUser = requireAdminUser(locals, url);
	return getAdminDashboardData(currentUser.id);
};
