<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		eyebrow,
		title,
		description,
		padding = 'normal',
		className = '',
		children
	}: {
		eyebrow?: string;
		title?: string;
		description?: string;
		padding?: 'normal' | 'tight';
		className?: string;
		children?: Snippet;
	} = $props();

	const paddingClass = $derived(padding === 'tight' ? 'p-5' : 'p-6 md:p-7');
</script>

<section
	class={`rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] ${paddingClass} ${className}`.trim()}
>
	{#if eyebrow || title || description}
		<div class="space-y-2">
			{#if eyebrow}
				<p
					class="text-xs font-semibold tracking-[0.22em] text-[var(--color-accent-strong)] uppercase"
				>
					{eyebrow}
				</p>
			{/if}
			{#if title}
				<h2 class="font-display text-2xl text-[var(--color-ink)]">{title}</h2>
			{/if}
			{#if description}
				<p class="text-sm leading-6 text-[var(--color-muted)]">{description}</p>
			{/if}
		</div>
	{/if}

	{#if children}
		<div class={eyebrow || title || description ? 'mt-5' : ''}>
			{@render children()}
		</div>
	{/if}
</section>
