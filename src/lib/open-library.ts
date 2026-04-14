export type OpenLibrarySearchResult = {
	openLibraryId: string;
	title: string;
	author: string;
	description: string | null;
	publishedYear: number | null;
};

type OpenLibraryRawDoc = {
	key?: string;
	cover_edition_key?: string;
	edition_key?: string[];
	title?: string;
	author_name?: string[];
	first_publish_year?: number;
	first_sentence?: string[];
};

type OpenLibraryRawResponse = {
	docs?: OpenLibraryRawDoc[];
};

export const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org';
const SEARCH_LIMIT = 10;
const NETWORK_TIMEOUT_MS = 4000;

const pickIdentifier = (doc: OpenLibraryRawDoc): string | null => {
	if (doc.cover_edition_key) return doc.cover_edition_key;
	if (doc.edition_key && doc.edition_key[0]) return doc.edition_key[0];
	if (doc.key) return doc.key.replace('/works/', '');
	return null;
};

const normalizeDoc = (doc: OpenLibraryRawDoc): OpenLibrarySearchResult | null => {
	const openLibraryId = pickIdentifier(doc);
	if (!openLibraryId || !doc.title) return null;
	return {
		openLibraryId,
		title: doc.title,
		author: doc.author_name?.[0] ?? 'Unknown author',
		description: doc.first_sentence?.[0] ?? null,
		publishedYear: doc.first_publish_year ?? null
	};
};

type SearchOptions = {
	baseUrl?: string;
	fetch?: typeof fetch;
	signal?: AbortSignal;
};

/**
 * Searches the Open Library work index for the given query. Returns an empty
 * array on network failure or non-2xx response.
 */
export const searchOpenLibrary = async (
	query: string,
	options: SearchOptions = {}
): Promise<OpenLibrarySearchResult[]> => {
	const trimmedQuery = query.trim();
	if (!trimmedQuery) return [];

	const { baseUrl = OPEN_LIBRARY_BASE_URL, fetch: fetchImpl = fetch, signal } = options;

	const searchUrl = new URL('/search.json', baseUrl);
	searchUrl.searchParams.set('q', trimmedQuery);
	searchUrl.searchParams.set('limit', String(SEARCH_LIMIT));
	searchUrl.searchParams.set(
		'fields',
		'key,cover_edition_key,edition_key,title,author_name,first_publish_year,first_sentence'
	);

	const abortController = new AbortController();
	const timeoutHandle = setTimeout(() => abortController.abort(), NETWORK_TIMEOUT_MS);
	const onExternalAbort = () => abortController.abort();
	signal?.addEventListener('abort', onExternalAbort);

	try {
		const response = await fetchImpl(searchUrl.toString(), {
			headers: { Accept: 'application/json' },
			signal: abortController.signal
		});
		if (!response.ok) return [];
		const payload = (await response.json()) as OpenLibraryRawResponse;
		const docs = payload.docs ?? [];
		return docs
			.map(normalizeDoc)
			.filter((value): value is OpenLibrarySearchResult => value !== null);
	} catch {
		return [];
	} finally {
		clearTimeout(timeoutHandle);
		signal?.removeEventListener('abort', onExternalAbort);
	}
};
