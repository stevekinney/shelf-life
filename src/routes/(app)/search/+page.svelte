<script lang="ts">
	import BookCard from '$lib/components/book-card.svelte';
	import Button from '$lib/components/button.svelte';
	import EmptyState from '$lib/components/empty-state.svelte';
	import Input from '$lib/components/input.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import SurfaceCard from '$lib/components/surface-card.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-8">
	<PageHeader
		eyebrow="Protected app surface"
		title="Search the starter library."
		description="This page already has the correct route, form shape, and results region. Live Open Library fetching is intentionally deferred to a later exercise."
	/>

	<SurfaceCard
		title="Starter search"
		description="Search currently filters the local starter dataset so the page has meaningful results and stable visual states."
	>
		<form class="grid gap-4 md:grid-cols-[1fr_auto]" method="GET">
			<Input
				label="Search by title, author, or Open Library identifier"
				name="query"
				value={data.query}
				placeholder="Try Station Eleven or Susanna Clarke"
			/>
			<div class="self-end">
				<Button type="submit">Search</Button>
			</div>
		</form>
	</SurfaceCard>

	{#if !data.query}
		<EmptyState
			title="Search is ready for real data later."
			message="The route, layout, form handling, and results region are in place. When the Open Library integration lands, it will slot into this page instead of replacing it."
		/>
	{:else if data.results.length === 0}
		<EmptyState
			title="No starter matches found."
			message={`The local starter dataset did not match “${data.query}”. This is expected for most queries until live integration is added.`}
		/>
	{:else}
		<section class="space-y-4">
			<div class="flex items-center justify-between gap-3">
				<h2 class="font-display text-3xl text-[var(--color-ink)]">Starter results</h2>
				<p class="text-sm text-[var(--color-muted)]">
					{data.results.length} result{data.results.length === 1 ? '' : 's'}
				</p>
			</div>

			<div class="grid gap-5 lg:grid-cols-2">
				{#each data.results as book (book.id)}
					<BookCard {book} />
				{/each}
			</div>
		</section>
	{/if}
</div>
