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
		description="The application shell is in place, but some routes and workflows are still being built out for the course."
	>
		<div class="mt-6 flex flex-wrap gap-3">
			<Button href="/">Back to home</Button>
			<Button href="/design-system" kind="secondary">Open the design system</Button>
		</div>
	</SurfaceCard>
</div>
