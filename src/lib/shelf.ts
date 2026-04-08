export const shelfStatuses = ['to-read', 'reading', 'finished'] as const;

export type ShelfStatus = (typeof shelfStatuses)[number];

export type ShelfEntrySummary = {
	status: ShelfStatus;
	rating: number | null;
};

export const shelfStatusLabels: Record<ShelfStatus, string> = {
	'to-read': 'To read',
	reading: 'Reading',
	finished: 'Finished'
};

export const calculateShelfSummary = (entries: readonly ShelfEntrySummary[]) => {
	const summary = {
		totalBooks: entries.length,
		readingCount: entries.filter((entry) => entry.status === 'reading').length,
		finishedCount: entries.filter((entry) => entry.status === 'finished').length,
		averageRating: null as number | null
	};

	const ratings = entries
		.map((entry) => entry.rating)
		.filter((rating): rating is number => rating !== null);

	if (ratings.length > 0) {
		const totalRating = ratings.reduce((runningTotal, rating) => runningTotal + rating, 0);
		summary.averageRating = Number((totalRating / ratings.length).toFixed(1));
	}

	return summary;
};
