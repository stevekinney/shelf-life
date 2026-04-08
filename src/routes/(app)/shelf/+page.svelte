<script lang="ts">
	import BookCard from '$lib/components/book-card.svelte';
	import EmptyState from '$lib/components/empty-state.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import SurfaceCard from '$lib/components/surface-card.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-8">
	<PageHeader
		eyebrow="Protected app surface"
		title={`${data.user.name}'s shelf`}
		description="This route now exists as the authenticated home for a reader’s collection. Persistence and CRUD flows are intentionally still ahead of us."
	/>

	<section class="grid gap-5 md:grid-cols-3">
		<SurfaceCard title="Books on shelf" description="Starter summary">
			<p class="font-display text-4xl text-[var(--color-ink)]">{data.summary.totalBooks}</p>
		</SurfaceCard>
		<SurfaceCard title="Currently reading" description="Starter summary">
			<p class="font-display text-4xl text-[var(--color-ink)]">{data.summary.readingCount}</p>
		</SurfaceCard>
		<SurfaceCard title="Average rating" description="Starter summary">
			<p class="font-display text-4xl text-[var(--color-ink)]">
				{data.summary.averageRating ?? '—'}
			</p>
		</SurfaceCard>
	</section>

	<EmptyState
		title="Your shelf starts empty in this first pass."
		message="The route shell, summary blocks, and starter visual language are in place. Adding books, changing status, and persisting ratings are all future course exercises."
		actionLabel="Open search"
		actionHref="/search"
	/>

	<section class="space-y-4">
		<div class="space-y-2">
			<p
				class="text-xs font-semibold tracking-[0.22em] text-[var(--color-accent-strong)] uppercase"
			>
				Preview cards
			</p>
			<h2 class="font-display text-3xl text-[var(--color-ink)]">
				Starter book cards for future shelf flows
			</h2>
			<p class="max-w-2xl text-sm text-[var(--color-muted)]">
				These are here to establish the component shape and give the design-system and tests
				something real to render now.
			</p>
		</div>

		<div class="grid gap-5 lg:grid-cols-3">
			{#each data.featuredBooks as book (book.id)}
				<BookCard {book} />
			{/each}
		</div>
	</section>
</div>
