import { json } from '@sveltejs/kit';
import { requireAdministrator } from '$lib/server/authorization';
import { listPublicUsers } from '$lib/server/users';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const currentUser = requireAdministrator(locals.user);
	const users = await listPublicUsers();

	return json({
		currentUserId: currentUser.id,
		users: users
			.slice()
			.sort(
				(a, b) =>
					Number(b.isAdmin) - Number(a.isAdmin) ||
					a.name.localeCompare(b.name) ||
					a.email.localeCompare(b.email)
			)
	});
};
