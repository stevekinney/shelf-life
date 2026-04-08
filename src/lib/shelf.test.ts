import { describe, expect, it } from 'vitest';
import { calculateShelfSummary } from './shelf';
import { searchStarterBooks } from './sample-books';

describe('calculateShelfSummary', () => {
	it('returns zero counts and a null average for an empty shelf', () => {
		expect(calculateShelfSummary([])).toEqual({
			totalBooks: 0,
			readingCount: 0,
			finishedCount: 0,
			averageRating: null
		});
	});

	it('counts reading and finished books while averaging ratings', () => {
		const summary = calculateShelfSummary([
			{ status: 'reading', rating: 4 },
			{ status: 'finished', rating: 5 },
			{ status: 'finished', rating: null }
		]);

		expect(summary).toEqual({
			totalBooks: 3,
			readingCount: 1,
			finishedCount: 2,
			averageRating: 4.5
		});
	});

	it('returns a null average when no ratings are present', () => {
		const summary = calculateShelfSummary([
			{ status: 'to-read', rating: null },
			{ status: 'reading', rating: null },
			{ status: 'finished', rating: null }
		]);

		expect(summary.averageRating).toBeNull();
	});
});

describe('searchStarterBooks', () => {
	it('returns the full starter library when the query is empty', () => {
		expect(searchStarterBooks('')).toHaveLength(3);
	});

	it('matches by title and author without case sensitivity', () => {
		expect(searchStarterBooks('piranesi')).toHaveLength(1);
		expect(searchStarterBooks('MANDEL')).toHaveLength(1);
	});

	it('returns an empty array when nothing matches', () => {
		expect(searchStarterBooks('nonexistent shelf query')).toEqual([]);
	});
});
