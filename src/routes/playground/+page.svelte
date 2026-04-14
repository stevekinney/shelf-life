<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import SurfaceCard from '$lib/components/surface-card.svelte';
	import RateBookDialog from '$lib/components/rate-book-dialog.svelte';

	let showDetails = $state(false);

	let dynamicItems = $state<string[]>([]);
	let isLoadingMore = $state(false);

	let contentLoaded = $state(false);

	let dialogOpen = $state(false);
	const mockEntry = {
		id: 'playground-book',
		rating: null as number | null,
		book: { title: 'Station Eleven', author: 'Emily St. John Mandel' }
	};

	let panelExpanded = $state(false);

	const playgroundInputClasses =
		'w-full appearance-none rounded-(--radius-control) border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm text-(--color-ink) placeholder:text-(--color-muted) focus:border-(--color-border-strong) focus:ring-(--color-border-strong)';

	const handleLoadMore = () => {
		isLoadingMore = true;
		setTimeout(() => {
			dynamicItems = [...dynamicItems, 'The Left Hand of Darkness', 'Kindred'];
			isLoadingMore = false;
		}, 500);
	};

	onMount(() => {
		const timer = setTimeout(() => {
			contentLoaded = true;
		}, 1000);
		return () => clearTimeout(timer);
	});
</script>

<div class="space-y-8">
	<PageHeader
		eyebrow="Locator practice"
		title="Locator playground"
		description="A page of common UI patterns for practicing Playwright locator strategies. Every section exercises a different part of the locator hierarchy."
	/>

	<!-- Section 1: Buttons -->
	<SurfaceCard title="Buttons" description="Role-based selection, name disambiguation, and scoping">
		<div class="space-y-4">
			<div class="flex flex-wrap gap-3">
				<Button>Add to shelf</Button>
				<Button kind="secondary">Remove from shelf</Button>
				<Button kind="ghost">Cancel</Button>
				<Button disabled={true}>Out of stock</Button>
			</div>

			<div class="flex gap-3">
				<button
					class="rounded-full border border-(--color-border-strong) bg-(--color-surface) px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
				>
					Delete
				</button>
				<button
					class="rounded-full border border-(--color-border-strong) bg-(--color-surface) px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
				>
					Delete
				</button>
			</div>

			<article
				aria-label="Piranesi by Susanna Clarke"
				class="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface-soft) p-4"
			>
				<h3 class="font-display text-xl text-(--color-ink)">Piranesi</h3>
				<p class="text-sm text-(--color-muted)">Susanna Clarke</p>
				<div class="mt-3">
					<button
						class="rounded-full bg-(--color-accent) px-4 py-2 text-sm font-semibold text-white hover:bg-(--color-accent-strong)"
					>
						Rate this book
					</button>
				</div>
			</article>
		</div>
	</SurfaceCard>

	<!-- Section 2: Form Fields -->
	<SurfaceCard title="Form fields" description="Labels, placeholders, hints, and ARIA attributes">
		<div class="grid gap-4 lg:grid-cols-2">
			<Input label="Book title" name="book-title" placeholder="Enter a title" />
			<Input
				label="Author"
				name="author"
				placeholder="Enter an author name"
				hint="Last name, first name"
			/>
			<Input label="Search" name="search" type="search" placeholder="Search books..." />
			<Input label="ISBN" name="isbn" disabled={true} placeholder="978-0-00-000000-0" />

			<div>
				<input type="text" placeholder="Unlabeled field" class={playgroundInputClasses} />
			</div>

			<div>
				<input
					type="text"
					aria-label="Secret notes"
					class={playgroundInputClasses}
					placeholder="This input has an aria-label"
				/>
			</div>
		</div>
	</SurfaceCard>

	<!-- Section 3: Text Content -->
	<SurfaceCard
		title="Text content"
		description="Exact matches, partial matches, and disambiguation"
	>
		<div class="grid gap-4 lg:grid-cols-3">
			<section class="rounded-(--radius-control) bg-(--color-surface-soft) p-4">
				<h3 class="text-sm font-semibold text-(--color-ink)">Exact match</h3>
				<div class="mt-3 space-y-2 text-sm text-(--color-ink)">
					<p>Station Eleven</p>
					<p>Piranesi</p>
					<p>Annihilation</p>
				</div>
			</section>

			<section class="rounded-(--radius-control) bg-(--color-surface-soft) p-4">
				<h3 class="text-sm font-semibold text-(--color-ink)">Partial match</h3>
				<div class="mt-3 space-y-2 text-sm text-(--color-ink)">
					<p>Currently reading Station Eleven by Emily St. John Mandel.</p>
					<p>This book has been on your shelf for 42 days.</p>
					<p>Add Station Eleven to your shelf to keep it handy.</p>
				</div>
			</section>

			<section class="rounded-(--radius-control) bg-(--color-surface-soft) p-4">
				<h3 class="text-sm font-semibold text-(--color-ink)">Disambiguation</h3>
				<div class="mt-3 space-y-2 text-sm text-(--color-ink)">
					<p>3 of 12 books finished</p>
					<p>You have 4 books on your shelf right now.</p>
					<p>You finished 4 books this year.</p>
					<p>4 books are waiting for a rating.</p>
				</div>
			</section>
		</div>
	</SurfaceCard>

	<!-- Section 4: Lists and Tables -->
	<SurfaceCard title="Lists and tables" description="List roles, list items, table structure">
		<div class="grid gap-6 lg:grid-cols-2">
			<div>
				<h3 class="font-display mb-2 text-lg text-(--color-ink)">Reading list</h3>
				<ul aria-label="Reading list" class="space-y-2">
					<li
						class="flex items-center justify-between rounded-lg border border-(--color-border) p-3"
					>
						<span class="text-sm text-(--color-ink)">Station Eleven</span>
						<button class="text-sm font-medium text-red-600 hover:text-red-700">Remove</button>
					</li>
					<li
						class="flex items-center justify-between rounded-lg border border-(--color-border) p-3"
					>
						<span class="text-sm text-(--color-ink)">Piranesi</span>
						<button class="text-sm font-medium text-red-600 hover:text-red-700">Remove</button>
					</li>
					<li
						class="flex items-center justify-between rounded-lg border border-(--color-border) p-3"
					>
						<span class="text-sm text-(--color-ink)">Annihilation</span>
						<button class="text-sm font-medium text-red-600 hover:text-red-700">Remove</button>
					</li>
					<li
						class="flex items-center justify-between rounded-lg border border-(--color-border) p-3"
					>
						<span class="text-sm text-(--color-ink)">The Left Hand of Darkness</span>
						<button class="text-sm font-medium text-red-600 hover:text-red-700">Remove</button>
					</li>
				</ul>
			</div>

			<div>
				<h3 class="font-display mb-2 text-lg text-(--color-ink)">Book ratings</h3>
				<table aria-label="Book ratings" class="w-full text-sm">
					<thead>
						<tr class="border-b border-(--color-border)">
							<th class="py-2 text-left font-semibold text-(--color-ink)">Title</th>
							<th class="py-2 text-left font-semibold text-(--color-ink)">Author</th>
							<th class="py-2 text-right font-semibold text-(--color-ink)">Rating</th>
						</tr>
					</thead>
					<tbody>
						<tr class="border-b border-(--color-border)">
							<td class="py-2 text-(--color-ink)">Station Eleven</td>
							<td class="py-2 text-(--color-muted)">Emily St. John Mandel</td>
							<td class="py-2 text-right text-(--color-ink)">4/5</td>
						</tr>
						<tr class="border-b border-(--color-border)">
							<td class="py-2 text-(--color-ink)">Annihilation</td>
							<td class="py-2 text-(--color-muted)">Jeff VanderMeer</td>
							<td class="py-2 text-right text-(--color-ink)">5/5</td>
						</tr>
						<tr>
							<td class="py-2 text-(--color-ink)">Piranesi</td>
							<td class="py-2 text-(--color-muted)">Susanna Clarke</td>
							<td class="py-2 text-right text-(--color-muted)">—</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</SurfaceCard>

	<!-- Section 5: Navigation -->
	<SurfaceCard title="Navigation" description="Navigation landmarks, links, and disambiguation">
		<div class="space-y-4">
			<nav aria-label="Breadcrumb">
				<ol class="flex items-center gap-2 text-sm">
					<li>
						<a href={resolve('/')} class="text-(--color-accent) hover:underline">Home</a>
					</li>
					<li class="text-(--color-muted)">/</li>
					<li>
						<a href={resolve('/shelf')} class="text-(--color-accent) hover:underline">Shelf</a>
					</li>
					<li class="text-(--color-muted)">/</li>
					<li class="text-(--color-ink)">Station Eleven</li>
				</ol>
			</nav>

			<div class="flex gap-4">
				<a href={resolve('/playground')} class="text-sm text-(--color-accent) hover:underline"
					>View details</a
				>
				<a href={resolve('/playground')} class="text-sm text-(--color-accent) hover:underline"
					>Edit book</a
				>
				<a href={resolve('/playground')} class="text-sm text-(--color-accent) hover:underline"
					>View details</a
				>
			</div>
		</div>
	</SurfaceCard>

	<!-- Section 6: Status Indicators -->
	<SurfaceCard title="Status indicators" description="Live regions, status roles, and dynamic text">
		<div class="space-y-3">
			<div class="flex items-center gap-2">
				<span
					class="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500"
					aria-hidden="true"
				></span>
				<span role="status" class="text-sm text-(--color-ink)">Syncing...</span>
			</div>
			<div aria-live="polite" class="text-sm text-green-700">Book saved successfully</div>
			<div class="flex gap-2">
				<span
					class="rounded-full border border-(--color-border-strong) bg-(--color-surface-soft) px-3 py-1 text-xs font-semibold tracking-[0.16em] text-(--color-accent-strong) uppercase"
					>To read</span
				>
				<span
					class="rounded-full border border-(--color-border-strong) bg-(--color-surface-soft) px-3 py-1 text-xs font-semibold tracking-[0.16em] text-(--color-accent-strong) uppercase"
					>Reading</span
				>
				<span
					class="rounded-full border border-(--color-border-strong) bg-(--color-surface-soft) px-3 py-1 text-xs font-semibold tracking-[0.16em] text-(--color-accent-strong) uppercase"
					>Finished</span
				>
			</div>
		</div>
	</SurfaceCard>

	<!-- Section 7: Dialogs -->
	<SurfaceCard title="Dialogs" description="Modal dialog interaction, radio buttons, form actions">
		<Button onclick={() => (dialogOpen = true)}>Rate this book</Button>

		{#if dialogOpen}
			<RateBookDialog
				entry={mockEntry}
				onsubmit={(rating) => {
					mockEntry.rating = rating;
					dialogOpen = false;
				}}
				oncancel={() => (dialogOpen = false)}
			/>
		{/if}
	</SurfaceCard>

	<!-- Section 8: Dynamic Content -->
	<SurfaceCard
		title="Dynamic content"
		description="Show/hide, async loading, and auto-retrying assertions"
	>
		<div class="space-y-4">
			<div>
				<button
					onclick={() => (showDetails = !showDetails)}
					class="rounded-full border border-(--color-border-strong) bg-(--color-surface) px-4 py-2 text-sm font-semibold text-(--color-ink) hover:bg-(--color-surface-soft)"
				>
					{showDetails ? 'Hide details' : 'Show details'}
				</button>
				{#if showDetails}
					<p class="mt-3 text-sm text-(--color-ink)">
						Station Eleven is a post-apocalyptic novel by Emily St. John Mandel, published in 2014.
					</p>
				{/if}
			</div>

			<div>
				<button
					onclick={handleLoadMore}
					disabled={isLoadingMore}
					class="rounded-full border border-(--color-border-strong) bg-(--color-surface) px-4 py-2 text-sm font-semibold text-(--color-ink) hover:bg-(--color-surface-soft) disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isLoadingMore ? 'Loading...' : 'Load more'}
				</button>
				{#if dynamicItems.length > 0}
					<ul class="mt-3 space-y-1" aria-label="Newly loaded books">
						{#each dynamicItems as item (item)}
							<li class="text-sm text-(--color-ink)">{item}</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div>
				{#if !contentLoaded}
					<p class="text-sm text-(--color-muted)">Loading...</p>
				{:else}
					<p class="text-sm text-(--color-ink)">Content loaded</p>
				{/if}
			</div>
		</div>
	</SurfaceCard>

	<!-- Section 9: ARIA Attributes -->
	<SurfaceCard
		title="ARIA attributes"
		description="Alerts, expanded state, progress bars, and landmark navigation"
	>
		<div class="space-y-4">
			<div
				role="alert"
				class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800"
			>
				Unsaved changes will be lost
			</div>

			<div>
				<button
					aria-expanded={panelExpanded}
					aria-controls="expandable-panel"
					onclick={() => (panelExpanded = !panelExpanded)}
					class="rounded-full border border-(--color-border-strong) bg-(--color-surface) px-4 py-2 text-sm font-semibold text-(--color-ink) hover:bg-(--color-surface-soft)"
				>
					Toggle panel
				</button>
				{#if panelExpanded}
					<div
						id="expandable-panel"
						class="mt-3 rounded-lg border border-(--color-border) bg-(--color-surface-soft) p-4 text-sm text-(--color-ink)"
					>
						This panel is controlled by the toggle button above. It uses aria-expanded and
						aria-controls to communicate its state.
					</div>
				{/if}
			</div>

			<div>
				<div class="mb-1 text-sm text-(--color-ink)">Reading progress</div>
				<div
					role="progressbar"
					aria-valuenow={65}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label="Reading progress"
					class="h-3 w-full overflow-hidden rounded-full bg-(--color-surface-soft)"
				>
					<div class="h-full rounded-full bg-(--color-accent)" style="width: 65%"></div>
				</div>
				<div class="mt-1 text-xs text-(--color-muted)">65% complete</div>
			</div>

			<nav aria-label="Pagination" class="flex items-center gap-1">
				<button
					class="rounded-lg border border-(--color-border) px-3 py-1 text-sm text-(--color-muted) hover:bg-(--color-surface-soft)"
					aria-label="Page 1"
				>
					1
				</button>
				<button
					class="rounded-lg border border-(--color-accent) bg-(--color-accent) px-3 py-1 text-sm text-white"
					aria-label="Page 2"
					aria-current="page"
				>
					2
				</button>
				<button
					class="rounded-lg border border-(--color-border) px-3 py-1 text-sm text-(--color-muted) hover:bg-(--color-surface-soft)"
					aria-label="Page 3"
				>
					3
				</button>
			</nav>
		</div>
	</SurfaceCard>

	<!-- Section 10: Test ID Fallbacks -->
	<SurfaceCard
		title="Test ID fallbacks"
		description="Legitimate cases where data-testid is the right choice"
	>
		<div class="space-y-4">
			<div data-testid="book-count" class="text-sm text-(--color-ink)">12 books</div>

			<div
				data-testid="custom-widget"
				class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-(--color-border) bg-(--color-surface-soft)"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-(--color-muted)"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M8 12h8" />
					<path d="M12 8v8" />
				</svg>
			</div>
		</div>
	</SurfaceCard>

	<!-- Section 11: Anti-patterns -->
	<SurfaceCard
		title="Anti-patterns"
		description="Inaccessible markup that resists role-based locators. Finding these should be hard—that's the point."
	>
		<div class="space-y-4">
			<!-- A div pretending to be a button (intentional anti-pattern for teaching) -->
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
			<div
				onclick={() => {}}
				class="inline-flex cursor-pointer items-center rounded-full bg-(--color-accent) px-4 py-2 text-sm font-semibold text-white hover:bg-(--color-accent-strong)"
				data-testid="fake-button"
			>
				Click me (I'm a div)
			</div>

			<!-- A span pretending to be a link -->
			<div>
				<span
					class="cursor-pointer text-sm text-(--color-accent) underline"
					data-testid="fake-link"
				>
					I look like a link (I'm a span)
				</span>
			</div>

			<!-- An input with nothing to identify it -->
			<div>
				<input
					type="text"
					class="w-full max-w-xs rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink)"
					data-testid="unlocalizable-input"
				/>
			</div>

			<!-- An icon-only button with no accessible name -->
			<!-- svelte-ignore a11y_consider_explicit_label -->
			<button
				class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--color-border-strong) bg-(--color-surface) hover:bg-(--color-surface-soft)"
				data-testid="icon-only-button"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
					class="text-(--color-muted)"
				>
					<path
						d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
					/>
				</svg>
			</button>
		</div>
	</SurfaceCard>
</div>
