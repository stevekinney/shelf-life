<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import SurfaceCard from '$lib/components/surface-card.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let localProgress = $state<typeof data.progress | null>(null);
	const progress = $derived(localProgress ?? data.progress);
	let errorMessage = $state<string | null>(null);
	let savedAt = $state<string | null>(null);
	let isSaving = $state(false);

	const progressLabel = $derived(
		progress.targetBooks === null
			? "You haven't set a reading goal for this year yet."
			: `You've read ${progress.finishedBooks} of ${progress.targetBooks} books this year.`
	);

	const progressBarColor = $derived(progress.goalMet ? 'bg-green-500' : 'bg-(--color-accent)');

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault();
		errorMessage = null;
		savedAt = null;

		const formData = new FormData(event.currentTarget as HTMLFormElement);
		const targetBooks = Number.parseInt(String(formData.get('targetBooks') ?? ''), 10);
		if (!Number.isInteger(targetBooks) || targetBooks < 1 || targetBooks > 999) {
			errorMessage = 'Enter a whole number between 1 and 999.';
			return;
		}

		isSaving = true;
		try {
			const response = await fetch('/api/goals', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ targetBooks })
			});
			if (!response.ok) {
				const body = (await response.json().catch(() => ({}))) as { message?: string };
				errorMessage = body.message ?? 'Could not save your goal.';
				return;
			}
			const payload = (await response.json()) as {
				progress: typeof data.progress;
				savedAt: string;
			};
			localProgress = payload.progress;
			savedAt = payload.savedAt;
		} catch {
			errorMessage = 'Network error while saving your goal.';
		} finally {
			isSaving = false;
		}
	};
</script>

<div class="space-y-8">
	<PageHeader
		eyebrow="Reading goals"
		title={`Your ${progress.year} reading goal`}
		description="Set an annual target and track how close you are to meeting it."
	/>

	<section class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
		<SurfaceCard
			title="This year's progress"
			description={`Finished books in ${progress.year} count toward your goal.`}
		>
			<div class="space-y-4">
				<p class="font-display text-3xl text-(--color-ink)" aria-label="Reading progress summary">
					{progressLabel}
				</p>

				{#if progress.targetBooks !== null}
					<div
						class="h-3 w-full overflow-hidden rounded-full bg-(--color-surface-soft)"
						role="progressbar"
						aria-valuenow={progress.percentage}
						aria-valuemin="0"
						aria-valuemax="100"
						aria-label={`${progress.percentage} percent of annual reading goal met`}
					>
						<div
							class={`h-full ${progressBarColor} transition-all`}
							style:width={`${progress.percentage}%`}
						></div>
					</div>
					<p class="text-sm text-(--color-muted)">
						{progress.percentage}% of the way there.
					</p>
				{/if}

				{#if progress.goalMet}
					<p
						role="status"
						aria-live="polite"
						class="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800"
					>
						You did it! Goal met for {progress.year}.
					</p>
				{/if}
			</div>
		</SurfaceCard>

		<SurfaceCard
			title="Set your annual goal"
			description="Change your target for the year. Only whole numbers between 1 and 999."
		>
			<form class="space-y-4" onsubmit={handleSubmit}>
				<Input
					label="Target books for the year"
					name="targetBooks"
					type="number"
					value={String(progress.targetBooks ?? '')}
					hint="Saving this overwrites any previous target for this year."
				/>
				{#if errorMessage}
					<p class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{errorMessage}
					</p>
				{/if}
				{#if savedAt}
					<p
						role="status"
						aria-live="polite"
						class="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
					>
						Saved your {progress.year} goal.
					</p>
				{/if}
				<Button type="submit" disabled={isSaving}>
					{isSaving ? 'Saving…' : 'Save goal'}
				</Button>
			</form>
		</SurfaceCard>
	</section>
</div>
