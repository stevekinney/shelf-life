import { error } from '@sveltejs/kit';
import { listBooks, listFeaturedBooks, setFeaturedBookPosition } from '$lib/server/books';
import { getAdministratorGoalSummary } from '$lib/server/reading-goals';
import {
	listPublicUsers,
	listUsers,
	setUserAdminStatus,
	toPublicUser,
	type PublicUser
} from '$lib/server/users';

const sortAdministrativeUsers = (users: Array<PublicUser>): Array<PublicUser> =>
	users
		.slice()
		.sort(
			(a, b) =>
				Number(b.isAdmin) - Number(a.isAdmin) ||
				a.name.localeCompare(b.name) ||
				a.email.localeCompare(b.email)
		);

export const getAdminDashboardData = async (currentUserId: string) => {
	const [books, featuredBooks, users] = await Promise.all([
		listBooks(),
		listFeaturedBooks(),
		listPublicUsers()
	]);

	const sortedUsers = sortAdministrativeUsers(users);

	return {
		currentUserId,
		books,
		featuredBooks,
		users: sortedUsers,
		summary: {
			totalReaders: sortedUsers.length,
			adminUsers: sortedUsers.filter((user) => user.isAdmin).length,
			featuredBooks: featuredBooks.length
		}
	};
};

export const getAdminGoalDashboardData = async (year: number) => ({
	summary: await getAdministratorGoalSummary(year)
});

export const updateFeaturedBook = async (
	openLibraryId: string,
	featuredPosition: number | null
) => {
	const updated = await setFeaturedBookPosition(openLibraryId, featuredPosition);
	if (!updated) {
		error(404, 'Book not found');
	}

	return updated;
};

export const updateAdministratorAccess = async ({
	currentUserId,
	targetUserId,
	nextIsAdmin
}: {
	currentUserId: string;
	targetUserId: string;
	nextIsAdmin: boolean;
}): Promise<PublicUser> => {
	const users = await listUsers();
	const targetUser = users.find((user) => user.id === targetUserId);

	if (!targetUser) {
		error(404, 'User not found');
	}

	const adminCount = users.filter((user) => user.isAdmin).length;

	if (!nextIsAdmin && targetUser.id === currentUserId) {
		error(400, 'You cannot remove your own administrator access from this page.');
	}

	if (!nextIsAdmin && targetUser.isAdmin && adminCount === 1) {
		error(400, 'Shelf needs at least one administrator account.');
	}

	const updatedUser = await setUserAdminStatus(targetUser.id, nextIsAdmin);
	if (!updatedUser) {
		error(404, 'User not found');
	}

	return toPublicUser(updatedUser);
};
