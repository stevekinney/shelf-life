import { fail, isHttpError, redirect } from '@sveltejs/kit';
import { createLoginPath } from '$lib/authentication-navigation';
import {
	getAdminDashboardData,
	updateAdministratorAccess,
	updateFeaturedBook
} from '$lib/server/admin';
import { requireAdministrator } from '$lib/server/authorization';
import type { Actions, PageServerLoad } from './$types';

const requireAdminUser = (locals: App.Locals, url: URL): NonNullable<App.Locals['user']> => {
	if (!locals.user) {
		throw redirect(303, createLoginPath(`${url.pathname}${url.search}`));
	}

	return requireAdministrator(locals.user);
};

const parseFeaturedPosition = (value: FormDataEntryValue | null): number | null | 'invalid' => {
	const rawValue = value?.toString().trim() ?? '';
	if (!rawValue) {
		return null;
	}

	const parsed = Number(rawValue);
	if (!Number.isInteger(parsed) || parsed < 1) {
		return 'invalid';
	}

	return parsed;
};

const toFailureMessage = (error: unknown, fallbackMessage: string) => {
	if (isHttpError(error)) {
		return typeof error.body === 'string' ? error.body : (error.body?.message ?? fallbackMessage);
	}

	return fallbackMessage;
};

export const load: PageServerLoad = async ({ locals, url }) => {
	const currentUser = requireAdminUser(locals, url);
	return getAdminDashboardData(currentUser.id);
};

export const actions: Actions = {
	saveFeaturedBook: async ({ locals, request, url }) => {
		requireAdminUser(locals, url);

		const formData = await request.formData();
		const openLibraryId = formData.get('openLibraryId')?.toString().trim() ?? '';
		const parsedPosition = parseFeaturedPosition(formData.get('position'));

		if (!openLibraryId) {
			return fail(400, { tone: 'error', message: 'Choose a book before saving a featured slot.' });
		}

		if (parsedPosition === 'invalid') {
			return fail(400, {
				tone: 'error',
				message: 'Feature slots must be whole numbers starting at 1.'
			});
		}

		let updated;
		try {
			updated = await updateFeaturedBook(openLibraryId, parsedPosition);
		} catch (error) {
			if (isHttpError(error)) {
				return fail(error.status, {
					tone: 'error',
					message: toFailureMessage(error, 'That book could not be featured.')
				});
			}

			throw error;
		}

		return {
			tone: 'success',
			message:
				parsedPosition === null
					? `Removed ${updated.title} from the public featured list.`
					: `Featured ${updated.title} in slot ${parsedPosition}.`
		};
	},

	clearFeaturedBook: async ({ locals, request, url }) => {
		requireAdminUser(locals, url);

		const formData = await request.formData();
		const openLibraryId = formData.get('openLibraryId')?.toString().trim() ?? '';

		if (!openLibraryId) {
			return fail(400, {
				tone: 'error',
				message: 'Choose a book before clearing its featured slot.'
			});
		}

		let updated;
		try {
			updated = await updateFeaturedBook(openLibraryId, null);
		} catch (error) {
			if (isHttpError(error)) {
				return fail(error.status, {
					tone: 'error',
					message: toFailureMessage(error, 'That featured book could not be cleared.')
				});
			}

			throw error;
		}

		return {
			tone: 'success',
			message: `Removed ${updated.title} from the public featured list.`
		};
	},

	toggleUserAdmin: async ({ locals, request, url }) => {
		const currentUser = requireAdminUser(locals, url);
		const formData = await request.formData();
		const userId = formData.get('userId')?.toString().trim() ?? '';
		const nextIsAdmin = formData.get('nextIsAdmin')?.toString() === 'true';

		if (!userId) {
			return fail(400, { tone: 'error', message: 'Choose a user before changing their role.' });
		}

		let updatedUser;
		try {
			updatedUser = await updateAdministratorAccess({
				currentUserId: currentUser.id,
				targetUserId: userId,
				nextIsAdmin
			});
		} catch (error) {
			if (isHttpError(error)) {
				return fail(error.status, {
					tone: 'error',
					message: toFailureMessage(error, 'That role change could not be applied.')
				});
			}

			throw error;
		}

		return {
			tone: 'success',
			message: nextIsAdmin
				? `${updatedUser.name} can now administer Shelf.`
				: `${updatedUser.name} is now a reader-only account.`
		};
	}
};
