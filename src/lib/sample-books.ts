export type StarterBook = {
	id: string;
	openLibraryId: string;
	title: string;
	author: string;
	description: string;
	status?: 'to-read' | 'reading' | 'finished';
	rating?: number | null;
};

const starterBooks: StarterBook[] = [
	{
		id: 'station-eleven',
		openLibraryId: 'OL26431919M',
		title: 'Station Eleven',
		author: 'Emily St. John Mandel',
		description:
			'A traveling troupe keeps art, memory, and human connection alive after a devastating collapse.',
		status: 'reading',
		rating: 4
	},
	{
		id: 'piranesi',
		openLibraryId: 'OL27219525M',
		title: 'Piranesi',
		author: 'Susanna Clarke',
		description: 'An uncanny mystery set inside a vast house of tides, statues, and endless halls.',
		status: 'to-read',
		rating: null
	},
	{
		id: 'annihilation',
		openLibraryId: 'OL25416632M',
		title: 'Annihilation',
		author: 'Jeff VanderMeer',
		description:
			'A biologist joins a secretive expedition into a landscape that feels beautiful, hostile, and wrong.',
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
