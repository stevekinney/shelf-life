import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { hashPassword } from '$lib/server/password';

export type CreateUserInput = {
	email: string;
	password: string;
	name: string;
	isAdmin?: boolean;
};

export type PublicUser = Pick<
	typeof user.$inferSelect,
	'id' | 'name' | 'email' | 'isAdmin' | 'createdAt' | 'updatedAt'
>;

export const publicUserColumns = {
	id: user.id,
	name: user.name,
	email: user.email,
	isAdmin: user.isAdmin,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt
} as const;

export const toPublicUser = (record: typeof user.$inferSelect): PublicUser => ({
	id: record.id,
	name: record.name,
	email: record.email,
	isAdmin: record.isAdmin,
	createdAt: record.createdAt,
	updatedAt: record.updatedAt
});

export const findUserByEmail = async (email: string) => {
	const [found] = await db.select().from(user).where(eq(user.email, email)).limit(1);
	return found ?? null;
};

export const createUser = async ({
	email,
	password,
	name,
	isAdmin = false
}: CreateUserInput): Promise<typeof user.$inferSelect> => {
	const passwordHash = await hashPassword(password);
	const [created] = await db
		.insert(user)
		.values({ email, name, passwordHash, isAdmin })
		.returning();

	if (!created) {
		throw new Error(`Failed to create user ${email}`);
	}

	return created;
};

export const listUsers = async (): Promise<Array<typeof user.$inferSelect>> => {
	return db.select().from(user);
};

export const listPublicUsers = async (): Promise<Array<PublicUser>> => {
	return db.select(publicUserColumns).from(user);
};

export const setUserAdminStatus = async (
	userId: string,
	isAdmin: boolean
): Promise<typeof user.$inferSelect | null> => {
	const [updated] = await db.update(user).set({ isAdmin }).where(eq(user.id, userId)).returning();
	return updated ?? null;
};

export const deleteAllUsers = async (): Promise<void> => {
	await db.delete(user);
};
