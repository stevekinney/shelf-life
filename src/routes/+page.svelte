<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import SurfaceCard from '$lib/components/surface-card.svelte';
	import { featuredBooks } from '$lib/sample-books';
</script>

<div class="space-y-12">
	<PageHeader
		eyebrow="Course starter"
		title="Shelf is the foundation for every verification loop in the course."
		description="Start with a clean SvelteKit application shell, a real book domain, and enough intentional UI to make later testing work feel grounded."
	>
		{#snippet actions()}
			<div class="flex flex-wrap gap-3">
				<Button href="/login">Sign in</Button>
				<Button href="/design-system" kind="secondary">View the design system</Button>
			</div>
		{/snippet}
	</PageHeader>

	<section class="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
		<SurfaceCard
			title="What is ready now"
			description="These are the starter surfaces in this first pass."
		>
			<div class="grid gap-3 sm:grid-cols-2">
				<div
					class="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] p-4"
				>
					<p class="text-sm font-semibold text-[var(--color-ink)]">Public home page</p>
					<p class="mt-2 text-sm text-[var(--color-muted)]">
						A clear starting point for the application and the course.
					</p>
				</div>
				<div
					class="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] p-4"
				>
					<p class="text-sm font-semibold text-[var(--color-ink)]">App-native auth</p>
					<p class="mt-2 text-sm text-[var(--color-muted)]">
						Email and password sign in now lives at <code>/login</code>.
					</p>
				</div>
				<div
					class="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] p-4"
				>
					<p class="text-sm font-semibold text-[var(--color-ink)]">Protected search and shelf</p>
					<p class="mt-2 text-sm text-[var(--color-muted)]">
						The course can now build real flows on top of stable starter routes.
					</p>
				</div>
				<div
					class="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] p-4"
				>
					<p class="text-sm font-semibold text-[var(--color-ink)]">Visual baseline</p>
					<p class="mt-2 text-sm text-[var(--color-muted)]">
						The design-system page is ready for screenshot-based checks.
					</p>
				</div>
			</div>
		</SurfaceCard>

		<SurfaceCard
			title="What comes next"
			description="These areas are intentionally deferred to later exercises."
		>
			<ul class="space-y-3 text-sm text-[var(--color-muted)]">
				<li>Open Library integration for real search results</li>
				<li>CRUD flows for shelf management and rating persistence</li>
				<li>Stats, goals, admin views, and full course verification loops</li>
				<li>HAR recording, dossiers, CI, and custom verification tools</li>
			</ul>
		</SurfaceCard>
	</section>

	<section class="space-y-5">
		<div class="space-y-2">
			<p
				class="text-xs font-semibold tracking-[0.22em] text-[var(--color-accent-strong)] uppercase"
			>
				Starter library
			</p>
			<h2 class="font-display text-3xl text-[var(--color-ink)]">
				Sample books used across the starter UI
			</h2>
			<p class="max-w-3xl text-sm text-[var(--color-muted)]">
				These are placeholder records for the shell, design system, and early tests. Real fetching
				and persistence arrive later.
			</p>
		</div>

		<div class="grid gap-5 lg:grid-cols-3">
			{#each featuredBooks as book (book.id)}
				<SurfaceCard
					title={book.title}
					description={book.description}
					padding="tight"
					className="h-full"
				>
					<p class="text-sm font-medium text-[var(--color-ink)]">{book.author}</p>
					<p class="mt-3 text-xs tracking-[0.2em] text-[var(--color-muted)] uppercase">
						Open Library placeholder: {book.openLibraryId}
					</p>
				</SurfaceCard>
			{/each}
		</div>
	</section>
</div>
