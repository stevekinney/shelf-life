<script lang="ts">
	import BookCard from '$lib/components/book-card.svelte';
	import Button from '$lib/components/button.svelte';
	import EmptyState from '$lib/components/empty-state.svelte';
	import Input from '$lib/components/input.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import SurfaceCard from '$lib/components/surface-card.svelte';
	import { featuredBooks } from '$lib/sample-books';
</script>

<div class="space-y-8">
	<PageHeader
		eyebrow="Visual baseline"
		title="Shelf design system"
		description="This page collects the small primitives introduced in the starter so visual tests have one stable, intentional target."
	/>

	<section class="grid gap-5 lg:grid-cols-2">
		<SurfaceCard title="Buttons" description="Primary, secondary, and ghost actions">
			<div class="flex flex-wrap gap-3">
				<Button>Primary action</Button>
				<Button kind="secondary">Secondary action</Button>
				<Button kind="ghost">Ghost action</Button>
			</div>
		</SurfaceCard>

		<SurfaceCard title="Inputs" description="Starter form field treatment">
			<div class="grid gap-4">
				<Input label="Email" name="design-email" type="email" placeholder="reader@example.com" />
				<Input
					label="Search"
					name="design-search"
					placeholder="Station Eleven"
					hint="Field help text is part of the visual baseline too."
				/>
			</div>
		</SurfaceCard>
	</section>

	<section class="grid gap-5 lg:grid-cols-[1fr_1fr]">
		<SurfaceCard title="Empty states" description="Starter messaging and action layout">
			<EmptyState
				title="No shelf entries yet"
				message="Empty states should still feel deliberate. This one is already styled for later CRUD and test work."
				actionLabel="Search for books"
				actionHref="/search"
			/>
		</SurfaceCard>

		<SurfaceCard
			title="Book card"
			description="Starter content card used in search, shelf, and tests"
		>
			<BookCard book={featuredBooks[0]} />
		</SurfaceCard>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-3xl text-[var(--color-ink)]">Starter library cards</h2>
		<div class="grid gap-5 lg:grid-cols-3">
			{#each featuredBooks as book (book.id)}
				<BookCard {book} />
			{/each}
		</div>
	</section>
</div>
