<script lang="ts">
	import type { StarterBook } from '$lib/sample-books';
	import { shelfStatusLabels } from '$lib/shelf';

	let { book }: { book: StarterBook } = $props();
</script>

<article
	aria-label={`${book.title} by ${book.author}`}
	class="grid gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]"
>
	<div class="flex items-start justify-between gap-4">
		<div>
			<h3 class="font-display text-2xl text-[var(--color-ink)]">{book.title}</h3>
			<p class="mt-1 text-sm font-medium text-[var(--color-muted)]">{book.author}</p>
		</div>

		{#if book.status}
			<span
				class="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[var(--color-accent-strong)] uppercase"
			>
				{shelfStatusLabels[book.status]}
			</span>
		{/if}
	</div>

	<p class="text-sm leading-6 text-[var(--color-muted)]">{book.description}</p>

	<div class="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-muted)]">
		<span>Open Library: {book.openLibraryId}</span>
		{#if book.rating !== undefined && book.rating !== null}
			<span class="font-semibold text-[var(--color-ink)]">Rating: {book.rating}/5</span>
		{/if}
	</div>
</article>
