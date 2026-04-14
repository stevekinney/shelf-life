import { error, json } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { book, shelfEntry } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

export type ShelfLookupEntry = {
	shelfEntryId: string;
	rating: number | null;
};

export type ShelfLookupResponse = {
	entries: Record<string, ShelfLookupEntry>;
};

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) {
		error(401, 'Sign in to look up your shelf.');
	}

	const raw = url.searchParams.get('openLibraryIds')?.trim() ?? '';
	const openLibraryIds = raw
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean);

	if (openLibraryIds.length === 0) {
		return json({ entries: {} } satisfies ShelfLookupResponse);
	}

	const rows = await db
		.select({ entry: shelfEntry, book })
		.from(shelfEntry)
		.innerJoin(book, eq(shelfEntry.bookId, book.id))
		.where(and(eq(shelfEntry.userId, locals.user.id), inArray(book.openLibraryId, openLibraryIds)));

	const entries: Record<string, ShelfLookupEntry> = {};
	for (const row of rows) {
		entries[row.book.openLibraryId] = {
			shelfEntryId: row.entry.id,
			rating: row.entry.rating
		};
	}

	return json({ entries } satisfies ShelfLookupResponse);
};
