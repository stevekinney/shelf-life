import { randomBytes } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user, session } from '$lib/server/db/schema';
import { verifyPassword } from '$lib/server/password';
import {
	createUser,
	findUserByEmail,
	listUsers,
	publicUserColumns,
	type PublicUser
} from '$lib/server/users';
import { eq, and, gt } from 'drizzle-orm';

const COOKIE_NAME = 'shelf_session';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

function generateSessionToken(): string {
	return randomBytes(32).toString('hex');
}

async function createSession(userId: string, cookies: Cookies): Promise<void> {
	const token = generateSessionToken();
	const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

	await db.insert(session).values({ token, expiresAt, userId });

	cookies.set(COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		maxAge: SESSION_MAX_AGE
	});
}

export async function signUp(
	email: string,
	password: string,
	name: string,
	cookies: Cookies
): Promise<void> {
	const existing = await findUserByEmail(email);
	if (existing) throw new Error('An account with that email already exists.');

	const isFirstUser = (await listUsers()).length === 0;
	const newUser = await createUser({ name, email, password, isAdmin: isFirstUser });

	await createSession(newUser.id, cookies);
}

export async function signIn(email: string, password: string, cookies: Cookies): Promise<void> {
	const [found] = await db.select().from(user).where(eq(user.email, email)).limit(1);
	if (!found) throw new Error('Invalid email or password.');

	const valid = await verifyPassword(password, found.passwordHash);
	if (!valid) throw new Error('Invalid email or password.');

	await createSession(found.id, cookies);
}

export async function signOut(cookies: Cookies): Promise<void> {
	const token = cookies.get(COOKIE_NAME);
	if (token) {
		await db.delete(session).where(eq(session.token, token));
	}
	cookies.delete(COOKIE_NAME, { path: '/' });
}

export async function getSessionUser(
	token: string
): Promise<{ user: PublicUser; session: typeof session.$inferSelect } | null> {
	const now = new Date();
	const [row] = await db
		.select({ session, user: publicUserColumns })
		.from(session)
		.innerJoin(user, eq(session.userId, user.id))
		.where(and(eq(session.token, token), gt(session.expiresAt, now)))
		.limit(1);

	if (!row) return null;
	return { user: row.user, session: row.session };
}
