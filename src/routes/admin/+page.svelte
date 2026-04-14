<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/button.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import SurfaceCard from '$lib/components/surface-card.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let feedback = $state<{ tone: 'success' | 'error'; message: string } | null>(null);
	let pendingKey = $state<string | null>(null);

	const inputClasses =
		'w-24 appearance-none rounded-(--radius-control) border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink) placeholder:text-(--color-muted) focus:border-(--color-border-strong) focus:ring-(--color-border-strong)';

	const extractMessage = async (response: Response, fallback: string) => {
		const body = (await response.json().catch(() => ({}))) as {
			error?: string;
			message?: string;
		};
		return body.error ?? body.message ?? fallback;
	};

	const parseFeaturedPosition = (raw: string): number | null | 'invalid' => {
		const trimmed = raw.trim();
		if (!trimmed) return null;
		const parsed = Number(trimmed);
		if (!Number.isInteger(parsed) || parsed < 1) return 'invalid';
		return parsed;
	};

	const saveFeaturedBook = async (event: SubmitEvent, openLibraryId: string) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget as HTMLFormElement);
		const position = parseFeaturedPosition(String(formData.get('position') ?? ''));

		if (position === 'invalid') {
			feedback = {
				tone: 'error',
				message: 'Feature slots must be whole numbers starting at 1.'
			};
			return;
		}

		pendingKey = `save:${openLibraryId}`;
		feedback = null;
		try {
			const response = await fetch('/api/admin/featured-books', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ openLibraryId, position })
			});
			if (!response.ok) {
				feedback = {
					tone: 'error',
					message: await extractMessage(response, 'That book could not be featured.')
				};
				return;
			}
			feedback = {
				tone: 'success',
				message:
					position === null
						? 'Removed that book from the public featured list.'
						: `Featured that book in slot ${position}.`
			};
			await invalidateAll();
		} catch {
			feedback = { tone: 'error', message: 'Network error while saving the featured book.' };
		} finally {
			pendingKey = null;
		}
	};

	const clearFeaturedBook = async (openLibraryId: string) => {
		pendingKey = `clear:${openLibraryId}`;
		feedback = null;
		try {
			const response = await fetch(
				`/api/admin/featured-books?openLibraryId=${encodeURIComponent(openLibraryId)}`,
				{ method: 'DELETE' }
			);
			if (!response.ok) {
				feedback = {
					tone: 'error',
					message: await extractMessage(response, 'That featured book could not be cleared.')
				};
				return;
			}
			feedback = {
				tone: 'success',
				message: 'Removed that book from the public featured list.'
			};
			await invalidateAll();
		} catch {
			feedback = { tone: 'error', message: 'Network error while clearing the featured book.' };
		} finally {
			pendingKey = null;
		}
	};

	const toggleUserAdmin = async (userId: string, nextIsAdmin: boolean, name: string) => {
		pendingKey = `user:${userId}`;
		feedback = null;
		try {
			const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isAdmin: nextIsAdmin })
			});
			if (!response.ok) {
				feedback = {
					tone: 'error',
					message: await extractMessage(response, 'That role change could not be applied.')
				};
				return;
			}
			feedback = {
				tone: 'success',
				message: nextIsAdmin
					? `${name} can now administer Shelf.`
					: `${name} is now a reader-only account.`
			};
			await invalidateAll();
		} catch {
			feedback = { tone: 'error', message: 'Network error while updating that user.' };
		} finally {
			pendingKey = null;
		}
	};
</script>

<div class="space-y-8">
	<PageHeader
		eyebrow="Administrator view"
		title="Admin dashboard"
		description="Manage the public featured books and who gets administrator access."
	>
		{#snippet actions()}
			<Button href="/admin/goals" kind="secondary">View reading-goal report</Button>
		{/snippet}
	</PageHeader>

	<section class="grid gap-5 md:grid-cols-3">
		<SurfaceCard title="Readers" description="Total accounts">
			<p class="font-display text-4xl text-(--color-ink)">{data.summary.totalReaders}</p>
		</SurfaceCard>
		<SurfaceCard title="Administrators" description="Can manage Shelf">
			<p class="font-display text-4xl text-(--color-ink)">{data.summary.adminUsers}</p>
		</SurfaceCard>
		<SurfaceCard title="Featured books" description="Shown on the public home page">
			<p class="font-display text-4xl text-(--color-ink)">{data.summary.featuredBooks}</p>
		</SurfaceCard>
	</section>

	{#if feedback}
		<div
			role="status"
			aria-live="polite"
			class={[
				'rounded-2xl border px-4 py-3 text-sm',
				feedback.tone === 'success'
					? 'border-green-200 bg-green-50 text-green-800'
					: 'border-red-200 bg-red-50 text-red-700'
			]}
		>
			{feedback.message}
		</div>
	{/if}

	<section class="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
		<SurfaceCard
			title="Current featured order"
			description="The public home page prefers these database-backed books and falls back to the starter samples until you choose some here."
		>
			{#if data.featuredBooks.length === 0}
				<p class="text-sm leading-6 text-(--color-muted)">
					No books are featured from the database yet. Add a few below and the public home page will
					switch from the starter samples to your curated list.
				</p>
			{:else}
				<ol class="space-y-3">
					{#each data.featuredBooks as book (book.id)}
						<li
							class="rounded-(--radius-control) border border-(--color-border) bg-(--color-surface-soft) p-4"
						>
							<div class="flex items-start justify-between gap-3">
								<div class="space-y-1">
									<p class="text-sm font-semibold text-(--color-ink)">{book.title}</p>
									<p class="text-sm text-(--color-muted)">{book.author}</p>
								</div>
								<span
									class="rounded-full bg-(--color-surface) px-3 py-1 text-xs font-semibold tracking-[0.16em] text-(--color-accent-strong) uppercase"
								>
									Slot {book.featuredPosition}
								</span>
							</div>
						</li>
					{/each}
				</ol>
			{/if}
		</SurfaceCard>

		<SurfaceCard
			title="Manage featured books"
			description="Assign a slot to any catalog book. Leave the field blank or clear it to remove that title from the public home page."
		>
			{#if data.books.length === 0}
				<p class="text-sm leading-6 text-(--color-muted)">
					There are no books in the local catalog yet. Add some through search or the seed helpers
					first, then come back here to curate the public home page.
				</p>
			{:else}
				<ul class="space-y-3">
					{#each data.books as book (book.id)}
						<li class="rounded-(--radius-control) border border-(--color-border) p-4">
							<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
								<div class="space-y-1">
									<p class="text-sm font-semibold text-(--color-ink)">{book.title}</p>
									<p class="text-sm text-(--color-muted)">{book.author}</p>
									<p class="text-xs text-(--color-muted)">Open Library: {book.openLibraryId}</p>
								</div>

								<form
									class="flex flex-wrap items-end gap-2"
									onsubmit={(event) => saveFeaturedBook(event, book.openLibraryId)}
								>
									<label class="grid gap-1 text-xs font-semibold text-(--color-ink)">
										<span>Home page slot</span>
										<input
											class={inputClasses}
											type="number"
											min="1"
											name="position"
											value={book.featuredPosition?.toString() ?? ''}
											placeholder="—"
										/>
									</label>
									<Button
										type="submit"
										kind="secondary"
										disabled={pendingKey === `save:${book.openLibraryId}`}
									>
										{pendingKey === `save:${book.openLibraryId}` ? 'Saving…' : 'Save'}
									</Button>
									{#if book.featuredPosition !== null}
										<Button
											type="button"
											kind="ghost"
											disabled={pendingKey === `clear:${book.openLibraryId}`}
											onclick={() => clearFeaturedBook(book.openLibraryId)}
										>
											{pendingKey === `clear:${book.openLibraryId}` ? 'Clearing…' : 'Clear'}
										</Button>
									{/if}
								</form>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</SurfaceCard>
	</section>

	<SurfaceCard
		title="Manage users"
		description="Promote trusted readers to administrator access or return them to a normal account."
	>
		<ul class="space-y-3">
			{#each data.users as user (user.id)}
				<li class="rounded-(--radius-control) border border-(--color-border) p-4">
					<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div class="space-y-1">
							<div class="flex flex-wrap items-center gap-2">
								<p class="text-sm font-semibold text-(--color-ink)">{user.name}</p>
								<span
									class={[
										'rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase',
										user.isAdmin
											? 'bg-(--color-surface-soft) text-(--color-accent-strong)'
											: 'bg-white/70 text-(--color-muted)'
									]}
								>
									{user.isAdmin ? 'Admin' : 'Reader'}
								</span>
								{#if user.id === data.currentUserId}
									<span
										class="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] text-green-800 uppercase"
									>
										Current session
									</span>
								{/if}
							</div>
							<p class="text-sm text-(--color-muted)">{user.email}</p>
						</div>

						<Button
							type="button"
							kind={user.isAdmin ? 'ghost' : 'secondary'}
							disabled={(user.id === data.currentUserId && user.isAdmin) ||
								pendingKey === `user:${user.id}`}
							onclick={() => toggleUserAdmin(user.id, !user.isAdmin, user.name)}
						>
							{#if pendingKey === `user:${user.id}`}
								Updating…
							{:else}
								{user.isAdmin ? 'Remove admin access' : 'Make administrator'}
							{/if}
						</Button>
					</div>
				</li>
			{/each}
		</ul>
	</SurfaceCard>
</div>
