<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		label,
		name,
		type = 'text',
		value = '',
		placeholder = '',
		required = false,
		autocomplete,
		hint,
		disabled = false
	}: {
		label: string;
		name: string;
		type?: HTMLInputAttributes['type'];
		value?: string;
		placeholder?: string;
		required?: boolean;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		hint?: string;
		disabled?: boolean;
	} = $props();

	const inputId = $props.id();
	const describedBy = $derived(hint ? `${inputId}-hint` : undefined);
</script>

<label class="grid gap-2 text-sm font-medium text-[var(--color-ink)]" for={inputId}>
	<span>{label}</span>
	<input
		class="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-border-strong)] focus:ring-[var(--color-border-strong)]"
		id={inputId}
		{name}
		{type}
		{placeholder}
		{required}
		{autocomplete}
		{disabled}
		aria-describedby={describedBy}
		{value}
	/>
	{#if hint}
		<span id={describedBy} class="text-xs font-normal text-[var(--color-muted)]">{hint}</span>
	{/if}
</label>
