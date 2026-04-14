import type { PageServerLoad } from './$types';
import { listFeaturedBooks } from '$lib/server/books';
import { featuredBooks as starterFeaturedBooks, type StarterBook } from '$lib/sample-books';

const mapFeaturedBookToCard = (book: {
	id: string;
	openLibraryId: string;
	title: string;
	author: string;
	description: string | null;
}): StarterBook => ({
	id: book.id,
	openLibraryId: book.openLibraryId,
	title: book.title,
	author: book.author,
	description: book.description ?? 'A featured title from the Shelf catalog.',
	rating: null
});

export const load: PageServerLoad = async () => {
	const configuredFeaturedBooks = await listFeaturedBooks();

	return {
		featuredBooks:
			configuredFeaturedBooks.length > 0
				? configuredFeaturedBooks.map(mapFeaturedBookToCard)
				: starterFeaturedBooks
	};
};
