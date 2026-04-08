export type StarterBook = {
	id: string;
	openLibraryId: string;
	title: string;
	author: string;
	description: string;
	status?: 'to-read' | 'reading' | 'finished';
	rating?: number | null;
};

export const starterBooks: StarterBook[] = [
	{
		id: 'station-eleven',
		openLibraryId: 'OL26431919M',
		title: 'Station Eleven',
		author: 'Emily St. John Mandel',
		description:
			'A literary post-collapse novel with enough warmth to keep the starter app grounded.',
		status: 'reading',
		rating: 4
	},
	{
		id: 'piranesi',
		openLibraryId: 'OL27219525M',
		title: 'Piranesi',
		author: 'Susanna Clarke',
		description:
			'A compact, beautifully strange novel that makes a good search and card-layout fixture.',
		status: 'to-read',
		rating: null
	},
	{
		id: 'annihilation',
		openLibraryId: 'OL25416632M',
		title: 'Annihilation',
		author: 'Jeff VanderMeer',
		description: 'A sharp, memorable third fixture for search states, previews, and early tests.',
		status: 'finished',
		rating: 5
	}
];

export const featuredBooks = starterBooks.slice(0, 3);

export const searchStarterBooks = (query: string) => {
	const normalizedQuery = query.trim().toLowerCase();

	if (!normalizedQuery) {
		return starterBooks.slice();
	}

	return starterBooks.filter((book) => {
		return [book.title, book.author, book.openLibraryId].some((value) =>
			value.toLowerCase().includes(normalizedQuery)
		);
	});
};
