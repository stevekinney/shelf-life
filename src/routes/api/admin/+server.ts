import { json } from '@sveltejs/kit';
import { getAdminDashboardData } from '$lib/server/admin';
import { requireAdministrator } from '$lib/server/authorization';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const currentUser = requireAdministrator(locals.user);
	return json(await getAdminDashboardData(currentUser.id));
};
