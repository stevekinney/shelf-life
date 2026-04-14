import { and, asc, eq, isNotNull, not } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { book } from '$lib/server/db/schema';

export type CreateBookInput = {
	openLibraryId: string;
	title: string;
	author: string;
	description?: string | null;
	featuredPosition?: number | null;
};

export const createBook = async ({
	openLibraryId,
	title,
	author,
	description = null,
	featuredPosition = null
}: CreateBookInput): Promise<typeof book.$inferSelect> => {
	const [created] = await db
		.insert(book)
		.values({ openLibraryId, title, author, description, featuredPosition })
		.returning();

	if (!created) {
		throw new Error(`Failed to create book ${openLibraryId}`);
	}

	return created;
};

export const findBookByOpenLibraryId = async (openLibraryId: string) => {
	const [found] = await db
		.select()
		.from(book)
		.where(eq(book.openLibraryId, openLibraryId))
		.limit(1);

	return found ?? null;
};

export const listBooks = async (): Promise<Array<typeof book.$inferSelect>> => {
	return db.select().from(book).orderBy(asc(book.title), asc(book.author));
};

export const listFeaturedBooks = async (): Promise<Array<typeof book.$inferSelect>> => {
	return db
		.select()
		.from(book)
		.where(isNotNull(book.featuredPosition))
		.orderBy(asc(book.featuredPosition), asc(book.title));
};

export const setFeaturedBookPosition = async (
	openLibraryId: string,
	featuredPosition: number | null
): Promise<typeof book.$inferSelect | null> => {
	const existing = await findBookByOpenLibraryId(openLibraryId);

	if (!existing) {
		return null;
	}

	if (featuredPosition !== null) {
		await db
			.update(book)
			.set({ featuredPosition: null })
			.where(and(eq(book.featuredPosition, featuredPosition), not(eq(book.id, existing.id))));
	}

	const [updated] = await db
		.update(book)
		.set({ featuredPosition })
		.where(eq(book.id, existing.id))
		.returning();

	return updated ?? null;
};

export const deleteAllBooks = async (): Promise<void> => {
	await db.delete(book);
};
