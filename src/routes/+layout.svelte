<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Button from '$lib/components/button.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	const titles: Record<string, string> = {
		'/': 'Home',
		'/login': 'Sign in',
		'/search': 'Search',
		'/shelf': 'Your shelf',
		'/goals': 'Reading goals',
		'/admin/goals': 'Reading goals',
		'/design-system': 'Design system',
		'/playground': 'Locator playground'
	};

	const title = $derived(titles[page.url.pathname] ?? 'Shelf');

	const baseLinkClasses = 'rounded-(--radius-control) px-3 py-2 text-sm font-medium transition';
	const activeLinkClasses = 'bg-(--color-surface-soft) text-(--color-ink)';
	const inactiveLinkClasses = 'text-(--color-muted) hover:bg-white/60 hover:text-(--color-ink)';

	const isCurrentPath = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{title} | Shelf</title>
	<meta
		name="description"
		content="Shelf helps you search for books, build a shelf, rate what you finish, and track your reading goals."
	/>
</svelte:head>

<div class="min-h-screen">
	<header
		class="sticky top-0 z-10 border-b border-(--color-border) bg-[rgba(246,241,231,0.9)] backdrop-blur"
	>
		<div
			class="mx-auto flex w-full max-w-(--page-width) items-center justify-between gap-4 px-(--page-gutter) py-4"
		>
			<div class="flex items-center gap-6">
				<a href={resolve('/')} class="font-display text-2xl font-semibold text-(--color-ink)">
					Shelf
				</a>
				<nav class="hidden items-center gap-1 md:flex" aria-label="Primary">
					<a
						class={[baseLinkClasses, isCurrentPath('/') ? activeLinkClasses : inactiveLinkClasses]}
						href={resolve('/')}
					>
						Home
					</a>
					<a
						class={[
							baseLinkClasses,
							isCurrentPath('/search') ? activeLinkClasses : inactiveLinkClasses
						]}
						href={resolve('/search')}
					>
						Search
					</a>
					<a
						class={[
							baseLinkClasses,
							isCurrentPath('/design-system') ? activeLinkClasses : inactiveLinkClasses
						]}
						href={resolve('/design-system')}
					>
						Design system
					</a>
					<a
						class={[
							baseLinkClasses,
							isCurrentPath('/playground') ? activeLinkClasses : inactiveLinkClasses
						]}
						href={resolve('/playground')}
					>
						Playground
					</a>
					{#if data.user}
						<a
							class={[
								baseLinkClasses,
								isCurrentPath('/shelf') ? activeLinkClasses : inactiveLinkClasses
							]}
							href={resolve('/shelf')}
						>
							Shelf
						</a>
						<a
							class={[
								baseLinkClasses,
								isCurrentPath('/goals') ? activeLinkClasses : inactiveLinkClasses
							]}
							href={resolve('/goals')}
						>
							Goals
						</a>
					{/if}
				</nav>
			</div>

			<div class="flex items-center gap-3">
				{#if data.user}
					<div class="hidden text-right sm:block">
						<p class="text-sm font-semibold text-(--color-ink)">{data.user.name}</p>
						<p class="text-xs text-(--color-muted)">{data.user.email}</p>
					</div>
					<form method="POST" action="/logout">
						<Button type="submit" kind="secondary">Sign out</Button>
					</form>
				{:else}
					<Button href="/login">Sign in</Button>
				{/if}
			</div>
		</div>
	</header>

	<main class="mx-auto w-full max-w-(--page-width) px-(--page-gutter) py-10 md:py-14">
		{@render children()}
	</main>
</div>
