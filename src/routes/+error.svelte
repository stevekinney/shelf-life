<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/button.svelte';
	import SurfaceCard from '$lib/components/surface-card.svelte';

	const errorMessage = $derived(page.error?.message ?? 'Unexpected error');
</script>

<div class="mx-auto max-w-3xl py-16">
	<SurfaceCard
		eyebrow="Something went wrong"
		title={`${page.status}: ${errorMessage}`}
		description="The page may have moved, or Shelf hit a temporary problem while loading it."
	>
		<div class="mt-6 flex flex-wrap gap-3">
			<Button href="/">Back to home</Button>
			<Button href="/search" kind="secondary">Search books</Button>
		</div>
	</SurfaceCard>
</div>
