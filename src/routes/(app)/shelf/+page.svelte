<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/button.svelte';
	import EmptyState from '$lib/components/empty-state.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import RateBookDialog from '$lib/components/rate-book-dialog.svelte';
	import SurfaceCard from '$lib/components/surface-card.svelte';
	import { shelfStatusLabels } from '$lib/shelf';
	import type { PageData } from './$types';

	type ShelfEntryView = PageData['entries'][number];

	let { data }: { data: PageData } = $props();

	let pendingEntryId = $state<string | null>(null);
	let rateTarget = $state<ShelfEntryView | null>(null);
	let feedbackMessage = $state<{ tone: 'success' | 'error'; text: string } | null>(null);

	const openRatingDialog = (entry: ShelfEntryView) => {
		rateTarget = entry;
	};

	const isEntryPending = (entryId: string) => pendingEntryId === entryId;

	const readErrorMessage = async (response: Response, fallbackMessage: string) => {
		const body = (await response.json().catch(() => ({}))) as { error?: string };
		return body.error ?? fallbackMessage;
	};

	const updateShelfEntry = async (
		entry: ShelfEntryView,
		body: Record<string, unknown>,
		successMessage: string,
		errorMessage: string
	) => {
		feedbackMessage = null;
		pendingEntryId = entry.id;

		try {
			const response = await fetch(`/api/shelf/${entry.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (!response.ok) {
				feedbackMessage = {
					tone: 'error',
					text: await readErrorMessage(response, errorMessage)
				};
				return;
			}

			feedbackMessage = { tone: 'success', text: successMessage };
			await invalidateAll();
		} catch {
			feedbackMessage = { tone: 'error', text: 'Network error while updating your shelf.' };
		} finally {
			pendingEntryId = null;
		}
	};

	const markEntryAsRead = (entry: ShelfEntryView) =>
		updateShelfEntry(
			entry,
			{ status: 'finished' },
			`Marked ${entry.book.title} as read.`,
			'We could not mark that book as read.'
		);

	const removeEntry = async (entry: ShelfEntryView) => {
		feedbackMessage = null;
		pendingEntryId = entry.id;

		try {
			const response = await fetch(`/api/shelf/${entry.id}`, { method: 'DELETE' });
			if (!response.ok) {
				feedbackMessage = {
					tone: 'error',
					text: await readErrorMessage(response, 'We could not remove that book from your shelf.')
				};
				return;
			}

			if (rateTarget?.id === entry.id) {
				rateTarget = null;
			}

			feedbackMessage = {
				tone: 'success',
				text: `Removed ${entry.book.title} from your shelf.`
			};
			await invalidateAll();
		} catch {
			feedbackMessage = {
				tone: 'error',
				text: 'Network error while removing that book from your shelf.'
			};
		} finally {
			pendingEntryId = null;
		}
	};

	const handleRatingSubmitted = async (entryId: string, rating: number) => {
		feedbackMessage = null;
		pendingEntryId = entryId;
		try {
			const response = await fetch(`/api/shelf/${entryId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ rating })
			});
			if (!response.ok) {
				const body = (await response.json().catch(() => ({}))) as { error?: string };
				feedbackMessage = {
					tone: 'error',
					text: body.error ?? 'We could not save that rating.'
				};
				return;
			}
			feedbackMessage = {
				tone: 'success',
				text: `Thanks! Rating saved for ${rateTarget?.book.title ?? 'this book'}.`
			};
			await invalidateAll();
		} catch {
			feedbackMessage = { tone: 'error', text: 'Network error while saving the rating.' };
		} finally {
			pendingEntryId = null;
			rateTarget = null;
		}
	};
</script>

<div class="space-y-8">
	<PageHeader
		eyebrow="Protected app surface"
		title={`${data.user?.name ?? 'Your'} shelf`}
		description="Your reading list, with status and ratings."
	/>

	<section class="grid gap-5 md:grid-cols-3">
		<SurfaceCard title="Books on shelf" description="Total entries">
			<p class="font-display text-4xl text-[var(--color-ink)]">{data.summary.totalBooks}</p>
		</SurfaceCard>
		<SurfaceCard title="Currently reading" description="Active reads">
			<p class="font-display text-4xl text-[var(--color-ink)]">{data.summary.readingCount}</p>
		</SurfaceCard>
		<SurfaceCard title="Average rating" description="Out of 5">
			<p class="font-display text-4xl text-[var(--color-ink)]">
				{data.summary.averageRating ?? '—'}
			</p>
		</SurfaceCard>
	</section>

	<SurfaceCard
		title={`${data.readingGoal.year} reading goal`}
		description={data.readingGoal.targetBooks === null
			? 'Set your annual goal from the goals page to start tracking progress.'
			: `You've read ${data.readingGoal.finishedBooks} of ${data.readingGoal.targetBooks} books this year.`}
	>
		<div class="space-y-3">
			{#if data.readingGoal.targetBooks !== null}
				<div
					class="h-3 w-full overflow-hidden rounded-full bg-[var(--color-surface-soft)]"
					role="progressbar"
					aria-valuenow={data.readingGoal.percentage}
					aria-valuemin="0"
					aria-valuemax="100"
					aria-label={`${data.readingGoal.percentage} percent of annual reading goal met`}
				>
					<div
						class={`h-full ${data.readingGoal.goalMet ? 'bg-green-500' : 'bg-[var(--color-accent)]'} transition-all`}
						style:width={`${data.readingGoal.percentage}%`}
					></div>
				</div>
				{#if data.readingGoal.goalMet}
					<p
						role="status"
						aria-live="polite"
						class="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800"
					>
						You did it! Goal met for {data.readingGoal.year}.
					</p>
				{/if}
			{/if}
			<Button href="/goals" kind="ghost">Update your reading goal →</Button>
		</div>
	</SurfaceCard>

	{#if feedbackMessage}
		<div
			role="status"
			aria-live="polite"
			class={[
				'rounded-2xl border px-4 py-3 text-sm',
				feedbackMessage.tone === 'success'
					? 'border-green-200 bg-green-50 text-green-800'
					: 'border-red-200 bg-red-50 text-red-700'
			]}
		>
			{feedbackMessage.text}
		</div>
	{/if}

	{#if data.entries.length === 0}
		<EmptyState
			title="Your shelf is empty."
			message="Find a book to add to your reading list."
			actionLabel="Open search"
			actionHref="/search"
		/>
	{:else}
		<section class="space-y-4">
			<h2 class="font-display text-3xl text-[var(--color-ink)]">Your books</h2>
			<ul class="grid gap-5 lg:grid-cols-2">
				{#each data.entries as entry (entry.id)}
					<li>
						<article
							aria-label={`${entry.book.title} by ${entry.book.author}`}
							class="grid gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]"
						>
							<div class="flex items-start justify-between gap-4">
								<div>
									<h3 class="font-display text-2xl text-[var(--color-ink)]">{entry.book.title}</h3>
									<p class="mt-1 text-sm font-medium text-[var(--color-muted)]">
										{entry.book.author}
									</p>
								</div>
								<span
									class="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[var(--color-accent-strong)] uppercase"
								>
									{shelfStatusLabels[entry.status]}
								</span>
							</div>
							{#if entry.book.description}
								<p class="text-sm leading-6 text-[var(--color-muted)]">{entry.book.description}</p>
							{/if}
							<div class="flex flex-wrap items-center justify-between gap-3">
								<span class="text-xs text-[var(--color-muted)]">
									Open Library: {entry.book.openLibraryId}
								</span>
								<div class="flex flex-wrap items-center gap-3">
									{#if entry.rating !== null}
										<span class="text-sm font-semibold text-[var(--color-ink)]">
											Rated: {entry.rating}/5
										</span>
									{/if}
									<Button
										type="button"
										kind="secondary"
										disabled={isEntryPending(entry.id)}
										onclick={() => openRatingDialog(entry)}
									>
										Rate this book
									</Button>
									{#if entry.status !== 'finished'}
										<Button
											type="button"
											disabled={isEntryPending(entry.id)}
											onclick={() => markEntryAsRead(entry)}
										>
											Mark as read
										</Button>
									{/if}
									<Button
										type="button"
										kind="ghost"
										disabled={isEntryPending(entry.id)}
										onclick={() => removeEntry(entry)}
									>
										Remove from shelf
									</Button>
								</div>
							</div>
						</article>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>

{#if rateTarget}
	<RateBookDialog
		entry={rateTarget}
		oncancel={() => (rateTarget = null)}
		onsubmit={(rating) => handleRatingSubmitted(rateTarget!.id, rating)}
	/>
{/if}
