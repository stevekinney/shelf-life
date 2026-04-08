<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import Button from './button.svelte';

	type AppShellUser = {
		name: string;
		email: string;
	} | null;

	let {
		currentPath,
		currentUser,
		children
	}: {
		currentPath: string;
		currentUser: AppShellUser;
		children: Snippet;
	} = $props();

	const linkClasses = (href: string) =>
		[
			'rounded-full px-3 py-2 text-sm font-medium transition',
			currentPath === href || currentPath.startsWith(`${href}/`)
				? 'bg-[var(--color-surface-soft)] text-[var(--color-ink)]'
				: 'text-[var(--color-muted)] hover:bg-white/60 hover:text-[var(--color-ink)]'
		].join(' ');
</script>

<div class="min-h-screen">
	<header
		class="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[rgba(246,241,231,0.9)] backdrop-blur"
	>
		<div
			class="mx-auto flex w-full max-w-[var(--page-width)] items-center justify-between gap-4 px-[var(--page-gutter)] py-4"
		>
			<div class="flex items-center gap-6">
				<a href={resolve('/')} class="font-display text-2xl font-semibold text-[var(--color-ink)]">
					Shelf
				</a>
				<nav class="hidden items-center gap-1 md:flex" aria-label="Primary">
					<a class={linkClasses('/')} href={resolve('/')}>Home</a>
					<a class={linkClasses('/design-system')} href={resolve('/design-system')}>
						Design system
					</a>
					{#if currentUser}
						<a class={linkClasses('/search')} href={resolve('/search')}>Search</a>
						<a class={linkClasses('/shelf')} href={resolve('/shelf')}>Shelf</a>
					{/if}
				</nav>
			</div>

			<div class="flex items-center gap-3">
				{#if currentUser}
					<div class="hidden text-right sm:block">
						<p class="text-sm font-semibold text-[var(--color-ink)]">{currentUser.name}</p>
						<p class="text-xs text-[var(--color-muted)]">{currentUser.email}</p>
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

	<main class="mx-auto w-full max-w-[var(--page-width)] px-[var(--page-gutter)] py-10 md:py-14">
		{@render children()}
	</main>
</div>
