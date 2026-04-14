<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import SurfaceCard from '$lib/components/surface-card.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-8">
	<PageHeader
		title={`Reading goals · ${data.summary.year}`}
		description="Aggregate progress across every reader with an account this year."
	/>

	<section class="grid gap-5 md:grid-cols-3">
		<SurfaceCard title="Readers" description="With a Shelf account">
			<p class="font-display text-4xl text-(--color-ink)">{data.summary.totalReaders}</p>
		</SurfaceCard>
		<SurfaceCard title="Readers with goals" description="Have set a target">
			<p class="font-display text-4xl text-(--color-ink)">{data.summary.readersWithGoal}</p>
		</SurfaceCard>
		<SurfaceCard title="Finished this year" description="Total books">
			<p class="font-display text-4xl text-(--color-ink)">{data.summary.totalFinished}</p>
		</SurfaceCard>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-3xl text-(--color-ink)">Per-reader progress</h2>
		{#if data.summary.perReader.length === 0}
			<p class="text-sm text-(--color-muted)">No readers yet.</p>
		{:else}
			<table class="w-full table-auto border-collapse text-sm">
				<thead>
					<tr class="border-b border-(--color-border) text-left text-(--color-muted)">
						<th scope="col" class="py-2 pr-4 font-semibold">Reader</th>
						<th scope="col" class="py-2 pr-4 font-semibold">Target</th>
						<th scope="col" class="py-2 pr-4 font-semibold">Finished</th>
						<th scope="col" class="py-2 pr-4 font-semibold">Progress</th>
					</tr>
				</thead>
				<tbody>
					{#each data.summary.perReader as reader (reader.userId)}
						<tr class="border-b border-(--color-border)">
							<td class="py-2 pr-4 text-(--color-ink)">{reader.name}</td>
							<td class="py-2 pr-4 text-(--color-ink)">{reader.targetBooks ?? '—'}</td>
							<td class="py-2 pr-4 text-(--color-ink)">{reader.finishedBooks}</td>
							<td class="py-2 pr-4 text-(--color-ink)">{reader.percentage}%</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>
</div>
