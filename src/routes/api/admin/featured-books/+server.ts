import { json } from '@sveltejs/kit';
import { getAdminDashboardData, updateFeaturedBook } from '$lib/server/admin';
import { requireAdministrator } from '$lib/server/authorization';
import type { RequestHandler } from './$types';

/**
 * Admin surface for featuring books on the public home page. Only Shelf
 * administrators may call this endpoint — `requireAdministrator` throws a 403
 * when the signed-in reader does not have administrator access.
 */

type FeatureBookBody = {
	openLibraryId?: string;
	position?: number | null;
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const currentUser = requireAdministrator(locals.user);

	let body: FeatureBookBody;
	try {
		body = (await request.json()) as FeatureBookBody;
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const openLibraryId = body.openLibraryId?.trim();
	if (!openLibraryId) {
		return json({ error: 'openLibraryId is required' }, { status: 400 });
	}

	const rawPosition = body.position;
	if (rawPosition !== null && rawPosition !== undefined) {
		if (typeof rawPosition !== 'number' || !Number.isInteger(rawPosition) || rawPosition < 1) {
			return json({ error: 'position must be null or an integer starting at 1' }, { status: 400 });
		}
	}

	const updated = await updateFeaturedBook(openLibraryId, rawPosition ?? null);

	return json({
		ok: true,
		book: {
			id: updated.id,
			openLibraryId: updated.openLibraryId,
			title: updated.title,
			featuredPosition: updated.featuredPosition
		},
		featuredBooks: (await getAdminDashboardData(currentUser.id)).featuredBooks
	});
};

export const PUT = POST;

export const GET: RequestHandler = async ({ locals }) => {
	const currentUser = requireAdministrator(locals.user);
	const dashboard = await getAdminDashboardData(currentUser.id);

	return json({
		books: dashboard.books,
		featuredBooks: dashboard.featuredBooks,
		summary: dashboard.summary
	});
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
	requireAdministrator(locals.user);

	const openLibraryId = url.searchParams.get('openLibraryId')?.trim();
	if (!openLibraryId) {
		return json({ error: 'openLibraryId is required' }, { status: 400 });
	}

	const updated = await updateFeaturedBook(openLibraryId, null);

	return json({
		ok: true,
		book: {
			id: updated.id,
			openLibraryId: updated.openLibraryId,
			title: updated.title,
			featuredPosition: updated.featuredPosition
		}
	});
};
