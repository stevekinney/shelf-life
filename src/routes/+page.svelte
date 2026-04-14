<script lang="ts">
	import BookCard from '$lib/components/book-card.svelte';
	import Button from '$lib/components/button.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import SurfaceCard from '$lib/components/surface-card.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const productHighlights = [
		{
			title: 'Search with intent',
			description:
				'Look up books by title, author, or Open Library identifier, then bring the ones you care about onto your shelf.'
		},
		{
			title: 'Keep an honest shelf',
			description:
				'Move books from to-read to reading to finished so your list reflects what is actually happening.'
		},
		{
			title: 'Rate what you finish',
			description:
				'Leave yourself a quick verdict while the book is still fresh, so your shelf becomes a record and not just a queue.'
		},
		{
			title: 'Track the year clearly',
			description: 'Set an annual reading goal and see your progress every time you open the app.'
		}
	] as const;

	const readingFlow = [
		{
			title: 'Find the book',
			description:
				'Start with search when a recommendation, review, or impulse catch your attention.'
		},
		{
			title: 'Add it to your shelf',
			description:
				'Keep the titles you want to read, are reading now, or already finished in one place.'
		},
		{
			title: 'Finish with context',
			description: 'Mark the book as read, leave a rating, and keep your reading history useful.'
		}
	] as const;
</script>

<div class="space-y-12">
	<PageHeader
		eyebrow="Personal reading tracker"
		title="Build a shelf that remembers what you actually read."
		description="Shelf keeps your next read, your current stack, and the books you already finished in one calm place. Search the catalog, rate what you finish, and keep your reading goal in sight."
	>
		{#snippet actions()}
			<div class="flex flex-wrap gap-3">
				{#if data.user}
					<Button href="/shelf">Open your shelf</Button>
				{/if}
			</div>
		{/snippet}
	</PageHeader>

	<section class="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
		<SurfaceCard
			title="Everything you need to keep reading"
			description="Shelf stays focused on the few jobs a reading app should do well."
		>
			<div class="grid gap-3 sm:grid-cols-2">
				{#each productHighlights as highlight (highlight.title)}
					<div
						class="rounded-2xl border border-(--color-border-strong) bg-(--color-surface-soft) p-4"
					>
						<p class="text-sm font-semibold text-(--color-ink)">{highlight.title}</p>
						<p class="mt-2 text-sm text-(--color-muted)">{highlight.description}</p>
					</div>
				{/each}
			</div>
		</SurfaceCard>

		<SurfaceCard
			eyebrow="How Shelf works"
			title="From curiosity to finished"
			description="A reading list only helps if it stays honest. Shelf keeps the routine lightweight."
		>
			<ol class="space-y-4">
				{#each readingFlow as step, index (step.title)}
					<li class="flex gap-4">
						<span
							class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--color-surface-soft) text-sm font-semibold text-(--color-accent-strong)"
						>
							{index + 1}
						</span>
						<div class="space-y-1">
							<p class="text-sm font-semibold text-(--color-ink)">{step.title}</p>
							<p class="text-sm leading-6 text-(--color-muted)">{step.description}</p>
						</div>
					</li>
				{/each}
			</ol>
		</SurfaceCard>
	</section>

	<section class="space-y-5">
		<div class="space-y-2">
			<p class="text-xs font-semibold tracking-[0.22em] text-(--color-accent-strong) uppercase">
				On readers' shelves
			</p>
			<h2 class="font-display text-3xl text-(--color-ink)">A few books worth keeping close</h2>
			<p class="max-w-3xl text-sm text-(--color-muted)">
				Featured titles show the kind of record Shelf keeps: what the book is, where it sits in your
				reading life, and how you felt about it when you were done.
			</p>
		</div>

		<div class="grid gap-5 lg:grid-cols-3">
			{#each data.featuredBooks as book (book.id)}
				<BookCard {book} />
			{/each}
		</div>
	</section>
</div>
