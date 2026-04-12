<script lang="ts">
	import { page } from '$app/state';
	import AppShell from '$lib/components/app-shell.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	const titles = {
		'/': 'Shelf',
		'/login': 'Sign in | Shelf',
		'/search': 'Search | Shelf',
		'/shelf': 'Your shelf | Shelf',
		'/design-system': 'Design system | Shelf',
		'/playground': 'Locator playground | Shelf'
	};

	const title = $derived(titles[page.url.pathname as keyof typeof titles] ?? 'Shelf');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{title}</title>
	<meta
		name="description"
		content="Shelf helps you search for books, build a shelf, rate what you finish, and track your reading goals."
	/>
</svelte:head>

<AppShell currentPath={page.url.pathname} currentUser={data.user}>
	{@render children()}
</AppShell>
