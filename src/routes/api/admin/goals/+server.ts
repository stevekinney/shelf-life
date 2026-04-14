import { error, json } from '@sveltejs/kit';
import { getAdminGoalDashboardData } from '$lib/server/admin';
import { requireAdministrator } from '$lib/server/authorization';
import type { RequestHandler } from './$types';

const parseYear = (value: string | null): number => {
	if (value === null) {
		return new Date().getUTCFullYear();
	}

	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed < 2000 || parsed > 9999) {
		error(400, 'year must be a four-digit integer');
	}

	return parsed;
};

export const GET: RequestHandler = async ({ locals, url }) => {
	requireAdministrator(locals.user);
	const year = parseYear(url.searchParams.get('year'));
	return json(await getAdminGoalDashboardData(year));
};
