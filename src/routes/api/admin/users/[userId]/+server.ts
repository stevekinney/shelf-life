import { error, json } from '@sveltejs/kit';
import { updateAdministratorAccess } from '$lib/server/admin';
import { requireAdministrator } from '$lib/server/authorization';
import type { RequestHandler } from './$types';

type PatchAdministratorBody = {
	isAdmin?: boolean;
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	const currentUser = requireAdministrator(locals.user);

	let body: PatchAdministratorBody;
	try {
		body = (await request.json()) as PatchAdministratorBody;
	} catch {
		error(400, 'Invalid JSON');
	}

	if (typeof body.isAdmin !== 'boolean') {
		error(400, 'isAdmin must be a boolean');
	}

	const updatedUser = await updateAdministratorAccess({
		currentUserId: currentUser.id,
		targetUserId: params.userId,
		nextIsAdmin: body.isAdmin
	});

	return json({ ok: true, user: updatedUser });
};
