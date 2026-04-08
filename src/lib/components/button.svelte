<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PathnameWithSearchOrHash } from '$app/types';
	import type { Snippet } from 'svelte';

	type ButtonKind = 'primary' | 'secondary' | 'ghost';
	type ButtonType = 'button' | 'submit' | 'reset';

	let {
		href,
		kind = 'primary',
		type = 'button',
		disabled = false,
		formaction,
		children
	}: {
		href?: PathnameWithSearchOrHash;
		kind?: ButtonKind;
		type?: ButtonType;
		disabled?: boolean;
		formaction?: string;
		children?: Snippet;
	} = $props();

	const classes = $derived(
		[
			'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
			kind === 'primary' &&
				'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-strong)]',
			kind === 'secondary' &&
				'border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]',
			kind === 'ghost' &&
				'bg-transparent text-[var(--color-muted)] hover:bg-white/60 hover:text-[var(--color-ink)]',
			disabled && 'cursor-not-allowed opacity-50'
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

{#if href}
	<a class={classes} href={resolve(href)} aria-disabled={disabled}>
		{@render children?.()}
	</a>
{:else}
	<button class={classes} {type} {disabled} {formaction}>
		{@render children?.()}
	</button>
{/if}
