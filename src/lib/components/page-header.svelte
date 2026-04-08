<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		eyebrow,
		title,
		description,
		actions
	}: {
		eyebrow?: string;
		title: string;
		description?: string;
		actions?: Snippet;
	} = $props();
</script>

<div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
	<div class="max-w-3xl space-y-3">
		{#if eyebrow}
			<p
				class="text-xs font-semibold tracking-[0.22em] text-[var(--color-accent-strong)] uppercase"
			>
				{eyebrow}
			</p>
		{/if}
		<h1 class="font-display text-4xl text-[var(--color-ink)] md:text-5xl">{title}</h1>
		{#if description}
			<p class="max-w-2xl text-base leading-7 text-[var(--color-muted)]">{description}</p>
		{/if}
	</div>

	{#if actions}
		<div class="shrink-0">{@render actions()}</div>
	{/if}
</div>
