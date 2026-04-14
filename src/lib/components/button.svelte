<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';

	type ButtonKind = 'primary' | 'secondary' | 'ghost';
	type ButtonType = 'button' | 'submit' | 'reset';

	// Only accept known page pathnames (no parameterized routes) so that
	// `resolve()` can type-check without a union distribution blow-up.
	type PagePathname =
		| '/'
		| '/login'
		| '/admin'
		| '/design-system'
		| '/playground'
		| '/search'
		| '/shelf'
		| '/goals'
		| '/admin/goals';

	let {
		href,
		kind = 'primary',
		type = 'button',
		disabled = false,
		formaction,
		onclick,
		children
	}: {
		href?: PagePathname;
		kind?: ButtonKind;
		type?: ButtonType;
		disabled?: boolean;
		formaction?: string;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
	} = $props();

	const classes = $derived(
		[
			'inline-flex items-center justify-center rounded-(--radius-control) px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent)',
			kind === 'primary' &&
				'bg-(--color-accent-strong) text-white hover:bg-(--color-accent-strongest)',
			kind === 'secondary' &&
				'border border-(--color-border-strong) bg-(--color-surface) text-(--color-ink) hover:bg-(--color-surface-soft)',
			kind === 'ghost' &&
				'bg-transparent text-(--color-muted) hover:bg-white/60 hover:text-(--color-ink)',
			disabled && 'cursor-not-allowed opacity-50'
		]
			.filter(Boolean)
			.join(' ')
	);

	const style = $derived(kind === 'primary' ? 'color: var(--color-surface);' : undefined);
</script>

{#if href}
	<a class={classes} href={resolve(href)} aria-disabled={disabled} {style}>
		{@render children?.()}
	</a>
{:else}
	<button class={classes} {style} {type} {disabled} {formaction} {onclick}>
		{@render children?.()}
	</button>
{/if}
